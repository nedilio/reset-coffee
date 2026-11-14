import { cn } from "@/lib/utils";

// Same row height (76px on tablet) as ClientsTable so the card does not jump when data arrives.
const TableSkeleton = ({ className }: { className?: string }) => (
  <div
    role="status"
    aria-label="Cargando clientes"
    className={cn("animate-pulse", className)}
  >
    <div className="h-11 bg-resetGreen/10" />
    {Array.from({ length: 6 }, (_, i) => (
      <div
        key={i}
        className="flex min-h-[76px] items-center justify-between gap-4 border-t border-resetGreen/10 px-4"
      >
        <div className="space-y-2">
          <div className="h-4 w-40 rounded bg-resetGreen/10" />
          <div className="h-3 w-52 rounded bg-resetGreen/10" />
        </div>
        <div className="hidden h-3.5 w-40 rounded-full bg-resetGreen/10 sm:block" />
        <div className="flex gap-2">
          <div className="size-12 rounded-xl bg-resetGreen/10" />
          <div className="size-12 rounded-xl bg-resetGreen/10" />
          <div className="size-12 rounded-xl bg-resetGreen/10" />
        </div>
      </div>
    ))}
  </div>
);

export default TableSkeleton;
