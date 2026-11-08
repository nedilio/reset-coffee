import { auth } from "@/auth";
import ClientsTable from "@/components/ClientsTable";
import TablePagination from "@/components/Pagination";
import Search from "@/components/Search";
import TableSkeleton from "@/components/TableSkeleton";

import { countClients } from "@/clients";
import { redirect } from "next/navigation";
import { Suspense } from "react";

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
  const count = (await countClients(filter)) ?? 1;

  return (
    <div className="w-full max-w-[860px] flex-grow">
      <div className="overflow-hidden rounded-xl border border-resetGreen/15 bg-white shadow-sm">
        <Search />
        <Suspense key={filter + currentPage} fallback={<TableSkeleton />}>
          <ClientsTable filter={filter} currentPage={currentPage} />
        </Suspense>
        <TablePagination count={count} currentPage={currentPage} />
      </div>
    </div>
  );
}
