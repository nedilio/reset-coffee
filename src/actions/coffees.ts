"use server";
import { COFFEES_TO_EXCHANGE, TABLE_NAME } from "@/lib/constants";
import { createClient } from "@/supabase-server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { captureServerEvent } from "./ph-client";
import { isAdmin, UNAUTHORIZED } from "@/lib/auth-guards";
import { verifyClientToken } from "@/lib/wallet/token";
import { notifyPassChanged } from "@/lib/wallet/apns";

// Every action returns this so the admin UI can show the error (or a success toast).
export type ActionResult =
  | { error: string }
  | { ok: true; name?: string | null; id?: string; coffees?: number };

// Adds (+1) or removes (-1) one coffee. Never trusts a count sent by the browser:
// reads the current value and updates only if nobody changed it in the meantime.
type ChangeResult =
  | { error: string }
  | {
      client: { email: string | null; name: string | null; coffees: number };
      newCount: number;
    };

const changeCoffees = async (
  id: string,
  delta: 1 | -1
): Promise<ChangeResult> => {
  const supabase = await createClient();
  const { data: client, error: readError } = await supabase
    .from(TABLE_NAME)
    .select("email, name, coffees")
    .eq("id", id)
    .maybeSingle();

  if (readError || !client) {
    console.error("Error reading client to change coffees:", readError);
    return { error: "Cliente no encontrado." };
  }
  if (delta === 1 && client.coffees >= COFFEES_TO_EXCHANGE) {
    return { error: "Este cliente ya tiene su café gratis." };
  }
  if (delta === -1 && client.coffees <= 0) {
    return { error: "Este cliente no tiene cafés." };
  }

  const newCount = client.coffees + delta;
  const { data: updated, error: updateError } = await supabase
    .from(TABLE_NAME)
    .update({ coffees: newCount })
    .eq("id", id)
    .eq("coffees", client.coffees)
    .select("id");

  if (updateError || !updated?.length) {
    console.error("Error changing coffees:", updateError);
    return {
      error:
        delta === 1
          ? "No se pudo sumar el café. Intenta de nuevo."
          : "No se pudo quitar el café. Intenta de nuevo.",
    };
  }

  return { client, newCount };
};

// Shared by the "+1" button and the QR scanner: one place for the update, analytics and push.
const applyCoffeeAdded = async (
  id: string,
  source: "button" | "scan"
): Promise<ActionResult> => {
  const result = await changeCoffees(id, 1);
  if ("error" in result) return result;
  const { client, newCount } = result;

  captureServerEvent({
    distinctId: client.email!,
    event: "coffee_added",
    properties: { coffees: newCount, source },
  });
  if (newCount === COFFEES_TO_EXCHANGE) {
    captureServerEvent({ distinctId: client.email!, event: "reward_earned" });
  }
  notifyPassChanged(id);

  revalidatePath("/admin");
  return { ok: true, name: client.name, id, coffees: newCount };
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
  const result = await applyCoffeeAdded(id, "scan");
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

  captureServerEvent({
    distinctId: client.email!,
    event: "coffee_removed",
    properties: { coffees: newCount },
  });
  notifyPassChanged(id);

  revalidatePath("/admin");
  return { ok: true, name: client.name, id, coffees: newCount };
};

export const resetCoffee = async (
  FormData: FormData
): Promise<ActionResult> => {
  if (!(await isAdmin())) return UNAUTHORIZED;
  const supabase = await createClient();

  const id = FormData.get("id") as string;
  // Needed to tell a redeemed reward from a manual correction (analytics only).
  const { data: before } = await supabase
    .from(TABLE_NAME)
    .select("email, coffees")
    .eq("id", id)
    .maybeSingle();

  // supabase-js returns errors instead of throwing, so they must be read from the result.
  const { error } = await supabase
    .from(TABLE_NAME)
    .update({ coffees: 0 })
    .eq("id", id);

  if (error) {
    console.error("Error resetting coffee:", error);
    return { error: "No se pudo reiniciar los cafés. Intenta de nuevo." };
  }

  if (before?.email) {
    captureServerEvent({
      distinctId: before.email,
      event:
        before.coffees >= COFFEES_TO_EXCHANGE
          ? "reward_redeemed"
          : "coffee_reset",
      properties: { coffees_before: before.coffees },
    });
  }
  notifyPassChanged(id);

  revalidatePath("/admin");
  return { ok: true };
};

export const deleteCoffee = async (
  FormData: FormData
): Promise<ActionResult> => {
  if (!(await isAdmin())) return UNAUTHORIZED;
  const supabase = await createClient();

  const id = FormData.get("id") as string;
  const { data: deleted, error } = await supabase
    .from(TABLE_NAME)
    .delete()
    .eq("id", id)
    .select("email, coffees");

  if (error) {
    console.error("Error deleting coffee:", error);
    return { error: "No se pudo borrar al cliente. Intenta de nuevo." };
  }

  const removed = deleted?.[0];
  if (removed?.email) {
    captureServerEvent({
      distinctId: removed.email,
      event: "client_deleted",
      properties: { coffees: removed.coffees },
    });
  }

  revalidatePath("/admin");
  // redirect() works by throwing, so it must stay outside any try/catch.
  redirect("/admin");
};
