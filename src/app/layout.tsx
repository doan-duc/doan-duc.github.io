import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import SmoothScroll from "@/components/providers/SmoothScroll";
import { Background } from "@/components/background/Background";
import { ScrollProgress } from "@/components/motion/ScrollProgress";
import { Nav } from "@/components/layout/Nav";
import { Footer } from "@/components/layout/Footer";
import { site } from "@/lib/site";

// Body typeface (Geist is a fine alternative — swap the import below).
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: `${site.name} — ${site.role}`,
  description: site.summary,
  openGraph: {
    title: `${site.name} — ${site.role}`,
    description: site.summary,
    type: "website",
  },
  // 👉 Add a real /public/og.png and a metadataBase when you deploy.
};

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="grain min-h-screen bg-base text-ink antialiased">
        {/* Display typeface — Clash Display (Fontshare). React hoists this to
            <head>. If it fails to load, font-display falls back gracefully. */}
        <link
          rel="stylesheet"
          href="https://api.fontshare.com/v2/css?f[]=clash-display@600,500,700,400&display=swap"
          precedence="default"
        />

        <SmoothScroll>
          <Background />
          <ScrollProgress />
          <Nav />
          <main className="relative">{children}</main>
          <Footer />
        </SmoothScroll>
      </body>
    </html>
  );
}
