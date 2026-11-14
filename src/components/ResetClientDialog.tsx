"use client";

import { useState } from "react";
import { IconRestore } from "@tabler/icons-react";
import { toast } from "sonner";
import { removeCoffee, resetCoffee } from "@/actions/coffees";
import { Button } from "@/components/ui/button";
import ActionButton from "@/components/ui/ActionButton";
import ActionForm from "@/components/ActionForm";
import {
  Dialog,
  DialogTrigger,
  DialogClose,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogHeader,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

// Client component for the same reason as DeleteClientDialog: the trigger uses `asChild`.
// Adjusting changes the client's progress, so it asks for confirmation like deleting does:
// remove one coffee (fixes a mistake) or reset to 0.
export default function ResetClientDialog({
  id,
  name,
  coffees,
  className,
}: {
  id: string;
  name: string | null;
  coffees: number;
  className?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          aria-label={`Ajustar cafés de ${name}`}
          title="Ajustar cafés"
          disabled={coffees <= 0}
          className={cn(
            "border-resetGreen/30 bg-white text-resetGreen hover:bg-resetGreen/10 hover:text-resetGreen disabled:opacity-50",
            className
          )}
        >
          <IconRestore />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>¿Ajustar los cafés?</DialogTitle>
          <DialogDescription>
            {name} tiene {coffees} {coffees === 1 ? "café" : "cafés"}. Puedes
            quitar uno sumado por error o reiniciar a 0. Reiniciar no se puede
            deshacer.
          </DialogDescription>
          <div className="flex flex-wrap gap-2">
            <DialogClose asChild>
              <Button variant="outline" type="button">
                Cancelar
              </Button>
            </DialogClose>
            <ActionForm
              action={removeCoffee}
              id={id}
              onSuccess={() => {
                setOpen(false);
                toast.success(`Café quitado a ${name ?? "el cliente"}`);
              }}
            >
              <ActionButton
                variant="outline"
                type="submit"
                isDisabled={coffees <= 0}
              >
                Quitar 1 café
              </ActionButton>
            </ActionForm>
            <ActionForm
              action={resetCoffee}
              id={id}
              onSuccess={() => {
                setOpen(false);
                toast.success(`Cafés de ${name ?? "el cliente"} en 0`);
              }}
            >
              <ActionButton variant="destructive" type="submit">
                Reiniciar a 0
              </ActionButton>
            </ActionForm>
          </div>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
