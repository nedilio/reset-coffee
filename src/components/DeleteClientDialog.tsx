"use client";

import { IconTrash } from "@tabler/icons-react";
import { deleteCoffee } from "@/actions/coffees";
import { Button } from "@/components/ui/button";
import ActionButton from "@/components/ui/ActionButton";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogHeader,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

// A client component on purpose: with the trigger (`asChild`) rendered from a server
// component, React streams the first row's Button as a lazy chunk, which Radix's Slot
// cannot render, so the first row lost its delete button.
export default function DeleteClientDialog({
  id,
  name,
  className,
}: {
  id: string;
  name: string | null;
  className?: string;
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          aria-label={`Borrar a ${name}`}
          title="Borrar cliente"
          className={cn(
            "border-red-200 bg-white text-red-700 hover:bg-red-50 hover:text-red-700",
            className
          )}
        >
          <IconTrash />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Estás seguro/a?</DialogTitle>
          <DialogDescription>
            Esta acción no se puede deshacer. Esto eliminará permanentemente al
            cliente {name} y borrar su progreso.
          </DialogDescription>
          <form action={deleteCoffee}>
            <input type="hidden" name="id" value={id} />
            <ActionButton variant="destructive" type="submit">
              Borrar
            </ActionButton>
          </form>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
