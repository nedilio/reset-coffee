"use server";
import { COFFEES_TO_EXCHANGE, TABLE_NAME } from "@/lib/constants";
import { createClient } from "@/supabase-server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { captureServerEvent } from "./ph-client";
import { isAdmin, UNAUTHORIZED } from "@/lib/auth-guards";

export const addCoffee = async (formData: FormData) => {
  if (!(await isAdmin())) return UNAUTHORIZED;
  const supabase = await createClient();
  const id = formData.get("id") as string;

  // Never trust the count sent by the browser: read the current value from the DB.
  const { data: client, error: readError } = await supabase
    .from(TABLE_NAME)
    .select("email, coffees")
    .eq("id", id)
    .maybeSingle();

  if (readError || !client) {
    console.error("Error reading client to add coffee:", readError);
    return { error: "Client not found." };
  }
  if (client.coffees >= COFFEES_TO_EXCHANGE) {
    return { error: "Client already has a free coffee." };
  }

  // Compare-and-set: only updates if nobody else changed the count in the meantime.
  const newCount = client.coffees + 1;
  const { data: updated, error: updateError } = await supabase
    .from(TABLE_NAME)
    .update({ coffees: newCount })
    .eq("id", id)
    .eq("coffees", client.coffees)
    .select("id");

  if (updateError || !updated?.length) {
    console.error("Error adding coffee:", updateError);
    return { error: "Failed to add coffee." };
  }

  captureServerEvent({
    distinctId: client.email!,
    event: "coffee_added",
    properties: { coffees: newCount },
  });
  if (newCount === COFFEES_TO_EXCHANGE) {
    captureServerEvent({ distinctId: client.email!, event: "reward_earned" });
  }

  revalidatePath("/admin");
};

export const resetCoffee = async (FormData: FormData) => {
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
    return { error: "Failed to reset coffee." };
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

  revalidatePath("/admin");
};

export const deleteCoffee = async (FormData: FormData) => {
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
    return { error: "Failed to delete coffee." };
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
