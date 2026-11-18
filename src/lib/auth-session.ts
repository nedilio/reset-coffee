import "server-only";
import { cache } from "react";
import { headers } from "next/headers";
import { auth } from "./auth";

// Deduplicated per request: the layout (Navbar) and the page share one lookup.
export const getSession = cache(async () =>
  auth.api.getSession({ headers: await headers() })
);
