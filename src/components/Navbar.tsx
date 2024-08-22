import Link from "next/link";
import { auth, signOut } from "@/auth";
import { redirect } from "next/navigation";
import { Button } from "./ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { IconLogout } from "@tabler/icons-react";

export default async function Navbar() {
  const session = await auth();
  return (
    <nav className="flex flex-col items-center w-full">
      <img
        className="w-52 "
        src="/img/reset-coffee-logo.webp"
        alt="Reset Cofee"
      />
      {session && (
        <div className="flex gap-x-2 items-center">
          <Link href={`/card`}>
            <Avatar>
              <AvatarImage src={session.user?.image ?? ""} />
              <AvatarFallback>RC</AvatarFallback>
            </Avatar>
          </Link>

          <form
            action={async () => {
              "use server";
              await signOut();
              redirect("/login");
            }}
          >
            {
              <Button className="text-sm flex gap-2">
                <span>Logout</span> <IconLogout />
              </Button>
            }
          </form>
        </div>
      )}
    </nav>
  );
}
