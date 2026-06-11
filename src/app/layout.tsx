import type { Metadata, Viewport } from "next";
import BottomNav from "@/components/BottomNav";
import "./globals.css";

export const metadata: Metadata = {
  title: "Museo — Pokémon Go for Art",
  description:
    "Scan artworks in museums, build your collection, and level up your art knowledge.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Museo",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0f0a1a",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-museo-dark text-white antialiased">
        <div className="mx-auto flex min-h-dvh max-w-lg flex-col">
          <main className="flex-1 pb-20">{children}</main>
          <BottomNav />
        </div>
      </body>
    </html>
  );
}
