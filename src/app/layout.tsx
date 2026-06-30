import type { Metadata } from "next";
import './globals.css';

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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>
        <EmbedDetector />
        {children}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
