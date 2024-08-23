import Link from "next/link";
import { auth, signOut } from "@/auth";
import { redirect } from "next/navigation";
import { Button } from "./ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { IconLogout } from "@tabler/icons-react";

async function handleLogout() {
  "use server";
  await signOut();
  redirect("/");
}

export default async function Navbar() {
  const session = await auth();
  return (
    <nav className="flex flex-col items-center gap-y-2 w-full">
      {session && (
        <div className="flex gap-x-2 items-center">
          {session.user.role === "admin" && <Link href={`/admin`}>Admin</Link>}

          <Link href={`/card`}>
            <Avatar>
              <AvatarImage src={session.user?.image ?? ""} />
              <AvatarFallback>RC</AvatarFallback>
            </Avatar>
          </Link>

          <form action={handleLogout}>
            {
              <Button variant="destructive" className="text-sm flex gap-2">
                <span>Logout</span> <IconLogout />
              </Button>
            }
          </form>
        </div>
      )}
    </nav>
  );
}
