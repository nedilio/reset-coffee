import { auth } from "@/auth";
import CoffeeSVG from "@/components/Coffee";
import Confetti from "@/components/Confetti";
import ResetTitle from "@/components/ResetTitle";
import { range } from "@/lib";
import { supabase } from "@/supabase.config";

export default async function CardPage() {
  const session = await auth();
  const email = session?.user?.email;
  const { data: user } = await supabase
    .from("users")
    .select("*")
    .eq("email", email);
  const { coffees } = user?.[0];

  return (
    <>
      <header className="bg-resetGreen text-white flex flex-col gap-y-4 p-4">
        <ResetTitle />

        <p className="text-sm">
          Hola!{" "}
          <span className="font-bold text-sm"> {session?.user?.name}</span>,
          tienes <span className="font-bold text-sm">{coffees}</span> de 8 cafés
          para reclamar tu{" "}
          <span className="font-bold text-sm">café gratis</span>
        </p>
      </header>
      {coffees === 8 ? <Confetti /> : null}
      <div className="grid grid-cols-2 gap-4 p-3">
        {range(8).map((_, i) => (
          <div key={i} className="grid justify-center">
            <CoffeeSVG className={coffees <= i ? "opacity-20" : undefined} />
          </div>
        ))}
      </div>
    </>
  );
}
