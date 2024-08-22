import { auth } from "@/auth";
import Search from "@/components/Search";
import { Button } from "@/components/ui/button";
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
import { IconCoffee, IconEdit, IconPlus, IconTrash } from "@tabler/icons-react";
import { revalidatePath } from "next/cache";
import Link from "next/link";

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
    <div>
      <h2>Admin Page</h2>
      <p>Admins only</p>
      <Search />
      {clients && clients?.length > 0 ? (
        <Table>
          <TableCaption>Lista de usuarios</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Nombre</TableHead>
              <TableHead>email</TableHead>
              <TableHead>cafés</TableHead>
              <TableHead className="text-center">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clients?.map(({ id, name, email, picture, coffees }) => (
              <TableRow key={id}>
                <TableCell className="font-medium">{name}</TableCell>
                <TableCell>{email}</TableCell>
                <TableCell className="text-center font-bold text-xl">
                  {coffees}
                </TableCell>
                <TableCell>
                  <div className="flex gap-x-4">
                    <form
                      action={async () => {
                        "use server";
                        await supabase.from("users").upsert({ id, coffees: 0 });
                        revalidatePath("/admin");
                      }}
                    >
                      <Button>
                        <IconEdit />
                      </Button>
                    </form>
                    <form
                      action={async () => {
                        "use server";
                        await supabase.from("users").delete().eq("id", id);
                        revalidatePath("/admin");
                      }}
                    >
                      <Button variant="destructive">
                        <IconTrash />
                      </Button>
                    </form>
                    <form
                      action={async () => {
                        "use server";
                        revalidatePath("/admin");
                        await supabase
                          .from("users")
                          .upsert({ id, coffees: coffees + 1 });
                      }}
                    >
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
    </div>
  );
}
