"use server";
import { TABLE_NAME } from "@/lib/constants";
import { createClient } from "@/supabase-server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export const addCoffee = async (formData: FormData) => {
  const supabase = await createClient();

  const id = formData.get("id") as string;
  const coffees = parseInt(formData.get("coffees") as string);
  await supabase.from(TABLE_NAME).upsert({ id, coffees: coffees + 1 });
  revalidatePath("/admin");
};

export const resetCoffee = async (FormData: FormData) => {
  const supabase = await createClient();

  const id = FormData.get("id") as string;
  await supabase.from(TABLE_NAME).upsert({ id, coffees: 0 });
  revalidatePath("/admin");
};

export const deleteCoffee = async (FormData: FormData) => {
  const supabase = await createClient();

  const id = FormData.get("id") as string;
  await supabase.from(TABLE_NAME).delete().eq("id", id);
  revalidatePath("/admin");
  redirect("/admin");
};
