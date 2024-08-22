import { auth } from "@/auth";
export default async function LoginPage() {
  const session = await auth();

  return (
    <div>
      <h2>Login Page</h2>
      <p>Log in to access the app</p>
      <SignIn />
    </div>
  );
}

import { signIn } from "@/auth";
import { Button } from "@/components/ui/button";

function SignIn() {
  return (
    <form
      action={async () => {
        "use server";
        await signIn("google");
      }}
    >
      <Button type="submit">Signin with Google</Button>
    </form>
  );
}
