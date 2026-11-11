import type { Metadata, Viewport } from "next";
import "./globals.css";
import "@fontsource/cormorant-garamond/500.css";
import "@fontsource/cormorant-garamond/600.css";
import "@fontsource/cormorant-garamond/500-italic.css";
import "@fontsource-variable/jost";
import "@fontsource-variable/jetbrains-mono";
import "@fontsource-variable/geist";
import "@fontsource-variable/geist-mono";
import "@fontsource-variable/fraunces/full.css";
import "@fontsource-variable/fraunces/full-italic.css";
import "@fontsource-variable/source-serif-4";
import "@fontsource-variable/manrope";
import "@fontsource-variable/space-grotesk";
import "@fontsource/ibm-plex-sans/400.css";
import "@fontsource/ibm-plex-sans/500.css";
import "@fontsource/ibm-plex-sans/600.css";
import "@fontsource/ibm-plex-mono/400.css";
import "@fontsource/ibm-plex-mono/500.css";
import "@fontsource-variable/newsreader";
import "@fontsource-variable/newsreader/wght-italic.css";
import "@fontsource-variable/nunito-sans";
import "./designs.css";
import { SiteHeader, BottomTabs } from "@/components/nav";
import { ServiceWorker } from "@/components/service-worker";
import { DesignSwitch } from "@/components/design-switch";

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
const themeScript = `try{var t=localStorage.getItem('engram-theme');if(t==='light'||t==='dark')document.documentElement.dataset.theme=t}catch(e){}
try{var ok=['atlas','quiet','journal','nocturne','sage','original'],q=new URLSearchParams(location.search).get('design'),d=null;try{d=localStorage.getItem('engram-design')}catch(e){}
if(q&&ok.indexOf(q)>=0){d=q;try{localStorage.setItem('engram-design',q)}catch(e){}}if(d&&d!=='original'&&ok.indexOf(d)>=0)document.documentElement.dataset.design=d}catch(e){}`;

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
        <DesignSwitch />
      </body>
    </html>
  );
}
