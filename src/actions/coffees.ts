"use server";
import { supabase } from "@/supabase.config";
import { revalidatePath } from "next/cache";

export const addCoffee = async ({
  id,
  coffees,
}: {
  id: string;
  coffees: number;
}) => {
  "use server";
  revalidatePath("/admin");
  await supabase.from("users").upsert({ id, coffees: coffees + 1 });
};

export const resetCoffee = async ({ id }: { id: string }) => {
  "use server";
  await supabase.from("users").upsert({ id, coffees: 0 });
  revalidatePath("/admin");
};

export const deleteCoffee = async ({ id }: { id: string }) => {
  "use server";
  const response = await supabase.from("users").delete().eq("id", id);
  revalidatePath("/admin");
};
