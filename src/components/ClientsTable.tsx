import { addCoffee, resetCoffee, deleteCoffee } from "@/actions/coffees";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogHeader,
} from "@/components/ui/dialog";
import { IconPlus, IconRestore, IconTrash } from "@tabler/icons-react";
import React from "react";
import { Button } from "@/components/ui/button";
import {
  TableCaption,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
  Table,
} from "@/components/ui/table";
import { getClients } from "@/supabase.config";
import CoffeeSVG from "./Coffee";

interface ClientsTableProps {
  filter?: string;
  currentPage?: number;
}

const ClientsTable = async ({ currentPage, filter }: ClientsTableProps) => {
  const clients = await getClients(currentPage, filter);
  if (!clients) return null;
  return (
    <Table>
      <TableCaption>Lista de usuarios</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Nombre</TableHead>
          <TableHead>cafés</TableHead>
          <TableHead>email</TableHead>
          <TableHead className="text-center">Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {clients.map(({ id, name, email, coffees }: User) => (
          <TableRow key={id}>
            <TableCell className="font-medium">
              <div className="flex gap-x-2 justify-between items-center">
                <span className="text-balance text-sm">{name}</span>
                <form action={addCoffee}>
                  <input type="hidden" name="id" value={id} />
                  <input type="hidden" name="coffees" value={coffees} />
                  <Button
                    variant="outline"
                    className="bg-green-800 text-white hover:bg-green-900 hover:text-slate-300"
                  >
                    <IconPlus className="size-4" />
                    <CoffeeSVG className="size-5 text-white/90" />
                  </Button>
                </form>
              </div>
            </TableCell>
            <TableCell className="text-center font-bold text-xl">
              {coffees}
            </TableCell>
            <TableCell className="text-xs">{email}</TableCell>
            <TableCell>
              <div className="flex gap-x-4">
                <form action={resetCoffee}>
                  <input type="hidden" name="id" value={id} />
                  <Button>
                    <IconRestore />
                  </Button>
                </form>

                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="destructive">
                      <IconTrash />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Estás seguro/a?</DialogTitle>
                      <DialogDescription>
                        Esta acción no se puede deshacer. Esto eliminará
                        permanentemente al cliente {name} y borrar su progreso.
                      </DialogDescription>
                      <form action={deleteCoffee}>
                        <input type="hidden" name="id" value={id} />
                        <Button variant="destructive" type="submit">
                          Borrar
                        </Button>
                      </form>
                    </DialogHeader>
                  </DialogContent>
                </Dialog>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default ClientsTable;
