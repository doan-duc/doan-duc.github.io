import type { Metadata, Viewport } from "next";
import "./globals.css";

import SmoothScroll from "@/components/providers/SmoothScroll";
import { AmbientGate } from "@/components/motion/AmbientGate";
import { ScrollProgress } from "@/components/motion/ScrollProgress";
import { SignalCursor } from "@/components/motion/SignalCursor";
import { Nav } from "@/components/layout/Nav";
import { Footer } from "@/components/layout/Footer";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: `${site.name} - ${site.role}`,
  description: site.summary,
  openGraph: {
    title: `${site.name} - ${site.role}`,
    description: site.summary,
    type: "website",
  },
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
    <html lang="en">
      <body className="min-h-screen bg-base text-ink antialiased">
        {/* Self-hosted display typeface — preloaded so headings never swap late. */}
        <link
          rel="preload"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
          href="/fonts/ClashDisplay-Variable.woff2"
        />

        <SmoothScroll>
          <div id="aurora" aria-hidden="true">
            <span className="aurora-blob aurora-1" />
            <span className="aurora-blob aurora-2" />
            <span className="aurora-blob aurora-3" />
          </div>
          <ScrollProgress />
          <AmbientGate />
          <SignalCursor />
          <Nav />
          <main className="relative z-[1]">{children}</main>
          <Footer />
        </SmoothScroll>
      </body>
    </html>
  );
}
