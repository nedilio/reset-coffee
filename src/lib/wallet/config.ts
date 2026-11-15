import "server-only";

// Everything Apple-specific comes from env vars (see CLAUDE.md). PEMs are stored base64-encoded
// so they survive Vercel's single-line env values.
const b64 = (name: string) => {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is not set`);
  return Buffer.from(value, "base64").toString("utf8");
};

export const walletEnabled = () =>
  Boolean(
    process.env.WALLET_PASS_TYPE_ID &&
      process.env.WALLET_TEAM_ID &&
      process.env.WALLET_SIGNER_CERT &&
      process.env.WALLET_SIGNER_KEY &&
      process.env.WALLET_WWDR_CERT &&
      process.env.WALLET_SECRET
  );

export const passTypeId = () => process.env.WALLET_PASS_TYPE_ID!;
export const teamId = () => process.env.WALLET_TEAM_ID!;

export const certificates = () => ({
  wwdr: b64("WALLET_WWDR_CERT"),
  signerCert: b64("WALLET_SIGNER_CERT"),
  signerKey: b64("WALLET_SIGNER_KEY"),
  signerKeyPassphrase: process.env.WALLET_SIGNER_KEY_PASSPHRASE || undefined,
});

// Stable public origin Apple calls back (prod domain, or the develop branch alias).
// Unset (e.g. localhost) = static pass without live updates.
export const webServiceBase = () => process.env.WALLET_BASE_URL?.replace(/\/$/, "");

type Shop = { lat: number; lng: number; name?: string };

// WALLET_LOCATIONS='[{"lat":-33.4,"lng":-70.6,"name":"Providencia"}]' (Apple allows up to 10).
export const shopLocations = (): Shop[] => {
  const raw = process.env.WALLET_LOCATIONS;
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as Shop[];
    return parsed
      .filter((s) => Number.isFinite(s.lat) && Number.isFinite(s.lng))
      .slice(0, 10);
  } catch {
    console.error("WALLET_LOCATIONS is not valid JSON");
    return [];
  }
};
