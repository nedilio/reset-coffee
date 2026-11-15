// Pass colors. Wallet wants "rgb(r, g, b)" strings in pass.json.
export const WALLET_COLORS = {
  normal: {
    background: "rgb(65, 89, 66)", // resetGreen #415942
    foreground: "rgb(255, 255, 255)",
    label: "rgb(224, 122, 31)", // resetOrange #e07a1f
    band: "#354a36",
    stamp: "#e07a1f",
  },
  // Once the free coffee is earned the whole pass turns orange.
  reward: {
    background: "rgb(224, 122, 31)",
    foreground: "rgb(255, 255, 255)",
    label: "rgb(53, 74, 54)",
    band: "#c96a14",
    stamp: "#415942",
  },
} as const;
