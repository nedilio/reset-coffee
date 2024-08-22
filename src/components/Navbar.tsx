import Link from "next/link";
import { auth, signOut } from "@/auth";
import { redirect } from "next/navigation";
import { Button } from "./ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

export default async function Navbar() {
  const session = await auth();
  return (
    <nav className="flex flex-col items-center">
      <ul className="flex justify-between items-center gap-x-2">
        <li>
          <Link href="/">Home</Link>
        </li>
        <li>
          <Link href="/admin">Admin</Link>
        </li>
        {!session?.user && (
          <li>
            <Link href="/login">Login</Link>
          </li>
        )}
        <li>
          <Link href="/about">About</Link>
        </li>
      </ul>
      {session && (
        <div className="flex gap-x-2 items-center">
          <Link href={`/card/${session.user?.name}`}>
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
            {<Button>Logout 🪫</Button>}
          </form>
        </div>
      )}
    </nav>
  );
}
