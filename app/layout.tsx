import type { Metadata, Viewport } from "next";
import {
  Archivo,
  Geist,
  IBM_Plex_Sans_Arabic,
  Noto_Sans_Bengali,
  Noto_Sans_Devanagari,
} from "next/font/google";
import { SiteHeader } from "./components/site-header";
import { SiteFooter } from "./components/site-footer";
import { BackToTop } from "./components/back-to-top";
import { ChromeGate } from "./components/chrome-gate";
import { RouteProgress } from "./components/route-progress";
import { getSessionUser } from "./lib/auth/guards";
import { site } from "./lib/content";
import { RTL_LOCALES } from "./lib/i18n";
import { getMessages, languageAlternates } from "./lib/messages";
import { LocaleProvider } from "./components/locale-link";
import { SiteAnalytics } from "./components/site-analytics";
import "./globals.css";

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

/* Archivo and Geist have no Arabic glyphs, so Arabic text falls through to
   this one (see the font stacks in globals.css). Not preloaded: its
   unicode-range keeps every other language from downloading it. */
const plexArabic = IBM_Plex_Sans_Arabic({
  variable: "--font-arabic",
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
  preload: false,
});

/* Bangla and Hindi scripts, the same way: fallbacks by unicode-range, not
   preloaded, so only a page with Bengali or Devanagari text fetches them. */
const notoBengali = Noto_Sans_Bengali({
  variable: "--font-bengali",
  subsets: ["bengali"],
  preload: false,
});

const notoDevanagari = Noto_Sans_Devanagari({
  variable: "--font-devanagari",
  subsets: ["devanagari"],
  preload: false,
});

export async function generateMetadata(): Promise<Metadata> {
  const { locale, t } = await getMessages();
  return {
    metadataBase: new URL(site.url),
    alternates: await languageAlternates(),
    title: {
      default: t.meta.title,
      template: "%s | Irish Fintax",
    },
    description: t.meta.description,
    openGraph: {
      siteName: "Irish Fintax",
      type: "website",
      locale: { en: "en_GB", ga: "ga_IE", es: "es_ES", pt: "pt_BR", ar: "ar_AR", bn: "bn_BD", hi: "hi_IN" }[locale],
    },
    // Large card: the share picture is app/opengraph-image.tsx.
    twitter: { card: "summary_large_image" },
  };
}

export const viewport: Viewport = {
  themeColor: "#0b0d14",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [user, { locale, t }] = await Promise.all([
    getSessionUser(),
    getMessages(),
  ]);
  return (
    <html
      lang={locale}
      dir={RTL_LOCALES.includes(locale) ? "rtl" : "ltr"}
      data-scroll-behavior="smooth"
      className={`${archivo.variable} ${geistSans.variable} ${plexArabic.variable} ${notoBengali.variable} ${notoDevanagari.variable} h-full antialiased`}
    >
      <body
        className="min-h-full flex flex-col bg-canvas font-sans text-ink-body"
        suppressHydrationWarning
      >
        <LocaleProvider locale={locale}>
          <RouteProgress />
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:absolute focus:inset-s-4 focus:top-4 focus:z-50 focus:rounded-none focus:bg-navy-900 focus:px-5 focus:py-3 focus:text-sm focus:text-white"
          >
            {t.header.skip}
          </a>
          <ChromeGate>
            <SiteHeader user={user} locale={locale} t={t.header} />
          </ChromeGate>
          <main id="main" className="flex-1">
            {children}
          </main>
          <ChromeGate>
            <SiteFooter />
            <BackToTop />
          </ChromeGate>
        </LocaleProvider>
        <SiteAnalytics />
      </body>
    </html>
  );
}
