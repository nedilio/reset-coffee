import { auth } from "@/auth";
import { getClientByEmail, provisionClient } from "@/clients";
import CardView from "@/components/CardView";
import CoffeeSVG from "@/components/Coffee";
import Confetti from "@/components/Confetti";
import ResetTitle from "@/components/ResetTitle";
import { range } from "@/lib";
import { COFFEES_TO_EXCHANGE } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Londrina_Solid } from "next/font/google";
import { Suspense } from "react";
const londrina = Londrina_Solid({ weight: "400", subsets: ["latin"] });

export default async function CardPage() {
  const session = await auth();
  const email = session?.user.email;

  if (!email) {
    return null;
  }
  // The row can be missing if an admin deleted the client while their session was still valid.
  const client =
    (await getClientByEmail(email)) ??
    (
      await provisionClient({
        email,
        name: session.user.name,
        image: session.user.image,
        role: session.user.role,
      })
    ).client;
  const { coffees, name } = client;

  return (
    <>
      <Suspense fallback={null}>
        <CardView email={email!} />
      </Suspense>
      <header className="relative w-full max-w-md overflow-hidden rounded-2xl bg-resetGreen p-4 text-white shadow-md sm:p-6">
        {/* Soft decorative circles; purely visual. */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -right-8 -top-10 size-32 rounded-full bg-white/[0.06]"
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-12 -left-6 size-28 rounded-full bg-white/[0.05]"
        />
        <div className="relative flex items-center gap-4">
          <div className="shrink-0">
            <ResetTitle compact />
          </div>
          <div className="min-w-0 flex-1 border-l border-white/20 pl-4">
            {coffees < COFFEES_TO_EXCHANGE ? (
              <>
                <p className="text-xs uppercase tracking-wider text-white/70">
                  Hola
                </p>
                <p className="line-clamp-2 break-words text-base font-bold leading-tight">
                  {name}
                </p>
                <p
                  className={`mt-1 leading-none text-resetOrange ${londrina.className}`}
                  aria-label={`${coffees} de ${COFFEES_TO_EXCHANGE} cafés`}
                >
                  <span className="text-5xl">{coffees}</span>
                  <span className="text-2xl text-white/70">
                    {" "}
                    / {COFFEES_TO_EXCHANGE}
                  </span>
                </p>
              </>
            ) : (
              <>
                <p
                  className={`text-3xl leading-none text-resetOrange ${londrina.className}`}
                >
                  ¡Lo lograste!
                </p>
                <p className="mt-1 line-clamp-2 break-words text-base font-bold leading-tight">
                  {name}
                </p>
                <Confetti />
              </>
            )}
          </div>
        </div>
        <p className="relative mt-3 border-t border-white/15 pt-3 text-center text-sm text-balance">
          {coffees < COFFEES_TO_EXCHANGE ? (
            <>
              Junta {COFFEES_TO_EXCHANGE} cafés y recibe un{" "}
              <span className="font-bold">
                cappuccino, latte o americano gratis
              </span>
            </>
          ) : (
            <>
              Tu próximo{" "}
              <span className="font-bold">
                cappuccino, latte o americano será gratis
              </span>
              .{" "}
              <span className={`text-base ${londrina.className}`}>
                Reset your day · Reset your life
              </span>
            </>
          )}
        </p>
      </header>
      <div className="grid grid-cols-2 gap-x-6 gap-y-2 py-1 sm:gap-y-3">
        {range(COFFEES_TO_EXCHANGE + 1).map((_, i) => (
          <div key={i} className="relative grid justify-items-center">
            <CoffeeSVG
              className={cn(
                "h-auto w-11 sm:w-14",
                coffees <= i && "opacity-20"
              )}
            />
            {i === COFFEES_TO_EXCHANGE && (
              <div
                className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/4 text-xs text-resetGreen opacity-80 ${londrina.className}`}
              >
                free
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  );
}
