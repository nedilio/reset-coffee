import { auth } from "@/auth";
import { getClientByEmail } from "@/clients";
import CardView from "@/components/CardView";
import CoffeeSVG from "@/components/Coffee";
import Confetti from "@/components/Confetti";
import ResetTitle from "@/components/ResetTitle";
import { range } from "@/lib";
import { COFFEES_TO_EXCHANGE, TABLE_NAME } from "@/lib/constants";
import { createClient } from "@/supabase-server";
import { Londrina_Solid } from "next/font/google";
import { Suspense } from "react";
const londrina = Londrina_Solid({ weight: "400", subsets: ["latin"] });

export default async function CardPage() {
  const session = await auth();
  const email = session?.user.email;
  const supabase = await createClient();

  if (!email) {
    return null;
  }
  const { coffees, name } = await getClientByEmail(email);

  return (
    <>
      <Suspense fallback={null}>
        <CardView email={email!} />
      </Suspense>
      <header className="bg-resetGreen text-white flex flex-col gap-y-4 p-8 w-full">
        <ResetTitle />
        <p className="text-sm">
          {coffees < COFFEES_TO_EXCHANGE ? (
            <>
              Hola! <span className="font-bold text-sm"> {name}</span>, tienes{" "}
              <span className="font-bold text-sm">{coffees}</span> de{" "}
              {COFFEES_TO_EXCHANGE} cafés para recibir un{" "}
              <span className="font-bold text-sm">
                cappuccino, latte o americano gratis
              </span>
            </>
          ) : (
            <span className="flex flex-col justify-center items-center">
              <span className="text-center pb-2">
                ¡{name}, Lo lograste! Tu próximo{" "}
                <span className="font-semibold">
                  cappuccino, latte o americano será gratis
                </span>
                .
              </span>
              <span className={londrina.className}>Reset your day</span>
              <span className={londrina.className}>Reset your life</span>
              <Confetti />
            </span>
          )}
        </p>
      </header>
      <div className="grid grid-cols-2 gap-4 p-3">
        {range(COFFEES_TO_EXCHANGE + 1).map((_, i) => (
          <div key={i} className="grid justify-center relative">
            <CoffeeSVG className={coffees <= i ? "opacity-20" : ""} />
            {i === COFFEES_TO_EXCHANGE && (
              <div
                className={`absolute text-xs left-3 top-6 text-resetGreen opacity-80  ${londrina.className}`}
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
