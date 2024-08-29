"use server";
import { supabase } from "@/supabase.config";
import { revalidatePath } from "next/cache";

export const addCoffee = async (formData: FormData) => {
  const id = formData.get("id") as string;
  const coffees = parseInt(formData.get("coffees") as string);
  await supabase.from("users").upsert({ id, coffees: coffees + 1 });
  revalidatePath("/admin");
};

export const resetCoffee = async (FormData: FormData) => {
  const id = FormData.get("id") as string;
  await supabase.from("users").upsert({ id, coffees: 0 });
  revalidatePath("/admin");
};

export const deleteCoffee = async (FormData: FormData) => {
  const id = FormData.get("id") as string;
  await supabase.from("users").delete().eq("id", id);
  revalidatePath("/admin");
};
