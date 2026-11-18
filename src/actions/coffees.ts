"use server";
import { COFFEES_TO_EXCHANGE } from "@/lib/constants";
import { db } from "@/db";
import { clients } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { isUuid } from "@/lib/uuid";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { captureServerEvent } from "./ph-client";
import { isAdmin, UNAUTHORIZED } from "@/lib/auth-guards";
import { verifyClientToken } from "@/lib/wallet/token";
import { notifyPassChanged } from "@/lib/wallet/apns";
import { currentShop } from "@/lib/shop";

// Every action returns this so the admin UI can show the error (or a success toast).
export type ActionResult =
  | { error: string }
  | {
      ok: true;
      name?: string | null;
      id?: string;
      coffees?: number;
      // "redeemed" = the card was full and this scan/click redeemed the free coffee.
      action?: "added" | "redeemed";
    };

// Adds (+1) or removes (-1) one coffee. Never trusts a count sent by the browser:
// reads the current value and updates only if nobody changed it in the meantime.
type ClientRow = {
  email: string | null;
  name: string | null;
  coffees: number;
  totalCoffees: number;
  rewardsRedeemed: number;
  lastCoffeeAt: string | null;
  rewardEarnedAt: string | null;
  lastChange: string | null;
};
type ChangeResult =
  | { error: string }
  | { client: ClientRow; newCount: number };

const daysSince = (iso: string | null) =>
  iso ? Math.floor((Date.now() - Date.parse(iso)) / 86_400_000) : null;

// Every coffee event says which shop it happened in (cookie picked in /admin) and refreshes the
// person's lifetime stats in PostHog, which is what makes cohorts like "no coffee in 30 days" possible.
const track = async (
  email: string | null,
  event: string,
  properties: Record<string, unknown>,
  person?: Record<string, unknown>
) => {
  if (!email) return;
  captureServerEvent({
    distinctId: email,
    event,
    properties: { ...properties, shop: await currentShop() },
    set: person,
  });
};

const CLIENT_COLUMNS = {
  email: clients.email,
  name: clients.name,
  coffees: clients.coffees,
  totalCoffees: clients.totalCoffees,
  rewardsRedeemed: clients.rewardsRedeemed,
  lastCoffeeAt: clients.lastCoffeeAt,
  rewardEarnedAt: clients.rewardEarnedAt,
  lastChange: clients.lastChange,
};

// Reads never throw: a malformed id or a DB error is "client not found" to the caller.
const readClient = async (id: string): Promise<ClientRow | null> => {
  if (!isUuid(id)) return null;
  try {
    const [client] = await db.select(CLIENT_COLUMNS).from(clients).where(eq(clients.id, id));
    return client ?? null;
  } catch (error) {
    console.error("Error reading client:", error);
    return null;
  }
};

// Only updates if nobody changed the count in the meantime (optimistic concurrency on `coffees`).
const updateIfCoffees = async (
  id: string,
  expectedCoffees: number,
  patch: Partial<typeof clients.$inferInsert>
) => {
  try {
    const rows = await db
      .update(clients)
      .set(patch)
      .where(and(eq(clients.id, id), eq(clients.coffees, expectedCoffees)))
      .returning({ id: clients.id });
    return rows.length > 0;
  } catch (error) {
    console.error("Error updating client:", error);
    return false;
  }
};

const changeCoffees = async (
  id: string,
  delta: 1 | -1
): Promise<ChangeResult> => {
  const client = await readClient(id);
  if (!client) return { error: "Cliente no encontrado." };
  if (delta === 1 && client.coffees >= COFFEES_TO_EXCHANGE) {
    return { error: "Este cliente ya tiene su café gratis." };
  }
  if (delta === -1 && client.coffees <= 0) {
    return { error: "Este cliente no tiene cafés." };
  }

  const newCount = client.coffees + delta;
  const patch =
    delta === 1
      ? {
          coffees: newCount,
          totalCoffees: client.totalCoffees + 1,
          lastCoffeeAt: new Date().toISOString(),
          lastChange: "added",
          // Reaching the goal starts the "reward pending" clock.
          ...(newCount === COFFEES_TO_EXCHANGE && {
            rewardEarnedAt: new Date().toISOString(),
          }),
        }
      : {
          coffees: newCount,
          totalCoffees: Math.max(0, client.totalCoffees - 1),
          lastChange: "removed",
          rewardEarnedAt: null,
        };
  if (!(await updateIfCoffees(id, client.coffees, patch))) {
    return {
      error:
        delta === 1
          ? "No se pudo sumar el café. Intenta de nuevo."
          : "No se pudo quitar el café. Intenta de nuevo.",
    };
  }

  return { client, newCount };
};

