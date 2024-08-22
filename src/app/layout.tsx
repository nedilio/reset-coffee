import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "The Reset Club | Reset Coffee",
  description: "por la compra de cada 8 cafés, recibe uno gratis",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <main className="flex min-h-dvh flex-col items-center justify-between p-8">
          <Navbar></Navbar>
          {children}
          <footer className="text-xs font-semibold flex flex-col justify-center items-center gap-y-3">
            <p>
              <a
                href="https://maps.app.goo.gl/KfZLCrnMgPcT7Tpf6"
                target="_blank"
                rel="noopener no referrer"
              >
                📍{" "}
                <span className="underline text-green-950">
                  Perez Valenzuela 1215, Providencia
                </span>
              </a>
            </p>
            <p>
              <a
                href="https://www.instagram.com/resetcoffeechile?igsh=MWh0eG1iOXBvM2F4Zw=="
                target="_blank"
                rel="noopenner noreferrer"
              >
                📸{" "}
                <span className="underline text-green-950">
                  @resetcoffeechile
                </span>
              </a>
            </p>
          </footer>
        </main>
      </body>
    </html>
  );
}
