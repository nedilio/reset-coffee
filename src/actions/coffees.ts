"use server";
import { COFFEES_TO_EXCHANGE, TABLE_NAME } from "@/lib/constants";
import { createClient } from "@/supabase-server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import PostHogClient from "./ph-client";
import { isAdmin, UNAUTHORIZED } from "@/lib/auth-guards";

export const addCoffee = async (formData: FormData) => {
  if (!(await isAdmin())) return UNAUTHORIZED;
  const supabase = await createClient();
  const posthog = PostHogClient();

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

  posthog.capture({
    distinctId: client.email!,
    event: "coffee_added",
    properties: { coffees: newCount },
  });

  revalidatePath("/admin");
};

export const resetCoffee = async (FormData: FormData) => {
  if (!(await isAdmin())) return UNAUTHORIZED;
  const supabase = await createClient();

  const id = FormData.get("id") as string;
  // supabase-js returns errors instead of throwing, so they must be read from the result.
  const { error } = await supabase
    .from(TABLE_NAME)
    .update({ coffees: 0 })
    .eq("id", id);

  if (error) {
    console.error("Error resetting coffee:", error);
    return { error: "Failed to reset coffee." };
  }

  revalidatePath("/admin");
};

export const deleteCoffee = async (FormData: FormData) => {
  if (!(await isAdmin())) return UNAUTHORIZED;
  const supabase = await createClient();

  const id = FormData.get("id") as string;
  const { error } = await supabase.from(TABLE_NAME).delete().eq("id", id);

  if (error) {
    console.error("Error deleting coffee:", error);
    return { error: "Failed to delete coffee." };
  }

  revalidatePath("/admin");
  // redirect() works by throwing, so it must stay outside any try/catch.
  redirect("/admin");
};
