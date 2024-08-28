import { auth } from "@/auth";
import ClientsTable from "@/components/ClientsTable";
import Search from "@/components/Search";
import TableSkeleton from "@/components/TableSkeleton";

import { countClients } from "@/supabase.config";
import { Suspense } from "react";

export default async function AdminPage({
  searchParams,
}: {
  searchParams: { filter: string };
}) {
  const { filter } = searchParams;
  const session = await auth();
  if (session?.user.role !== "admin") {
    return <div>Unauthorized</div>;
  }
  const count = (await countClients()) ?? 1;

  return (
    <>
      <Search />
      <Suspense fallback={<TableSkeleton />}>
        <ClientsTable filter={filter} />
      </Suspense>
    </>
  );
}
