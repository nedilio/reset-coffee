import "server-only";
import { BUSINESS_NAME } from "@/actions/ph-client";
import { COFFEES_TO_EXCHANGE } from "@/lib/constants";
import { signClientToken } from "../token";
import { shopLocations } from "../config";
import { WALLET_COLORS } from "../theme";
import { classId, objectId, publicBase } from "./config";

const hex = (rgb: string) => {
  const [r, g, b] = rgb.match(/\d+/g)!.map(Number);
  return "#" + [r, g, b].map((n) => n.toString(16).padStart(2, "0")).join("");
};

const text = (value: string) => ({ defaultValue: { language: "es", value } });

export type GoogleClient = {
  id: string;
  name: string | null;
  coffees: number;
};

export const loyaltyClass = () => ({
  id: classId(),
  issuerName: BUSINESS_NAME,
  programName: BUSINESS_NAME,
  programLogo: {
    sourceUri: { uri: `${publicBase()}/api/wallet/google/logo` },
    contentDescription: text(BUSINESS_NAME),
  },
  hexBackgroundColor: hex(WALLET_COLORS.normal.background),
  countryCode: "CL",
  reviewStatus: "UNDER_REVIEW",
  merchantLocations: shopLocations().map((s) => ({ latitude: s.lat, longitude: s.lng })),
  textModulesData: [
    {
      id: "rules",
      header: "Cómo funciona",
      body: `Muestra este código al pedir y el barista sumará tu café. Junta ${COFFEES_TO_EXCHANGE} y el siguiente cappuccino, latte o americano es gratis.`,
    },
  ],
  linksModuleData: {
    uris: [{ id: "card", uri: `${publicBase()}/card`, description: "Tu tarjeta online" }],
  },
});

export function loyaltyObject(client: GoogleClient) {
  const coffees = Math.min(client.coffees, COFFEES_TO_EXCHANGE);
  const reward = coffees >= COFFEES_TO_EXCHANGE;
  const left = COFFEES_TO_EXCHANGE - coffees;
  const colors = reward ? WALLET_COLORS.reward : WALLET_COLORS.normal;
  return {
    id: objectId(client.id),
    classId: classId(),
    state: "ACTIVE",
    accountId: client.id.slice(0, 8),
    accountName: client.name?.trim() || "Socio",
    hexBackgroundColor: hex(colors.background),
    loyaltyPoints: {
      label: "Cafés",
      balance: { string: `${coffees}/${COFFEES_TO_EXCHANGE}` },
    },
    secondaryLoyaltyPoints: reward
      ? { label: "Premio", balance: { string: "Café gratis" } }
      : { label: "Te faltan", balance: { string: `${left} ${left === 1 ? "café" : "cafés"}` } },
    barcode: { type: "QR_CODE", value: signClientToken(client.id), alternateText: "" },
    heroImage: {
      sourceUri: { uri: `${publicBase()}/api/wallet/google/hero/${coffees}` },
      contentDescription: text(`${coffees} de ${COFFEES_TO_EXCHANGE} cafés`),
    },
  };
}
