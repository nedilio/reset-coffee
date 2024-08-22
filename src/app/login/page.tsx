export default async function LoginPage() {
  return (
    <div>
      <form
        action={async () => {
          "use server";
          await signIn("google");
        }}
      >
        <Button className="flex gap-x-2" type="submit">
          <span>Inicia sesión con Google</span> <GoogleLogo />
        </Button>
      </form>
    </div>
  );
}

import { signIn } from "@/auth";
import GoogleLogo from "@/components/GoogleLogo";
import { Button } from "@/components/ui/button";
