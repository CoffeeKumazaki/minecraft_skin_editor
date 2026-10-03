import type { Metadata } from "next";
import { Bricolage_Grotesque, IBM_Plex_Mono, Caveat, Silkscreen } from "next/font/google";
import "./globals.css";

const bricolage = Bricolage_Grotesque({
  weight: ["500", "700", "800"],
  subsets: ["latin"],
  variable: "--font-bricolage",
});

const plexMono = IBM_Plex_Mono({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-plex-mono",
});

const caveat = Caveat({
  weight: "500",
  subsets: ["latin"],
  variable: "--font-caveat",
});

const silkscreen = Silkscreen({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-silkscreen",
});

export const metadata: Metadata = {
  title: "Minecraft Skin Editor",
  description: "Create and edit Minecraft skins with real-time 3D preview",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${bricolage.variable} ${plexMono.variable} ${caveat.variable} ${silkscreen.variable}`}>
        {children}
      </body>
    </html>
  );
}
