import "server-only";
import { APP_ENV, BUSINESS_NAME } from "@/actions/ph-client";
import { webServiceBase } from "../config";

// Google Wallet is optional: without these the "Agregar a Google Wallet" button is hidden.
// Images must be reachable by Google, so a public WALLET_BASE_URL is required too.
export const googleWalletEnabled = () =>
  Boolean(
    process.env.GOOGLE_WALLET_ISSUER_ID &&
      process.env.GOOGLE_WALLET_SA_KEY &&
      process.env.WALLET_SECRET &&
      webServiceBase()
  );

export type ServiceAccount = { client_email: string; private_key: string };

// GOOGLE_WALLET_SA_KEY = the service account JSON key, base64-encoded (same convention as the Apple PEMs).
export const serviceAccount = (): ServiceAccount =>
  JSON.parse(Buffer.from(process.env.GOOGLE_WALLET_SA_KEY!, "base64").toString("utf8"));

const issuer = () => process.env.GOOGLE_WALLET_ISSUER_ID!;

// One Welve issuer serves every business, so ids carry the business (slug of BUSINESS_NAME)
// and the environment: main and develop share client uuids, and two cafés must never share a class.
const slug = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "") || "negocio";
const scope = () => `${slug(BUSINESS_NAME)}_${APP_ENV.replace(/[^a-z0-9]/gi, "")}`;
export const classId = () => `${issuer()}.${scope()}`;
export const objectId = (clientId: string) => `${issuer()}.${scope()}_${clientId}`;

export const publicBase = () => webServiceBase()!;
