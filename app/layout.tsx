import type { Metadata } from "next";
import { Space_Grotesk, Inter } from "next/font/google";
import { ViewTransitions } from "next-view-transitions";
import SmoothScroll from "@/components/SmoothScroll";
import Nav from "@/components/Nav";
import Cursor from "@/components/Cursor";
import ScrollHUD from "@/components/ScrollHUD";
import IntroOverlay from "@/components/IntroOverlay";
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
        // The intro-skip script below sets data-intro on <html> pre-hydration
        suppressHydrationWarning
      >
        <body className="min-h-svh bg-ink">
          {/* Parse-blocking on purpose: runs before the intro overlay markup
              is parsed, so repeat visits this session never paint it. A raw
              script (not next/script) keeps the timing deterministic. */}
          <script
            id="intro-skip"
            dangerouslySetInnerHTML={{
              __html: `try{sessionStorage.getItem("aj:intro")&&document.documentElement.setAttribute("data-intro","skip")}catch(e){}`,
            }}
          />
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
            {/* Needs the Lenis context; renders a fixed z-90 sheet, so its
                position in the tree doesn't matter visually */}
            <IntroOverlay />
          </SmoothScroll>
          <div aria-hidden className="vignette pointer-events-none fixed inset-0 z-65" />
          <div aria-hidden className="grain pointer-events-none fixed inset-0 z-70" />
          <Cursor />
        </body>
      </html>
    </ViewTransitions>
  );
}
