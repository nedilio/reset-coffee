import { auth } from "@/auth";
import ClientsTable from "@/components/ClientsTable";
import TablePagination from "@/components/Pagination";
import Search from "@/components/Search";
import TableSkeleton from "@/components/TableSkeleton";

import { countClients } from "@/supabase.config";
import { Suspense } from "react";

export default async function AdminPage({
  searchParams,
}: {
  searchParams?: { filter: string; page: string };
}) {
  const filter = searchParams?.filter || "";
  const currentPage = Number(searchParams?.page) || 1;

  const session = await auth();
  if (session?.user.role !== "admin") {
    return <div>Unauthorized</div>;
  }
  const count = (await countClients(filter)) ?? 1;

  return (
    <div className="flex-grow w-full">
      <Search />
      <Suspense key={filter + currentPage} fallback={<TableSkeleton />}>
        <ClientsTable filter={filter} currentPage={currentPage} />
      </Suspense>
      <TablePagination count={count} currentPage={currentPage} />
    </div>
  );
}
