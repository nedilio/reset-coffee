import { auth } from "@/auth";
import CoffeeSVG from "@/components/Coffee";
import Confetti from "@/components/Confetti";
import ResetTitle from "@/components/ResetTitle";
import { range } from "@/lib";
import { TABLE_NAME } from "@/lib/constants";
import { supabase } from "@/supabase.config";

import { Londrina_Solid } from "next/font/google";
const londrina = Londrina_Solid({ weight: "400", subsets: ["latin"] });

console.log(TABLE_NAME);

export default async function CardPage() {
  const session = await auth();
  const email = session?.user.email;

  const { data: user } = await supabase
    .from(TABLE_NAME)
    .select("*")
    .eq("email", email)
    .maybeSingle();
  const { coffees, name } = user;

  return (
    <>
      <header className="bg-resetGreen text-white flex flex-col gap-y-4 p-8 w-full">
        <ResetTitle />
        <p className="text-sm">
          {coffees < 8 ? (
            <>
              Hola! <span className="font-bold text-sm"> {name}</span>, tienes{" "}
              <span className="font-bold text-sm">{coffees}</span> de 8 cafés
              para recibir tu{" "}
              <span className="font-bold text-sm">café gratis</span>
            </>
          ) : (
            <span className="flex flex-col justify-center items-center">
              <span>¡{name}, lo lograste! Tu proximo café será gratis</span>
              <span className={londrina.className}>Reset your day</span>
              <span className={londrina.className}>Reset your life</span>
              <Confetti />
            </span>
          )}
        </p>
      </header>
      <div className="grid grid-cols-2 gap-4 p-3">
        {range(8).map((_, i) => (
          <div key={i} className="grid justify-center">
            <CoffeeSVG className={coffees <= i ? "opacity-20" : ""} />
          </div>
        ))}
      </div>
    </>
  );
}
