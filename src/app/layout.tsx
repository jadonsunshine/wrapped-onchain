import type { Metadata } from "next";
import { DM_Sans, Alfa_Slab_One } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const alfaSlab = Alfa_Slab_One({
  weight: "400",
  subsets: ["latin"],
 
  variable: "--font-alfa", 
  display: "swap",
});

export const metadata: Metadata = {
  title: "WrappedOnChain 2025",
  description: "2025 Recap",
  // ADDED: Pointing to the specific image in public folder
  icons: {
    icon: '/WrappedOnchain.png', 
  },

  other: {
    "fc:frame": JSON.stringify({
      version: "next",
      imageUrl: "https://wrapped-onchain.vercel.app/WrappedOnchain.png",
      button: {
        title: "Wrap",
        action: {
          type: "launch_frame",
          name: "Wrapped Onchain",
          url: "https://wrapped-onchain.vercel.app",
          splashImageUrl: "https://wrapped-onchain.vercel.app/WrappedOnchain.png",
          splashBackgroundColor: "#B1E4FE"
        }
      }
    })
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
     
      <body className={`${dmSans.variable} ${alfaSlab.variable} font-sans antialiased min-h-screen`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}