import "server-only";
import { readFileSync } from "node:fs";
import path from "node:path";
import { ImageResponse } from "next/og";
import { COFFEE_GROUP_TRANSFORM, COFFEE_PATHS, COFFEE_VIEWBOX } from "@/lib/coffee-paths";
import { COFFEES_TO_EXCHANGE } from "@/lib/constants";
import { WALLET_COLORS } from "./theme";

// storeCard strip: 375 x 144 pt (Apple's size for passes without a 3.5" square-barcode squeeze).
const W = 375;
const H = 144;
const SLOTS = COFFEES_TO_EXCHANGE + 1; // 9 stamps + the free one
const COLS = 5;
const GAP_X = 62;
const R = 21;
const ROWS_Y = [40, 104];
// Fixed "hand stamped" tilt per slot, so the card looks the same on every render.
const TILT = [-12, 8, -4, 15, -9, 6, -14, 10, -6, 0];

// The walking cup as a faint watermark behind the stamps (storeCard has no background.png).
const MASCOT_SRC = `data:image/png;base64,${readFileSync(
  path.join(process.cwd(), "src/lib/wallet/assets/mascot.png")
).toString("base64")}`;
const MASCOT_H = 170;
const MASCOT_W = (MASCOT_H * 305) / 450; // mascot.png is 305 x 450
const MASCOT_OPACITY = 0.1;

const slotCenter = (i: number) => ({
  x: W / 2 + ((i % COLS) - (COLS - 1) / 2) * GAP_X,
  y: ROWS_Y[Math.floor(i / COLS)],
});

const cup = (fill: string) =>
  `<g transform="${COFFEE_GROUP_TRANSFORM}">${COFFEE_PATHS.map(
    (p) => `<path d="${p.d}" transform="${p.transform}" fill="${fill}"/>`
  ).join("")}</g>`;

// Whole strip drawn as one SVG: satori is limited with transforms, resvg (which rasterizes
// <img> sources) is not.
function stripSvg(coffees: number): string {
  const reward = coffees >= COFFEES_TO_EXCHANGE;
  const c = reward ? WALLET_COLORS.reward : WALLET_COLORS.normal;
  const cupScale = (R * 1.25) / COFFEE_VIEWBOX.width;
  const slots = Array.from({ length: SLOTS }, (_, i) => {
    const { x, y } = slotCenter(i);
    const isFree = i === SLOTS - 1;
    if (isFree) {
      return reward
        ? `<circle cx="${x}" cy="${y}" r="${R + 1}" fill="#ffffff"/>`
        : `<circle cx="${x}" cy="${y}" r="${R}" fill="none" stroke="${c.stamp}" stroke-width="2"/>`;
    }
    if (i < coffees) {
      const cx = (-COFFEE_VIEWBOX.width / 2) * cupScale;
      const cy = (-COFFEE_VIEWBOX.height / 2) * cupScale;
      return `<g transform="translate(${x} ${y}) rotate(${TILT[i]})">
        <circle r="${R}" fill="${c.stamp}"/>
        <circle r="${R - 3}" fill="none" stroke="#ffffff" stroke-opacity="0.35" stroke-width="1" stroke-dasharray="2 2"/>
        <g transform="translate(${cx} ${cy}) scale(${cupScale})">${cup("#ffffff")}</g>
      </g>`;
    }
    return `<circle cx="${x}" cy="${y}" r="${R - 1}" fill="none" stroke="#ffffff" stroke-opacity="0.5" stroke-width="1.5" stroke-dasharray="4 3"/>`;
  }).join("");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
    <rect width="${W}" height="${H}" fill="${c.band}"/>
    <image href="${MASCOT_SRC}" x="${W - MASCOT_W * 0.8}" y="${(H - MASCOT_H) / 2 + 6}" width="${MASCOT_W}" height="${MASCOT_H}" opacity="${MASCOT_OPACITY}" transform="rotate(-8 ${W - MASCOT_W * 0.3} ${H / 2})"/>
    <line x1="0" y1="1.5" x2="${W}" y2="1.5" stroke="#ffffff" stroke-opacity="0.35" stroke-dasharray="6 4"/>
    <line x1="0" y1="${H - 1.5}" x2="${W}" y2="${H - 1.5}" stroke="#ffffff" stroke-opacity="0.35" stroke-dasharray="6 4"/>
    ${slots}
  </svg>`;
}

export async function renderStrip(coffees: number, scale: 1 | 2 | 3): Promise<Buffer> {
  const reward = coffees >= COFFEES_TO_EXCHANGE;
  const c = reward ? WALLET_COLORS.reward : WALLET_COLORS.normal;
  const svg = stripSvg(coffees);
  const free = slotCenter(SLOTS - 1);
  const src = `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
  const image = new ImageResponse(
    (
      <div style={{ display: "flex", position: "relative", width: W * scale, height: H * scale }}>
        <img src={src} width={W * scale} height={H * scale} alt="" />
        {/* Text is laid out by satori (it has the font); the SVG only carries shapes. */}
        <div
          style={{
            position: "absolute",
            left: (free.x - R) * scale,
            top: (free.y - R) * scale,
            width: 2 * R * scale,
            height: 2 * R * scale,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 13 * scale,
            fontWeight: 700,
            color: reward ? c.band : c.stamp,
          }}
        >
          free
        </div>
      </div>
    ),
    { width: W * scale, height: H * scale }
  );
  return Buffer.from(await image.arrayBuffer());
}
