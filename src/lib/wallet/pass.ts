import "server-only";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { PKPass } from "passkit-generator";
import { COFFEES_TO_EXCHANGE } from "@/lib/constants";
import { certificates, passTypeId, shopLocations, teamId, webServiceBase } from "./config";
import { renderStrip } from "./strip";
import { WALLET_COLORS } from "./theme";
import { passAuthToken, signClientToken } from "./token";

export type PassClient = {
  id: string;
  name: string | null;
  coffees: number;
  // Tells a redeemed reward from a manual reset when the card is back at 0.
  last_change?: string | null;
};

const ASSETS = path.join(process.cwd(), "src/lib/wallet/assets");
const STATIC_FILES = [
  "icon.png", "icon@2x.png", "icon@3x.png",
  "logo.png", "logo@2x.png", "logo@3x.png",
];

let staticCache: Record<string, Buffer> | null = null;
async function staticAssets() {
  // Cached only in production, so edited PNGs show up in dev without a restart.
  if (!staticCache || process.env.NODE_ENV !== "production") {
    const entries = await Promise.all(
      STATIC_FILES.map(async (f) => [f, await readFile(path.join(ASSETS, f))] as const)
    );
    staticCache = Object.fromEntries(entries);
  }
  return staticCache;
}

export async function buildPass(client: PassClient): Promise<Buffer> {
  const coffees = Math.min(client.coffees, COFFEES_TO_EXCHANGE);
  const reward = coffees >= COFFEES_TO_EXCHANGE;
  const left = COFFEES_TO_EXCHANGE - coffees;
  const colors = reward ? WALLET_COLORS.reward : WALLET_COLORS.normal;
  const name = client.name?.trim() || "Socio Reset";
  const base = webServiceBase();
  const locations = shopLocations();

  const passJson = {
    formatVersion: 1,
    passTypeIdentifier: passTypeId(),
    teamIdentifier: teamId(),
    serialNumber: client.id,
    organizationName: "Reset Coffee",
    description: "Tarjeta de cafés The RESeT Club",
    backgroundColor: colors.background,
    foregroundColor: colors.foreground,
    labelColor: colors.label,
    sharingProhibited: true,
    ...(base && {
      webServiceURL: `${base}/api/wallet`,
      authenticationToken: passAuthToken(client.id),
    }),
    ...(locations.length > 0 && {
      locations: locations.map((s) => ({
        latitude: s.lat,
        longitude: s.lng,
        relevantText: reward
          ? "¡Tu café gratis te espera en Reset!"
          : `Pasa por tu café a Reset${s.name ? ` ${s.name}` : ""} ☕`,
      })),
    }),
    storeCard: {
      headerFields: [
        {
          key: "coffees",
          label: "CAFÉS",
          value: `${coffees}/${COFFEES_TO_EXCHANGE}`,
          // Only this field has a changeMessage, so each update shows one notification.
          changeMessage: reward
            ? "¡Tarjeta completa! Café gratis en tu próxima visita ☕"
            : coffees === 0
              ? client.last_change === "redeemed"
                ? "Café gratis canjeado ✅ ¡A juntar sellos de nuevo!"
                : "Tu tarjeta volvió a 0 sellos"
              : "☕ Llevas %@ cafés",
        },
      ],
      secondaryFields: [{ key: "member", label: "SOCIO", value: name }],
      auxiliaryFields: [
        reward
          ? { key: "status", label: "PREMIO", value: "Gratis en tu próxima visita", textAlignment: "PKTextAlignmentRight" }
          : {
              key: "status",
              label: "TE FALTAN",
              value: `${left} ${left === 1 ? "café" : "cafés"}`,
              textAlignment: "PKTextAlignmentRight",
            },
      ],
      backFields: [
        {
          key: "rules",
          label: "Cómo funciona",
          value: `Muestra este código al pedir y el barista sumará tu café. Junta ${COFFEES_TO_EXCHANGE} y el siguiente cappuccino, latte o americano es gratis.`,
        },
        { key: "card", label: "Tu tarjeta online", value: `${base ?? "https://reset-coffee.vercel.app"}/card` },
        { key: "motto", label: "", value: "Reset your day · Reset your life" },
      ],
    },
    barcodes: [
      {
        format: "PKBarcodeFormatQR",
        message: signClientToken(client.id),
        messageEncoding: "iso-8859-1",
      },
    ],
  };

  const [strip1, strip2, strip3] = await Promise.all(
    ([1, 2, 3] as const).map((s) => renderStrip(coffees, s))
  );

  const pass = new PKPass(
    {
      ...(await staticAssets()),
      "strip.png": strip1,
      "strip@2x.png": strip2,
      "strip@3x.png": strip3,
      "pass.json": Buffer.from(JSON.stringify(passJson)),
    },
    certificates()
  );
  return pass.getAsBuffer();
}

export const PKPASS_HEADERS = {
  "Content-Type": "application/vnd.apple.pkpass",
  "Cache-Control": "no-store",
};
