import type { Metadata } from "next";
import '../globals.css';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
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

export default async function RootLayout(props: {
  children: React.ReactNode;
  params: Promise<{ locale: string }> | { locale: string };
}) {
  const params = await props.params;
  const { locale } = params;

  if (!locales.includes(locale as any)) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body suppressHydrationWarning>
        <NextIntlClientProvider messages={messages}>
          <EmbedDetector />
          {props.children}
          <Toaster position="top-center" richColors />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
