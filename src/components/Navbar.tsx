import Link from "next/link";
import { auth, signOut } from "@/auth";
import { redirect } from "next/navigation";
import { Button } from "./ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { IconLogout } from "@tabler/icons-react";

import BrandLogo from "@/components/BrandLogo";
import NavMenu, { ADMIN_ITEMS, CLIENT_ITEMS } from "@/components/NavMenu";

async function handleLogout() {
  "use server";
  await signOut();
  redirect("/");
}

// One compact row on tablet and desktop. On a phone the tabs wrap to a second row.
// Sits on the page background (not a white card) because the logo is an opaque image.
export default async function Navbar() {
  const session = await auth();
  // /resetqr is public: visitors without a session just get the big logo.
  if (!session) return <BrandLogo size="lg" />;
  const isAdmin = session.user.role === "admin";
  return (
    <header className="flex w-full max-w-[860px] flex-wrap items-center gap-x-3 gap-y-2.5 border-b border-resetGreen/20 pb-3">
      <BrandLogo size="sm" />
      <NavMenu
        items={isAdmin ? ADMIN_ITEMS : CLIENT_ITEMS}
        className={
          "order-3 w-full sm:order-none sm:ml-2 sm:w-auto" +
          (isAdmin ? "" : " max-sm:hidden")
        }
      />
      <div className="ml-auto flex items-center gap-2.5">
        <Link href="/card" aria-label="Mi tarjeta">
          <Avatar className="size-11 border-2 border-resetGreen/20">
            <AvatarImage src={session.user?.image ?? ""} />
            <AvatarFallback>{session.user.name?.at(0)}</AvatarFallback>
          </Avatar>
        </Link>
        <form action={handleLogout}>
          <Button
            variant="outline"
            aria-label="Salir"
            className="h-11 gap-2 rounded-xl border-[1.5px] border-resetGreen/40 bg-transparent px-4 font-bold text-resetGreen hover:bg-resetGreen/10 hover:text-resetGreen active:scale-95 max-sm:w-11 max-sm:px-0"
          >
            <span className="max-sm:hidden">Salir</span>
            <IconLogout className="size-5" />
          </Button>
        </form>
      </div>
    </header>
  );
}
