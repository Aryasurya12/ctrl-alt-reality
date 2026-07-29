import type { Metadata, Viewport } from "next";
import { Inter, Space_Mono } from "next/font/google";
import "./globals.css";
import { ExperienceProvider } from "@/components/providers/ExperienceProvider";
import { SmoothScroll } from "@/components/motion/SmoothScroll";
import { CustomCursor } from "@/components/ui/CustomCursor";
import { NoiseOverlay } from "@/components/ui/NoiseOverlay";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const spaceMono = Space_Mono({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "CTRL+ALT+REALITY — Interactive Web Experience",
  description: "An experimental interactive web experience exploring what happens when the web refuses to stay flat.",
};

export const viewport: Viewport = {
  themeColor: "#050505",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceMono.variable}`}>
      <body className="min-h-screen font-sans">
        <ExperienceProvider>
          <SmoothScroll>
            <CustomCursor />
            <NoiseOverlay />
            {children}
          </SmoothScroll>
        </ExperienceProvider>
      </body>
    </html>
  );
}
