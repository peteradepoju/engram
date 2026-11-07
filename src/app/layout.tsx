import type { Metadata, Viewport } from "next";
import "./globals.css";
import { SiteHeader, BottomTabs } from "@/components/nav";
import { ServiceWorker } from "@/components/service-worker";

export const metadata: Metadata = {
  title: { default: "Engram: learn NeuroAI from scratch", template: "%s | Engram" },
  description:
    "A free, day-by-day course that takes you from mathematics to independent NeuroAI research: neuroscience, machine learning and deep learning with interactive figures, code in the browser, weekly papers and a research lab.",
  applicationName: "Engram",
  appleWebApp: { capable: true, title: "Engram", statusBarStyle: "default" },
  formatDetection: { telephone: false },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icons/favicon-32.png", sizes: "32x32", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: "/icons/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f5f0" },
    { media: "(prefers-color-scheme: dark)", color: "#111018" },
  ],
};

// Applies the saved theme before paint, so there is no flash.
const themeScript = `try{var t=localStorage.getItem('engram-theme');if(t==='light'||t==='dark')document.documentElement.dataset.theme=t}catch(e){}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-GB" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-dvh">
        <SiteHeader />
        <main className="pb-24 md:pb-10">{children}</main>
        <BottomTabs />
        <ServiceWorker />
      </body>
    </html>
  );
}
