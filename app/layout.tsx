import type { Metadata } from "next";
import { Space_Grotesk, Inter } from "next/font/google";
import { ViewTransitions } from "next-view-transitions";
import SmoothScroll from "@/components/SmoothScroll";
import Nav from "@/components/Nav";
import Cursor from "@/components/Cursor";
import ScrollHUD from "@/components/ScrollHUD";
import { site } from "@/lib/content";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: "700",
  // swap (the default) guarantees the brand font lands; "optional" was
  // sticking to the fallback whenever the preload lost the 100ms race
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: `${site.name} — ${site.tagline}`,
  description: site.oneLiner,
  openGraph: {
    title: `${site.name} — ${site.tagline}`,
    description: site.oneLiner,
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ViewTransitions>
      <html
        lang="en"
        className={`${spaceGrotesk.variable} ${inter.variable} antialiased`}
      >
        <body className="min-h-svh bg-ink">
          <a
            href="#main"
            className="sr-only z-100 rounded-md bg-accent px-4 py-2 font-medium text-ink focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
          >
            Skip to content
          </a>
          <SmoothScroll>
            <Nav />
            {children}
            <ScrollHUD />
          </SmoothScroll>
          <div aria-hidden className="vignette pointer-events-none fixed inset-0 z-65" />
          <div aria-hidden className="grain pointer-events-none fixed inset-0 z-70" />
          <Cursor />
        </body>
      </html>
    </ViewTransitions>
  );
}
