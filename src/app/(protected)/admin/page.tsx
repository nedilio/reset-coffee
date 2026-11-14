import { auth } from "@/auth";
import ClientsTable from "@/components/ClientsTable";
import Search from "@/components/Search";
import TableSkeleton from "@/components/TableSkeleton";

import { redirect } from "next/navigation";
import { Suspense } from "react";
import { Toaster } from "@/components/ui/sonner";

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
