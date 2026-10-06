import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Try-On Recovery & Taste Loop Concept | Flickd Product Prototype",
  description:
    "An independent product concept exploring cause-specific failure diagnosis, recovery pathways, and local taste feedback loops for AI-powered virtual try-on experiences.",
  keywords: ["virtual try-on", "product design", "failure recovery", "taste loop", "fashion AI", "UX prototype"],
  authors: [{ name: "Satjeet Singh" }],
  openGraph: {
    title: "Try-On Recovery & Taste Loop Concept",
    description: "Turning AI try-on generation failures into meaningful recovery interactions and personalized taste loops.",
    type: "website",
    siteName: "Try-On Recovery Concept",
  },
  twitter: {
    card: "summary_large_image",
    title: "Try-On Recovery & Taste Loop Concept",
    description: "Turning AI try-on generation failures into meaningful recovery interactions and personalized taste loops.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-background text-foreground selection:bg-accent/20">
        {children}
      </body>
    </html>
  );
}

