import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://doan-duc.github.io"),
  title: "Duc Doan Sinh | AI & Embedded Systems Portfolio",
  description:
    "Personal profile website for Duc Doan Sinh, an AI and Embedded Systems student focused on neuromorphic computing, biosignal AI, edge vision, and international research experiences.",
  authors: [{ name: "Duc Doan Sinh" }],
  openGraph: {
    title: "Duc Doan Sinh | AI & Embedded Systems Portfolio",
    description:
      "Research, projects, awards, and international experiences from an AI/Embedded Systems student.",
    images: ["/images/profile.jpg"],
    type: "website"
  }
};

export const viewport: Viewport = {
  themeColor: "#07090f",
  colorScheme: "dark"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
