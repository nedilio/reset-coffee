import { auth } from "@/auth";
import ClientsTable from "@/components/ClientsTable";
import Search from "@/components/Search";
import TableSkeleton from "@/components/TableSkeleton";

import { redirect } from "next/navigation";
import { Suspense } from "react";
import { Toaster } from "@/components/ui/sonner";
import Link from "next/link";
import { IconScan } from "@tabler/icons-react";

export default async function AdminPage(
  props: {
    searchParams?: Promise<{ filter: string; page: string }>;
  }
) {
  const searchParams = await props.searchParams;
  const filter = searchParams?.filter || "";
  const currentPage = Number(searchParams?.page) || 1;

  const session = await auth();
  if (session?.user.role !== "admin") {
    redirect("/card");
  }

  return (
    <div className="w-full max-w-[860px] flex-grow">
      <Link
        href="/admin/scan"
        className="mb-3 flex h-12 items-center justify-center gap-2 rounded-xl bg-resetGreen font-semibold text-white shadow-sm hover:bg-resetGreen/90 active:scale-[0.99]"
      >
        <IconScan className="size-5" aria-hidden="true" />
        Escanear tarjeta
      </Link>
      <div className="overflow-hidden rounded-xl border border-resetGreen/15 bg-white shadow-sm">
        <Search />
        <Suspense key={filter + currentPage} fallback={<TableSkeleton />}>
          <ClientsTable filter={filter} currentPage={currentPage} />
        </Suspense>
      </div>
      <Toaster position="top-center" richColors />
    </div>
  );
}
