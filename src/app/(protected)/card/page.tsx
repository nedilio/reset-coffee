import { auth } from "@/auth";
import Confetti from "@/components/Confetti";
import { range } from "@/lib";
import { supabase } from "@/supabase.config";
import { IconCoffee } from "@tabler/icons-react";

export default async function CardPage() {
  const session = await auth();
  const email = session?.user?.email;
  const { data: user } = await supabase
    .from("users")
    .select("*")
    .eq("email", email);
  const { coffees } = user?.[0];

  return (
    <div>
      <header className="bg-green-900 text-white flex flex-col gap-y-4 p-4">
        <h1 className="text-6xl text-balance">The Reset Club</h1>
        <p className="text-xs">
          Hola!{" "}
          <span className="font-bold text-sm"> {session?.user?.name}</span>,
          tienes <span className="font-bold text-sm">{coffees}</span> de 8 cafés
          para reclamar tu{" "}
          <span className="font-bold text-sm">café gratis</span>
        </p>
      </header>
      {coffees === 8 ? <Confetti /> : null}
      <div className="grid grid-cols-2 gap-4 p-3">
        {range(8).map((_, i) => {
          if (i < coffees) {
            return (
              <div key={i} className="grid justify-center">
                <IconCoffee stroke={1.5} size={50} />
              </div>
            );
          }
          return (
            <div key={i} className="grid opacity-20 justify-center">
              <IconCoffee stroke={1} size={50} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
