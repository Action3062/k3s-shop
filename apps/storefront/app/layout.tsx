import "./globals.css";
import type { Metadata } from "next";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { Inter, JetBrains_Mono } from "next/font/google";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "https://store.dyndnsv4.de"),
  title: "DynStore — Self-hosted Apps, live in Minuten",
  description: "Wähle eine App, abonniere sie und erhalte eine isolierte Instanz unter deiner eigenen Subdomain — mit automatischem HTTPS.",
  openGraph: { title: "DynStore", description: "Self-hosted Apps, live in Minuten — auf deiner eigenen Subdomain.", images: ["/og.png"], type: "website", locale: "de_DE" },
  twitter: { card: "summary_large_image", images: ["/og.png"] },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" className={`${inter.variable} ${mono.variable} dark`}>
      <body className="font-sans antialiased bg-bg text-ink">
        <Nav />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
