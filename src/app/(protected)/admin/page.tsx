import { auth } from "@/auth";
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
import {
  IconCoffeeOff,
  IconEdit,
  IconPlus,
  IconTrash,
} from "@tabler/icons-react";
import { revalidatePath } from "next/cache";
import Link from "next/link";

export default async function AdminPage() {
  const session = await auth();
  if (session?.user.role !== "admin") {
    return <div>Unauthorized</div>;
  }
  const { data: users } = await supabase.from("users").select("*");
  return (
    <div>
      <h2>Admin Page</h2>
      <p>Admins only</p>
      <Table>
        <TableCaption>A list of your recent invoices.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Nombre</TableHead>
            <TableHead>email</TableHead>
            <TableHead>cafés</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users?.map(({ id, name, email, picture, coffees }) => (
            <TableRow key={id}>
              <TableCell className="font-medium">{name}</TableCell>
              <TableCell>{email}</TableCell>
              <TableCell>{coffees}</TableCell>
              <TableCell className="text-right">
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
                <Button>
                  <IconTrash />
                </Button>
                <form
                  action={async () => {
                    "use server";
                    revalidatePath("/admin");
                    await supabase
                      .from("users")
                      .upsert({ id, coffees: coffees + 1 });
                  }}
                >
                  <Button>
                    <IconPlus />
                    <IconCoffeeOff />
                  </Button>
                </form>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
