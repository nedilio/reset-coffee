import Link from "next/link";
import { redirect } from "next/navigation";
import { IconArrowLeft } from "@tabler/icons-react";
import { getSession } from "@/lib/auth-session";
import { shopNames } from "@/lib/shop";
import {
  getByAdmin,
  getByShop,
  getDailyCoffees,
  getSummary,
  type Breakdown,
} from "@/lib/stats";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

// Always read fresh numbers: they change with every scan.
export const dynamic = "force-dynamic";

// Day strings are calendar dates (already in the café's time zone), so format them as UTC.
const formatDay = (day: string, options: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat("es-CL", { timeZone: "UTC", ...options }).format(
    new Date(`${day}T00:00:00Z`)
  );

export default async function StatsPage(props: {
  searchParams?: Promise<{ shop?: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/");
  if (session.user.role !== "admin") redirect("/card");

  const names = shopNames();
  const requested = (await props.searchParams)?.shop;
  const shop = requested && names.includes(requested) ? requested : null;

  const [summary, daily, byShop, byAdmin] = await Promise.all([
    getSummary(shop),
    getDailyCoffees(shop),
    names.length >= 2 && !shop ? getByShop() : Promise.resolve([]),
    getByAdmin(shop),
  ]);
  const max = Math.max(1, ...daily.map((d) => d.coffees));

  return (
    <div className="w-full max-w-[860px] flex-grow space-y-3">
      <Link
        href="/admin"
        className="inline-flex items-center gap-1 text-sm text-resetGreen hover:underline"
      >
        <IconArrowLeft className="size-4" aria-hidden="true" />
        Volver a clientes
      </Link>

      {names.length >= 2 && (
        <nav
          aria-label="Filtrar por local"
          className="flex gap-1 rounded-xl border border-resetGreen/15 bg-white p-2 shadow-sm"
        >
          {[null, ...names].map((name) => (
            <Link
              key={name ?? "all"}
              href={name ? `/admin/stats?shop=${encodeURIComponent(name)}` : "/admin/stats"}
              aria-current={name === shop ? "page" : undefined}
              className={cn(
                "flex h-9 flex-1 items-center justify-center rounded-lg text-sm font-medium transition-colors",
                name === shop
                  ? "bg-resetGreen text-white"
                  : "text-resetGreen hover:bg-resetGreen/10"
              )}
            >
              {name ?? "Todos"}
            </Link>
          ))}
        </nav>
      )}

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4" aria-label="Resumen">
        <Stat label="Cafés hoy" value={summary.coffeesToday} />
        <Stat label="Cafés 7 días" value={summary.coffees7d} />
        <Stat label="Cafés 30 días" value={summary.coffees30d} />
        <Stat label="Canjes 30 días" value={summary.redeemed30d} hint={`${summary.redeemedToday} hoy · ${summary.redeemed7d} en 7 días`} />
        <Stat label="Clientes activos" value={summary.activeClients30d} hint="con café en 30 días" />
        <Stat label="Clientes nuevos" value={summary.newClients30d} hint="en 30 días" />
        <Stat label="Clientes" value={summary.totalClients} hint="en total" />
        <Stat label="Cafés históricos" value={summary.lifetimeCoffees} hint={`${summary.lifetimeRedeemed} canjes`} />
      </section>

      <section className="rounded-xl border border-resetGreen/15 bg-white p-4 shadow-sm">
        <h2 className="mb-3 font-semibold text-resetGreen">Cafés por día (30 días)</h2>
        <div
          role="img"
          aria-label={`Cafés por día en los últimos 30 días. Máximo ${max}.`}
          className="flex h-40 items-end gap-[2px]"
        >
          {daily.map((d) => (
            <div
              key={d.day}
              title={`${formatDay(d.day, { day: "numeric", month: "short" })}: ${d.coffees}`}
              className="flex-1 rounded-t bg-resetGreen/80 hover:bg-resetGreen"
              style={{ height: `${(Math.max(0, d.coffees) / max) * 100}%` }}
            />
          ))}
        </div>
        {daily.length > 0 && (
          <div className="mt-1 flex justify-between text-xs text-gray-500">
            <span>{formatDay(daily[0].day, { day: "numeric", month: "short" })}</span>
            <span>Hoy</span>
          </div>
        )}
      </section>

      {byShop.length > 0 && (
        <BreakdownTable title="Por local (30 días)" first="Local" rows={byShop} empty="Sin local" />
      )}
      <BreakdownTable title="Por barista (30 días)" first="Barista" rows={byAdmin} empty="Cuenta eliminada" />

      <p className="text-xs text-gray-500">
        {summary.since
          ? `Datos desde el ${formatDay(summary.since, { day: "numeric", month: "long", year: "numeric" })}. `
          : "Todavía no hay movimientos registrados. "}
        Los totales históricos incluyen lo anterior. Los clientes no dependen del local.
      </p>
    </div>
  );
}

function Stat({ label, value, hint }: { label: string; value: number; hint?: string }) {
  return (
    <div className="rounded-xl border border-resetGreen/15 bg-white p-3 shadow-sm">
      <p className="text-xs font-medium text-gray-500">{label}</p>
      <p className="text-2xl font-bold tabular-nums text-resetGreen">{value}</p>
      {hint && <p className="text-xs text-gray-500">{hint}</p>}
    </div>
  );
}

function BreakdownTable({
  title,
  first,
  rows,
  empty,
}: {
  title: string;
  first: string;
  rows: Breakdown[];
  empty: string;
}) {
  return (
    <section className="overflow-hidden rounded-xl border border-resetGreen/15 bg-white shadow-sm">
      <h2 className="px-4 pt-4 font-semibold text-resetGreen">{title}</h2>
      {rows.length === 0 ? (
        <p className="p-4 text-sm text-gray-500">Sin movimientos.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{first}</TableHead>
              <TableHead className="text-right">Cafés</TableHead>
              <TableHead className="text-right">Canjes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r, i) => (
              <TableRow key={`${r.label}-${i}`}>
                <TableCell>{r.label ?? empty}</TableCell>
                <TableCell className="text-right tabular-nums">{r.coffees}</TableCell>
                <TableCell className="text-right tabular-nums">{r.redeemed}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </section>
  );
}
