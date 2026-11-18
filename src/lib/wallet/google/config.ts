import "server-only";
import { APP_ENV } from "@/actions/ph-client";
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

// main and develop share client uuids, so ids carry the environment to keep their passes apart.
const env = () => APP_ENV.replace(/[^a-z0-9]/gi, "");
export const classId = () => `${issuer()}.reset_club_${env()}`;
export const objectId = (clientId: string) => `${issuer()}.${env()}_${clientId}`;

export const publicBase = () => webServiceBase()!;
