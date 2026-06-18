import "./globals.css";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/700.css";
import "@fontsource/jetbrains-mono/400.css";
import "@fontsource/jetbrains-mono/500.css";
import type { Metadata } from "next";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "https://store.meinappnest.org"),
  title: "DynStore — Self-hosted Apps, live in Minuten",
  description: "Wähle eine App, abonniere sie und erhalte eine isolierte Instanz unter deiner eigenen Subdomain — mit automatischem HTTPS.",
  openGraph: { title: "DynStore", description: "Self-hosted Apps, live in Minuten — auf deiner eigenen Subdomain.", images: ["/og.png"], type: "website", locale: "de_DE" },
  twitter: { card: "summary_large_image", images: ["/og.png"] },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" className="dark">
      <body className="font-sans antialiased bg-bg text-ink">
        <Nav />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
