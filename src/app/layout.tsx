import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AppDataProvider } from "@/context/app-data";
import { BottomNav } from "@/components/bottom-nav";
import { ServiceWorkerRegister } from "@/components/sw-register";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Workout & Voeding",
  description: "Bijhouden van workouts, sets/reps, gewichten en voeding.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Workout",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: "#0a0a0a",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="nl"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <AppDataProvider>
          <ServiceWorkerRegister />
          <main
            className="mx-auto w-full max-w-md flex-1 px-4 pt-[calc(env(safe-area-inset-top)+1rem)]"
            style={{ paddingBottom: "6rem" }}
          >
            {children}
          </main>
          <BottomNav />
        </AppDataProvider>
      </body>
    </html>
  );
}
