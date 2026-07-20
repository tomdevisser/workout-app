import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Newsreader, Quicksand } from "next/font/google";
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

const quicksand = Quicksand({
  variable: "--font-quicksand",
  weight: ["500", "600", "700"],
  subsets: ["latin"],
});

const newsreader = Newsreader({
  variable: "--font-newsreader",
  weight: ["500", "600", "700"],
  subsets: ["latin"],
});

const NO_FLASH_THEME_SCRIPT = `(function(){try{var raw=localStorage.getItem('workout-app-data');var s=raw&&JSON.parse(raw).settings;var p=s&&s.profile;document.documentElement.dataset.theme=p==='ayse'?'ayse':'tom';}catch(e){document.documentElement.dataset.theme='tom';}})();`;

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
  themeColor: "#faf9f5",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="nl"
      className={`${geistSans.variable} ${geistMono.variable} ${quicksand.variable} ${newsreader.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: NO_FLASH_THEME_SCRIPT }} />
      </head>
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
