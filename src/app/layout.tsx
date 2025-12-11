import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

// 1. Configure the body font with Next.js optimization
const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans", // Matches globals.css
  display: "swap",
});

export const metadata: Metadata = {
  title: "WrappedOnChain",
  description: "2024 Recap",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Retro Heading Font */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Bitcount+Prop+Single:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className={`${dmSans.variable} antialiased min-h-screen bg-[#B1E4E3]`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}