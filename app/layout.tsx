import type { Metadata } from "next";
import "./globals.css";

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
      className="scroll-smooth dark"
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300..700&family=Spline+Sans:wght@300..700&display=swap" rel="stylesheet" />
      </head>
      <body 
        className="font-body selection:bg-primary/30 selection:text-primary"
        style={{
          // @ts-ignore - custom properties
          "--font-space-grotesk": "'Space Grotesk', sans-serif",
          "--font-spline-sans": "'Spline Sans', sans-serif",
        }}
      >
        {children}
      </body>
    </html>
  );
}
