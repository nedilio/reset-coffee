"use server";
import { TABLE_NAME } from "@/lib/constants";
import { createClient } from "@/supabase-server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { TablesUpdate } from "../../database.types";
import PosthogClient from "@/app/posthog";

export const addCoffee = async (formData: FormData) => {
  const supabase = await createClient();
  const posthog = PosthogClient();

  const id = formData.get("id") as string;
  const coffees = parseInt(formData.get("coffees") as string);
  const payload: TablesUpdate<"users"> = { id, coffees: coffees + 1 };
  await supabase.from(TABLE_NAME).upsert(payload);

  posthog.capture({
    distinctId: id,
    event: "addCoffee",
    properties: {
      eventType: "server-side",
      coffees: coffees + 1,
    },
  });

  await posthog.flush();

  revalidatePath("/admin");
};

export const resetCoffee = async (FormData: FormData) => {
  const supabase = await createClient();

  const id = FormData.get("id") as string;
  const payload: TablesUpdate<"users"> = { id, coffees: 0 };
  await supabase.from(TABLE_NAME).upsert(payload);
  revalidatePath("/admin");
};

export const deleteCoffee = async (FormData: FormData) => {
  const supabase = await createClient();

  const id = FormData.get("id") as string;
  await supabase.from(TABLE_NAME).delete().eq("id", id);
  revalidatePath("/admin");
  redirect("/admin");
};
