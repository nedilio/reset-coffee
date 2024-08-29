import { signIn } from "@/auth";
import GoogleLogo from "@/components/GoogleLogo";
import { Button } from "@/components/ui/button";

const signInAction = async () => {
  "use server";
  await signIn("google");
};

export default async function LoginPage() {
  return (
    <div>
      <form action={signInAction}>
        <Button variant="default" className="flex gap-x-2 " type="submit">
          <span>Inicia sesión con Google</span> <GoogleLogo />
        </Button>
      </form>
    </div>
  );
}
