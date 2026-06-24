import type { Metadata, Viewport } from "next";
import { Nunito, Nunito_Sans } from "next/font/google";
import "./globals.css";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["300", "400", "600", "700"],
});

const nunitoSans = Nunito_Sans({
  variable: "--font-nunito-sans",
  subsets: ["latin"],
  weight: ["300", "400", "600", "700"],
});

export const metadata: Metadata = {
  title: "Ecoembes · Cada declaración, verificada",
  description: "Plataforma de verificación de declaraciones Ecoembes impulsada por Sapira AI",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // The product chrome is a fixed app shell; prevent the iOS rubber-band/zoom
  // that would otherwise expose the canvas edges behind fixed bars.
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${nunito.variable} ${nunitoSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-[var(--font-nunito)]">{children}</body>
    </html>
  );
}