type RedeemSource = "scan" | "button" | "dialog";

// Redeems the free coffee: the card goes back to 0 and the redemption is counted. Shared by the
// scanner (a scan on a full card), the "Canjear" button and the adjust dialog.
const applyRedeem = async (
  id: string,
  source: RedeemSource
): Promise<ActionResult> => {
  const client = await readClient(id);
  if (!client) return { error: "Cliente no encontrado." };
  if (client.coffees < COFFEES_TO_EXCHANGE) {
    return { error: "Este cliente todavía no completa su tarjeta." };
  }

  const ok = await updateIfCoffees(id, client.coffees, {
    coffees: 0,
    rewardsRedeemed: client.rewardsRedeemed + 1,
    rewardEarnedAt: null,
    lastChange: "redeemed",
  });
  if (!ok) return { error: "No se pudo canjear el café. Intenta de nuevo." };

  await track(
    client.email,
    "reward_redeemed",
    {
      source,
      coffees_before: client.coffees,
      rewards_redeemed: client.rewardsRedeemed + 1,
      days_since_earned: daysSince(client.rewardEarnedAt),
    },
    { coffees: 0, rewards_redeemed: client.rewardsRedeemed + 1 }
  );
  notifyPassChanged(id);

  revalidatePath("/admin");
  return { ok: true, name: client.name, id, coffees: 0, action: "redeemed" };
};

// Shared by the "+1" button and the QR scanner: one place for the update, analytics and push.
const applyCoffeeAdded = async (
  id: string,
  source: "button" | "scan"
): Promise<ActionResult> => {
  const result = await changeCoffees(id, 1);
  if ("error" in result) return result;
  const { client, newCount } = result;

  const totalCoffees = client.totalCoffees + 1;
  const cycle = client.rewardsRedeemed + 1;
  await track(
    client.email,
    "coffee_added",
    {
      coffees: newCount,
      source,
      total_coffees: totalCoffees,
      cycle,
      is_first_coffee: client.totalCoffees === 0,
      days_since_last_coffee: daysSince(client.lastCoffeeAt),
    },
    {
      coffees: newCount,
      total_coffees: totalCoffees,
      last_coffee_at: new Date().toISOString(),
    }
  );
  if (newCount === COFFEES_TO_EXCHANGE) {
    await track(client.email, "reward_earned", { cycle, total_coffees: totalCoffees });
  }
  notifyPassChanged(id);

  revalidatePath("/admin");
  return { ok: true, name: client.name, id, coffees: newCount, action: "added" };
};

export const addCoffee = async (formData: FormData): Promise<ActionResult> => {
  if (!(await isAdmin())) return UNAUTHORIZED;
  return applyCoffeeAdded(formData.get("id") as string, "button");
};

// Called by /admin/scan with whatever the camera or the scanner gun read.
export const addCoffeeByToken = async (token: string): Promise<ActionResult> => {
  if (!(await isAdmin())) return UNAUTHORIZED;
  const id = verifyClientToken(token);
  if (!id) return { error: "Código no válido. No es una tarjeta de Reset." };
  // A scan on a full card redeems the free coffee instead of adding one.
  const current = await readClient(id);
  const result =
    current && current.coffees >= COFFEES_TO_EXCHANGE
      ? await applyRedeem(id, "scan")
      : await applyCoffeeAdded(id, "scan");
  // A deleted client that signed in again has a new id, so their old pass points nowhere.
  if ("error" in result && result.error === "Cliente no encontrado.") {
    return {
      error:
        "Cliente no encontrado. Pídele que vuelva a agregar su tarjeta a Wallet.",
    };
  }
  return result;
};

