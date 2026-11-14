import { signIn } from "@/auth";
import BrandLogo from "@/components/BrandLogo";
import ClubCard from "@/components/ClubCard";
import GoogleLogo from "@/components/GoogleLogo";
import ResetTitle from "@/components/ResetTitle";
import { Button } from "@/components/ui/button";
import { IconArrowLeft } from "@tabler/icons-react";
import Link from "next/link";

const signInAction = async () => {
  "use server";
  await signIn("google");
};

export default async function LoginPage() {
  return (
    <>
      <BrandLogo size="lg" />
      <div className="flex w-full max-w-md flex-col items-center gap-3">
        <ClubCard>
          <ResetTitle compact />
          <div className="text-center">
            <p className="text-xl font-bold">Bienvenido/a al club</p>
            <p className="mt-1 text-balance text-sm text-white/80">
              Entra con tu cuenta de Google y empieza a sumar cafés.
            </p>
          </div>
          <form action={signInAction} className="w-full">
            <Button
              type="submit"
              className="h-14 w-full gap-3 rounded-xl bg-white text-base font-semibold text-foreground shadow-sm hover:bg-white/90 active:scale-[0.98]"
            >
              <GoogleLogo className="size-5" />
              Inicia sesión con Google
            </Button>
          </form>
          <p className="text-balance text-center text-xs text-white/70">
            Usamos tu nombre y correo solo para guardar tu tarjeta de cafés.
          </p>
        </ClubCard>
        <Link
          href="/"
          className="inline-flex h-11 items-center gap-1.5 rounded-full px-4 text-sm font-semibold text-resetGreen hover:bg-resetGreen/10"
        >
          <IconArrowLeft className="size-4" />
          Volver al inicio
        </Link>
      </div>
    </>
  );
}
