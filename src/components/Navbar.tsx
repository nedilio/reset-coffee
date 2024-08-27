import Link from "next/link";
import { auth, signOut } from "@/auth";
import { redirect } from "next/navigation";
import { Button } from "./ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { IconLogout } from "@tabler/icons-react";

import NavMenu from "@/components/NavMenu";

async function handleLogout() {
  "use server";
  await signOut();
  redirect("/");
}

export default async function Navbar() {
  const session = await auth();
  return (
    <nav className="block w-full">
      {session && (
        <div className="flex justify-around items-center">
          {session.user.role === "admin" && <NavMenu />}

          <div className="flex gap-x-4 items-center justify-center">
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
        </div>
      )}
    </nav>
  );
}
