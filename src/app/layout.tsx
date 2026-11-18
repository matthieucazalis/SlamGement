import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import { HapticsListener } from "@/components/haptics";
import { ServiceWorkerRegister } from "@/components/service-worker-register";
import { SYSTEM_THEME_SCRIPT, ThemeSync } from "@/components/theme-sync";
import { I18nProvider } from "@/i18n/client";
import { getPreferences, getT } from "@/i18n/server";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return {
    title: { default: "SlamGement", template: "%s · SlamGement" },
    description: t("common.tagline"),
    applicationName: "SlamGement",
    icons: {
      icon: [{ url: "/icons/192", sizes: "192x192", type: "image/png" }],
      apple: [{ url: "/icons/apple", sizes: "180x180", type: "image/png" }],
    },
    appleWebApp: {
      capable: true,
      title: "SlamGement",
      statusBarStyle: "default",
    },
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0f172a" },
  ],
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const { locale, theme, haptics } = await getPreferences();
  const t = await getT();

  return (
    // suppressHydrationWarning : en mode « système », un script modifie la
    // classe de <html> avant l'hydratation.
    <html
      lang={locale}
      suppressHydrationWarning
      className={`${GeistSans.variable} ${GeistMono.variable}${theme === "dark" ? " dark" : ""}`}
      style={theme === "dark" ? { colorScheme: "dark" } : undefined}
    >
      <head>
        {theme === "system" && (
          <script dangerouslySetInnerHTML={{ __html: SYSTEM_THEME_SCRIPT }} />
        )}
      </head>
      <body className="antialiased">
        <I18nProvider locale={locale} haptics={haptics} theme={theme}>
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:fixed focus:left-2 focus:top-2 focus:z-50 focus:rounded-md focus:bg-primary focus:px-3 focus:py-2 focus:text-primary-foreground"
          >
            {t("common.skipToContent")}
          </a>
          <ServiceWorkerRegister />
          <ThemeSync />
          <HapticsListener />
          {children}
          <footer className="mx-auto flex max-w-7xl flex-wrap justify-center gap-4 px-4 py-6 text-xs text-muted-foreground">
            <Link href="/legal/privacy" className="underline">
              {t("legal.footerPrivacy")}
            </Link>
            <Link href="/legal/notice" className="underline">
              {t("legal.footerNotice")}
            </Link>
          </footer>
        </I18nProvider>
      </body>
    </html>
  );
}
