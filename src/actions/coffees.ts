"use server";
import { TABLE_NAME } from "@/lib/constants";
import { createClient } from "@/supabase-server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { TablesUpdate } from "../../database.types";
import PostHogClient from "./ph-client";

export const addCoffee = async (formData: FormData) => {
  const supabase = await createClient();
  const posthog = PostHogClient();

  const id = formData.get("id") as string;
  const coffees = parseInt(formData.get("coffees") as string);
  const email = formData.get("email") as string;
  const payload: TablesUpdate<"users"> = { id, coffees: coffees + 1 };
  try {
    await supabase.from(TABLE_NAME).upsert(payload);
    posthog.capture({
      distinctId: email,
      event: "coffee_added",
      properties: { coffees: coffees + 1 },
    });

    revalidatePath("/admin");
  } catch (error) {
    console.error("Error adding coffee:", error);
    return { error: "Failed to add coffee." };
  }
};

export const resetCoffee = async (FormData: FormData) => {
  const supabase = await createClient();

  const id = FormData.get("id") as string;
  const payload: TablesUpdate<"users"> = { id, coffees: 0 };
  try {
    await supabase.from(TABLE_NAME).upsert(payload);
    revalidatePath("/admin");
  } catch (error) {
    console.error("Error resetting coffee:", error);
    return { error: "Failed to reset coffee." };
  }
};

export const deleteCoffee = async (FormData: FormData) => {
  const supabase = await createClient();

  const id = FormData.get("id") as string;
  try {
    await supabase.from(TABLE_NAME).delete().eq("id", id);
    revalidatePath("/admin");
    redirect("/admin");
  } catch (error) {
    console.error("Error deleting coffee:", error);
    return { error: "Failed to delete coffee." };
  }
};