// Fixes a coffee added by mistake (the "Deshacer" toast and the adjust dialog).
export const removeCoffee = async (
  formData: FormData
): Promise<ActionResult> => {
  if (!(await isAdmin())) return UNAUTHORIZED;
  const id = formData.get("id") as string;
  const result = await changeCoffees(id, -1);
  if ("error" in result) return result;
  const { client, newCount } = result;

  await track(
    client.email,
    "coffee_removed",
    { coffees: newCount },
    { coffees: newCount, total_coffees: Math.max(0, client.totalCoffees - 1) }
  );
  notifyPassChanged(id);

  revalidatePath("/admin");
  return { ok: true, name: client.name, id, coffees: newCount };
};

export const redeemCoffee = async (
  formData: FormData
): Promise<ActionResult> => {
  if (!(await isAdmin())) return UNAUTHORIZED;
  return applyRedeem(formData.get("id") as string, "button");
};

// "Deshacer" after a redemption: only valid while the card is still at 0 from that redemption.
export const undoRedeem = async (
  formData: FormData
): Promise<ActionResult> => {
  if (!(await isAdmin())) return UNAUTHORIZED;
  const id = formData.get("id") as string;
  const client = await readClient(id);
  if (!client) return { error: "Cliente no encontrado." };
  if (client.coffees !== 0 || client.lastChange !== "redeemed") {
    return { error: "Ya no se puede deshacer este canje." };
  }

  const ok = await updateIfCoffees(id, 0, {
    coffees: COFFEES_TO_EXCHANGE,
    rewardsRedeemed: Math.max(0, client.rewardsRedeemed - 1),
    rewardEarnedAt: new Date().toISOString(),
    lastChange: "restored",
  });
  if (!ok) return { error: "No se pudo deshacer el canje. Intenta de nuevo." };

  await track(
    client.email,
    "reward_redeem_undone",
    {},
    { coffees: COFFEES_TO_EXCHANGE, rewards_redeemed: Math.max(0, client.rewardsRedeemed - 1) }
  );
  notifyPassChanged(id);

  revalidatePath("/admin");
  return { ok: true, name: client.name, id, coffees: COFFEES_TO_EXCHANGE };
};

// Manual reset to 0. On a full card this is a redemption (what baristas used before the
// "Canjear" button), so it goes through applyRedeem and counts as one.
export const resetCoffee = async (
  FormData: FormData
): Promise<ActionResult> => {
  if (!(await isAdmin())) return UNAUTHORIZED;

  const id = FormData.get("id") as string;
  const before = await readClient(id);
  if (before && before.coffees >= COFFEES_TO_EXCHANGE) {
    return applyRedeem(id, "dialog");
  }
  if (!before) return { error: "Cliente no encontrado." };

  try {
    await db
      .update(clients)
      .set({ coffees: 0, rewardEarnedAt: null, lastChange: "reset" })
      .where(eq(clients.id, id));
  } catch (error) {
    console.error("Error resetting coffee:", error);
    return { error: "No se pudo reiniciar los cafés. Intenta de nuevo." };
  }

  await track(
    before.email,
    "coffee_reset",
    { coffees_before: before.coffees },
    { coffees: 0 }
  );
  notifyPassChanged(id);

  revalidatePath("/admin");
  return { ok: true };
};

export const deleteCoffee = async (
  FormData: FormData
): Promise<ActionResult> => {
  if (!(await isAdmin())) return UNAUTHORIZED;

  const id = FormData.get("id") as string;
  if (!isUuid(id)) return { error: "Cliente no encontrado." };

  let removed: { email: string | null; coffees: number } | undefined;
  try {
    [removed] = await db
      .delete(clients)
      .where(eq(clients.id, id))
      .returning({ email: clients.email, coffees: clients.coffees });
  } catch (error) {
    console.error("Error deleting coffee:", error);
    return { error: "No se pudo borrar al cliente. Intenta de nuevo." };
  }

  await track(removed?.email ?? null, "client_deleted", { coffees: removed?.coffees });

  revalidatePath("/admin");
  // redirect() works by throwing, so it must stay outside any try/catch.
  redirect("/admin");
};
