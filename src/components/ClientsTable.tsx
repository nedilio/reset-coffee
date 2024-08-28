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
  count?: number;
}

const ClientsTable = async ({ count, filter }: ClientsTableProps) => {
  const clients = await getClients(count, filter);
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
        {clients.map(({ id, name, email, picture, coffees }: User) => (
          <TableRow key={id}>
            <TableCell className="font-medium">
              {name}{" "}
              <form action={addCoffee.bind(null, { id, coffees })}>
                <Button
                  variant="outline"
                  className="bg-green-800 text-white hover:bg-green-900 hover:text-slate-300"
                >
                  <IconPlus />
                  <CoffeeSVG className="size-6 text-white/90" />
                </Button>
              </form>
            </TableCell>
            <TableCell className="text-center font-bold text-xl">
              {coffees}
            </TableCell>
            <TableCell>{email}</TableCell>
            <TableCell>
              <div className="flex gap-x-4">
                <form action={resetCoffee.bind(null, { id })}>
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
                        permanentemente al cliente y borrar su progreso.
                      </DialogDescription>
                      <form action={deleteCoffee.bind(null, { id })}>
                        <Button variant="destructive" type="submit">
                          Delete
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
