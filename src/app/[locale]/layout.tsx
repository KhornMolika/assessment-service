import type { Metadata } from "next";
import '../globals.css';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { locales } from '@/src/i18n';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: {
    default: "Assessment Service",
    template: "%s | Assessment Service",
  },
  description: "Assessment creation, delivery, analytics, and results management.",
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "Assessment Service",
    description: "Assessment creation, delivery, analytics, and results management.",
    siteName: "Assessment Service",
    type: "website",
  },
};

import { Toaster } from 'sonner';
import EmbedDetector from "@/src/components/ui/layout/EmbedDetector";
import { ThemeProvider } from "@/src/components/ui/ui/theme-provider";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function RootLayout(props: {
  children: React.ReactNode;
  params: Promise<{ locale: string }> | { locale: string };
}) {
  const params = await props.params;
  const { locale } = params;

  if (!locales.includes(locale)) {
    notFound();
  }

  // Ensure next-intl knows which locale to use for server components
  setRequestLocale(locale);

  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body suppressHydrationWarning>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} disableTransitionOnChange>
          <NextIntlClientProvider messages={messages}>
            <EmbedDetector />
            {props.children}
            <Toaster position="top-center" richColors />
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
