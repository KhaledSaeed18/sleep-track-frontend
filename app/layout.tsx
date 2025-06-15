import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ConditionalLayout } from "@/components";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SleepTrack - Track Your Sleep, Improve Your Life",
  description: "SleepTrack is a comprehensive sleep tracking web application. Register, log your sleep sessions, and view detailed statistics on your sleep history to improve your sleep quality and overall health.",
  keywords: ["sleep tracking", "sleep analysis", "sleep statistics", "health", "wellness", "sleep log"],
  authors: [{ name: "SleepTrack Team" }],
  creator: "SleepTrack",
  publisher: "SleepTrack",
  robots: "index, follow",
  openGraph: {
    title: "SleepTrack - Track Your Sleep, Improve Your Life",
    description: "Track your sleep sessions and view detailed statistics to improve your sleep quality.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "SleepTrack - Track Your Sleep, Improve Your Life",
    description: "Track your sleep sessions and view detailed statistics to improve your sleep quality.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="retro">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >
        <ConditionalLayout>
          {children}
        </ConditionalLayout>
      </body>
    </html>
  );
}
