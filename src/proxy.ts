import { getSessionCookie } from "better-auth/cookies";
import { NextResponse, type NextRequest } from "next/server";

// Optimistic check, no DB: it only looks for the session cookie. Every protected page validates
// the session (and the role) itself, and `/` and `/login` redirect real sessions to /card.
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasCookie = !!getSessionCookie(request);
  const needsLogin = pathname.startsWith("/card") || pathname.startsWith("/admin");

  if (needsLogin && !hasCookie) {
    return NextResponse.redirect(new URL("/", request.url));
  }
  return NextResponse.next();
}

export const config = {
  // https://nextjs.org/docs/app/api-reference/file-conventions/proxy#matcher
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"],
};
