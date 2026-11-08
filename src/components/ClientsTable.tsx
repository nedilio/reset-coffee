import { addCoffee, resetCoffee, deleteCoffee } from "@/actions/coffees";
import { IconPlus, IconRestore } from "@tabler/icons-react";
import DeleteClientDialog from "@/components/DeleteClientDialog";
import { getClients } from "@/clients";
import CoffeeSVG from "@/components/Coffee";
import ActionButton from "@/components/ui/ActionButton";
import { Tables } from "../../database.types";
import { COFFEES_TO_EXCHANGE } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface ClientsTableProps {
  filter?: string;
  currentPage?: number;
}

// Phone: two-line row (name + progress on the left, actions on the right).
// Tablet (sm, 640px+): one line, compact columns. Wide (920px+): roomier columns.
// The admin layout has 2rem side padding, so a 768px tablet gets a ~704px card.
const ROW_GRID =
  "grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 px-3.5 " +
  "sm:grid-cols-[minmax(0,1fr)_232px_176px] sm:px-4 " +
  "min-[920px]:grid-cols-[minmax(0,1fr)_276px_192px] min-[920px]:gap-x-4 min-[920px]:px-5";

const ICON_BUTTON =
  "size-11 shrink-0 rounded-xl sm:size-12 border-[1.5px] p-0 active:scale-95 transition-transform";

const ClientsTable = async ({ currentPage, filter }: ClientsTableProps) => {
  const clients = await getClients(currentPage, filter);
  if (!clients) return null;

  if (clients.length === 0) {
    return (
      <p className="border-t border-resetGreen/10 px-5 py-10 text-center text-muted-foreground">
        Sin resultados para esa búsqueda.
      </p>
    );
  }

  return (
    <div role="table" aria-label="Clientes">
      <div
        role="row"
        className={cn(
          ROW_GRID,
          "h-11 bg-resetGreen/10 text-xs font-bold uppercase tracking-wider text-resetGreen"
        )}
      >
        <span role="columnheader">Cliente</span>
        <span role="columnheader" className="hidden sm:block">
          Progreso
        </span>
        <span role="columnheader" className="text-right">
          Acciones
        </span>
      </div>
      {clients.map(({ id, name, email, coffees }: Tables<"users">) => {
        const isFull = coffees >= COFFEES_TO_EXCHANGE;
        return (
          <div
            role="row"
            key={id}
            className={cn(
              ROW_GRID,
              "gap-y-2 border-t border-resetGreen/10 py-3 hover:bg-resetGreen/5 sm:min-h-[76px] sm:gap-y-0 sm:py-0"
            )}
          >
            <div role="cell" className="min-w-0">
              <div className="break-words font-semibold">{name}</div>
              <div className="[overflow-wrap:anywhere] text-[13px] text-muted-foreground">
                {email}
              </div>
            </div>

            <div
              role="cell"
              className="col-start-1 row-start-2 flex items-center gap-2.5 sm:col-start-auto sm:row-start-auto"
            >
              <div
                className="hidden shrink-0 gap-[3px] sm:flex min-[920px]:gap-1"
                aria-hidden="true"
              >
                {Array.from({ length: COFFEES_TO_EXCHANGE }, (_, i) => (
                  <span
                    key={i}
                    className={cn(
                      "size-3 rounded-full min-[920px]:size-3.5",
                      i < coffees ? "bg-resetOrange" : "bg-resetGreen/15"
                    )}
                  />
                ))}
              </div>
              <span className="hidden min-w-3.5 shrink-0 text-xl font-bold tabular-nums sm:inline">
                {coffees}
              </span>
              <span
                className={cn(
                  "text-sm tabular-nums text-muted-foreground sm:hidden",
                  isFull && "font-bold text-resetGreen"
                )}
              >
                {coffees} / {COFFEES_TO_EXCHANGE}
                {isFull && " · ¡Gratis!"}
              </span>
              {isFull && (
                <span className="hidden shrink-0 whitespace-nowrap rounded-full bg-resetGreen px-2.5 py-0.5 text-xs font-bold text-white sm:inline-block">
                  ¡Gratis!
                </span>
              )}
            </div>

            <div
              role="cell"
              className="col-start-2 row-span-2 row-start-1 flex items-center justify-end gap-2 sm:col-start-auto sm:row-span-1 sm:row-start-auto min-[920px]:gap-3"
            >
              <form action={addCoffee}>
                <input type="hidden" name="id" value={id} />
                <ActionButton
                  aria-label={`Agregar café a ${name}`}
                  title="Agregar café"
                  className={cn(
                    ICON_BUTTON,
                    "gap-0 border-resetGreen bg-resetGreen text-white hover:bg-resetGreen/90"
                  )}
                  isDisabled={isFull}
                >
                  <IconPlus className="size-3.5" />
                  <CoffeeSVG className="size-5 text-white" />
                </ActionButton>
              </form>
              <form action={resetCoffee}>
                <input type="hidden" name="id" value={id} />
                <ActionButton
                  variant="outline"
                  aria-label={`Reiniciar cafés de ${name}`}
                  title="Reiniciar cafés"
                  className={cn(
                    ICON_BUTTON,
                    "border-resetGreen/30 bg-white text-resetGreen hover:bg-resetGreen/10 hover:text-resetGreen"
                  )}
                  isDisabled={coffees <= 0}
                >
                  <IconRestore />
                </ActionButton>
              </form>

              <span
                aria-hidden="true"
                className="mx-0.5 h-7 w-px bg-resetGreen/15"
              />

              <DeleteClientDialog id={id} name={name} className={ICON_BUTTON} />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ClientsTable;
