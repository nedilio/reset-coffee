import type { Metadata } from "next";
import { Figtree } from "next/font/google";
import "./globals.css";
import Footer from "@/components/Footer";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { PhProvider } from "@/app/providers/ph-provider";

const figtree = Figtree({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "The Reset Club | Reset Coffee",
  description:
    "por la compra de cada 9 cafés, recibe un cappuccino, latte o americano gratis",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <PhProvider>
        <body className={figtree.className}>
          <main className="flex min-h-dvh flex-col items-center justify-between gap-3 p-4 sm:p-8">
            <Analytics />
            <SpeedInsights />
            {children}
            <Footer />
          </main>
        </body>
      </PhProvider>
    </html>
  );
}
