import { auth } from "@/auth";
import ScanConsole from "@/components/ScanConsole";
import { Toaster } from "@/components/ui/sonner";
import { IconArrowLeft } from "@tabler/icons-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import ShopSelector from "@/components/ShopSelector";
import { currentShop, shopNames } from "@/lib/shop";

export default async function ScanPage() {
  const session = await auth();
  if (session?.user.role !== "admin") {
    redirect("/card");
  }

  return (
    <div className="w-full max-w-md flex-grow">
      <Link
        href="/admin"
        className="mb-3 inline-flex items-center gap-1 text-sm text-resetGreen hover:underline"
      >
        <IconArrowLeft className="size-4" aria-hidden="true" />
        Volver a clientes
      </Link>
      <ShopSelector names={shopNames()} current={await currentShop()} />
      <ScanConsole />
      <Toaster position="top-center" richColors />
    </div>
  );
}
