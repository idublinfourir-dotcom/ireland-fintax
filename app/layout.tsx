import type { Metadata, Viewport } from "next";
import { Archivo, Geist } from "next/font/google";
import { SiteHeader } from "./components/site-header";
import { SiteFooter } from "./components/site-footer";
import { BackToTop } from "./components/back-to-top";
import { ChromeGate } from "./components/chrome-gate";
import { RouteProgress } from "./components/route-progress";
import { getSessionUser } from "./lib/auth/guards";
import { site } from "./lib/content";
import { getMessages, languageAlternates } from "./lib/messages";
import { LocaleProvider } from "./components/locale-link";
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
      locale: { en: "en_GB", ga: "ga_IE", es: "es_ES", pt: "pt_BR" }[locale],
    },
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
      data-scroll-behavior="smooth"
      className={`${archivo.variable} ${geistSans.variable} h-full antialiased`}
    >
      <body
        className="min-h-full flex flex-col bg-canvas font-sans text-ink-body"
        suppressHydrationWarning
      >
        <LocaleProvider locale={locale}>
          <RouteProgress />
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-none focus:bg-navy-900 focus:px-5 focus:py-3 focus:text-sm focus:text-white"
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
      </body>
    </html>
  );
}
