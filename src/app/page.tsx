import ResetTitle from "@/components/ResetTitle";
import { Button } from "@/components/ui/button";
import { COFFEES_TO_EXCHANGE } from "@/lib/constants";
import Link from "next/link";

export default async function Home() {
  return (
    <div className="flex flex-col gap-y-4">
      <header className="bg-resetGreen text-white flex flex-col gap-y-4 p-4">
        <ResetTitle />
        <p className="text-xs text-center">
          Por la compra de cada {COFFEES_TO_EXCHANGE} cafés, recibe un
          cappuccino, latte o americano gratis
        </p>
      </header>
      <section className="flex items-center justify-center">
        <Link href="/login">
          <Button variant="link" className="text-2xl">
            Únete aquí
          </Button>
        </Link>
      </section>
    </div>
  );
}
