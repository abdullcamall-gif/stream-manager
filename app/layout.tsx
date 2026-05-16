import type { Metadata } from "next";
import { Space_Grotesk, Spline_Sans } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

const splineSans = Spline_Sans({
  variable: "--font-spline-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ElberStreaming | O Melhor do Cinema",
  description: "Séries exclusivas e filmes premiados. Viva a experiência definitiva de streaming.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${spaceGrotesk.variable} ${splineSans.variable} scroll-smooth dark`}
    >
      <body className="font-body selection:bg-primary/30 selection:text-primary">
        {children}
      </body>
    </html>
  );
}
