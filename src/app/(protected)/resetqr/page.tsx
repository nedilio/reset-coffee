import CoffeeSVG from "@/components/Coffee";
import ResetTitle from "@/components/ResetTitle";
import { range } from "@/lib";
import { COFFEES_TO_EXCHANGE } from "@/lib/constants";
import { Londrina_Solid } from "next/font/google";

const londrina = Londrina_Solid({ weight: "400", subsets: ["latin"] });

// Shown on the counter tablet for customers to scan. The QR is a 150px 1-bit PNG, so it is
// drawn at exactly 2x with pixelated rendering to stay sharp, on white for the quiet zone.
const QRPage = () => {
  return (
    <section className="flex w-full max-w-md flex-col items-center gap-6 rounded-3xl bg-resetGreen px-6 py-9 text-white shadow-lg sm:px-10">
      <ResetTitle />

      <div className="rounded-2xl bg-white p-4 shadow-md">
        <img
          src="/img/qr-reset.png"
          alt="Código QR para unirte al Reset Club"
          width={300}
          height={300}
          className="size-[min(300px,70vw)] [image-rendering:pixelated]"
        />
      </div>

      <div className="flex flex-col items-center gap-2 text-center">
        <p className="text-xl font-bold">Escanea y únete</p>
        <p className="max-w-[28ch] text-balance text-sm text-white/80">
          Inicia sesión con Google y suma un café en cada visita.
        </p>
      </div>

      <div
        className="flex items-end justify-center gap-1.5"
        aria-label={`Con ${COFFEES_TO_EXCHANGE} cafés, el siguiente es gratis`}
      >
        {range(COFFEES_TO_EXCHANGE).map((i) => (
          <CoffeeSVG key={i} className="size-5 text-white/90" />
        ))}
        <CoffeeSVG className="size-7 text-resetOrange" />
      </div>

      <div className={`text-center text-lg leading-tight ${londrina.className}`}>
        <p>Reset your day</p>
        <p>Reset your life</p>
      </div>
    </section>
  );
};

export default QRPage;
