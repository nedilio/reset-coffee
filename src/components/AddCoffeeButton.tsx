"use client";

import { IconGift, IconPlus } from "@tabler/icons-react";
import { toast } from "sonner";
import { addCoffee, redeemCoffee, removeCoffee, undoRedeem } from "@/actions/coffees";
import ActionForm from "@/components/ActionForm";
import CoffeeSVG from "@/components/Coffee";
import ActionButton from "@/components/ui/ActionButton";
import { cn } from "@/lib/utils";

// Also used by /admin/scan after a scanned coffee.
export const undoCoffee = async (id: string) => {
  const formData = new FormData();
  formData.set("id", id);
  const result = await removeCoffee(formData);
  if ("error" in result) {
    toast.error(result.error);
    return false;
  }
  toast("Café quitado");
  return true;
};

// "Deshacer" after a redemption (back to 9 coffees). Also used by /admin/scan.
export const undoRedemption = async (id: string) => {
  const formData = new FormData();
  formData.set("id", id);
  const result = await undoRedeem(formData);
  if ("error" in result) {
    toast.error(result.error);
    return false;
  }
  toast("Canje deshecho");
  return true;
};

export default function AddCoffeeButton({
  id,
  name,
  isFull,
  className,
}: {
  id: string;
  name: string | null;
  isFull: boolean;
  className?: string;
}) {
  // A full card has nothing to add: the same spot redeems the free coffee.
  if (isFull) {
    return (
      <ActionForm
        action={redeemCoffee}
        id={id}
        onSuccess={() =>
          toast.success(`Café gratis canjeado a ${name ?? "el cliente"}`, {
            action: { label: "Deshacer", onClick: () => undoRedemption(id) },
          })
        }
      >
        <ActionButton
          aria-label={`Canjear café gratis de ${name}`}
          title="Canjear café gratis"
          className={cn(
            "border-resetOrange bg-resetOrange text-white hover:bg-resetOrange/90",
            className
          )}
        >
          <IconGift className="size-5" />
        </ActionButton>
      </ActionForm>
    );
  }

  return (
    <ActionForm
      action={addCoffee}
      id={id}
      onSuccess={() =>
        toast.success(`Café sumado a ${name ?? "el cliente"}`, {
          action: { label: "Deshacer", onClick: () => undoCoffee(id) },
        })
      }
    >
      <ActionButton
        aria-label={`Agregar café a ${name}`}
        title="Agregar café"
        className={cn(
          "gap-0 border-resetGreen bg-resetGreen text-white hover:bg-resetGreen/90",
          className
        )}
      >
        <IconPlus className="size-3.5" />
        <CoffeeSVG className="size-5 text-white" />
      </ActionButton>
    </ActionForm>
  );
}
