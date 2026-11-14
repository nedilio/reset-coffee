"use client";

import { IconPlus } from "@tabler/icons-react";
import { toast } from "sonner";
import { addCoffee, removeCoffee } from "@/actions/coffees";
import ActionForm from "@/components/ActionForm";
import CoffeeSVG from "@/components/Coffee";
import ActionButton from "@/components/ui/ActionButton";
import { cn } from "@/lib/utils";

const undo = async (id: string) => {
  const formData = new FormData();
  formData.set("id", id);
  const result = await removeCoffee(formData);
  if ("error" in result) toast.error(result.error);
  else toast("Café quitado");
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
  return (
    <ActionForm
      action={addCoffee}
      id={id}
      onSuccess={() =>
        toast.success(`Café sumado a ${name ?? "el cliente"}`, {
          action: { label: "Deshacer", onClick: () => undo(id) },
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
        isDisabled={isFull}
      >
        <IconPlus className="size-3.5" />
        <CoffeeSVG className="size-5 text-white" />
      </ActionButton>
    </ActionForm>
  );
}
