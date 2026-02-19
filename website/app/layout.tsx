import type { Metadata } from "next";
import { GeistPixelSquare } from "geist/font/pixel";
import "./globals.css";

export const metadata: Metadata = {
  title: "Arfak - Open-Source Personal AI Assistant",
  description:
    "Open-Source Personal AI Assistant for You. Private, extensible, and built for everyone.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${GeistPixelSquare.variable} font-sans antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
