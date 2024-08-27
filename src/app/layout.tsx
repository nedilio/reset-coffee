import type { Metadata } from "next";
import { Figtree } from "next/font/google";
import "./globals.css";
import Footer from "@/components/Footer";
import Link from "next/link";

const figtree = Figtree({ subsets: ["latin"] });

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
      <body className={figtree.className}>
        <main className="flex min-h-dvh flex-col items-center justify-between p-8 gap-3">
          <header>
            <Link href="/">
              <img
                className="w-52 mx-auto "
                width={208}
                height={86}
                src="/img/reset-coffee-logo.webp"
                alt="Reset Cofee"
              />
            </Link>
          </header>
          {children}
          <Footer />
        </main>
      </body>
    </html>
  );
}
