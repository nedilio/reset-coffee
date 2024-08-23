import { addCoffee, deleteCoffee, resetCoffee } from "@/actions/coffees";
import { auth } from "@/auth";
import Search from "@/components/Search";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Table,
  TableCaption,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { supabase } from "@/supabase.config";
import {
  IconCoffee,
  IconEdit,
  IconPlus,
  IconRestore,
  IconTrash,
} from "@tabler/icons-react";
import { revalidatePath } from "next/cache";
import Link from "next/link";
import ProtectedLayout from "../layout";

export default async function AdminPage({
  searchParams,
}: {
  searchParams: { filter: string };
}) {
  const { filter } = searchParams;
  const session = await auth();
  if (session?.user.role !== "admin") {
    return <div>Unauthorized</div>;
  }
  const { data: users } = await supabase.from("users").select("*");

  const clients = filter
    ? users?.filter((user) => user.name.toLowerCase().includes(filter))
    : users;
  return (
    <>
      <Search />
      {clients && clients?.length > 0 ? (
        <Table>
          <TableCaption>Lista de usuarios</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>email</TableHead>
              <TableHead>cafés</TableHead>
              <TableHead className="text-center">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clients?.map(({ id, name, email, picture, coffees }: User) => (
              <TableRow key={id}>
                <TableCell className="font-medium">{name}</TableCell>
                <TableCell>{email}</TableCell>
                <TableCell className="text-center font-bold text-xl">
                  {coffees}
                </TableCell>
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

                    <form action={addCoffee.bind(null, { id, coffees })}>
                      <Button
                        variant="outline"
                        className="bg-green-800 text-white hover:bg-green-900 hover:text-slate-300"
                      >
                        <IconPlus />
                        <IconCoffee />
                      </Button>
                    </form>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <div>No hay usuarios</div>
      )}
    </>
  );
}
