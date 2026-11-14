import BrandLogo from "@/components/BrandLogo";
import ClubCard from "@/components/ClubCard";
import ResetTitle from "@/components/ResetTitle";
import { COFFEES_TO_EXCHANGE } from "@/lib/constants";
import { IconArrowRight } from "@tabler/icons-react";
import Link from "next/link";

const STEPS = [
  "Inicia sesión con Google",
  "Suma un café en cada visita",
  `Con ${COFFEES_TO_EXCHANGE} cafés, el siguiente va por la casa`,
];

export default async function Home() {
  return (
    <>
      <BrandLogo size="lg" />
      <div className="flex w-full max-w-md flex-col gap-3">
        <ClubCard>
          <ResetTitle compact />
          <p className="text-balance text-center text-sm">
            Por la compra de cada {COFFEES_TO_EXCHANGE} cafés, recibe un{" "}
            <span className="font-bold">
              cappuccino, latte o americano gratis
            </span>
          </p>
          <ol className="flex w-full flex-col gap-2 border-t border-white/15 pt-4">
            {STEPS.map((step, i) => (
              <li key={step} className="flex items-center gap-3 text-sm">
                <span className="grid size-7 shrink-0 place-items-center rounded-full bg-resetOrange text-sm font-bold">
                  {i + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </ClubCard>
        <Link
          href="/login"
          className="flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-resetOrange text-lg font-bold text-white shadow-sm transition active:scale-[0.98] hover:bg-resetOrange/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-resetGreen focus-visible:ring-offset-2"
        >
          Únete aquí
          <IconArrowRight className="size-5" />
        </Link>
      </div>
    </>
  );
}
