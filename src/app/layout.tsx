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
          <footer className="text-xs flex flex-col justify-center items-center gap-y-2">
            <p>
              <a
                href="https://maps.app.goo.gl/pT32jjkPNsdb8YLY6?g_st=com.google.maps.preview.copy"
                target="_blank"
                rel="noopener no referrer"
              >
                perez valenzuela 1215, providencia
              </a>
            </p>
            <p>
              <a
                href="https://www.instagram.com/resetcoffeechile?igsh=MWh0eG1iOXBvM2F4Zw=="
                target="_blank"
                rel="noopenner noreferrer"
              >
                @resetcoffeechile
              </a>
            </p>
          </footer>
        </main>
      </body>
    </html>
  );
}
