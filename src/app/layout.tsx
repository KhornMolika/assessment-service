import type { Metadata } from "next";
import { DM_Serif_Display, DM_Sans, Koh_Santepheap } from "next/font/google";
import './globals.css';
import ClientLayout from "../shared/components/layout/ClientLayout";
import { SidebarProvider } from "../shared/context/sidebar-context";

const dmSerif = DM_Serif_Display({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-heading-family",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-sans-family",
});

const kohSantepheap = Koh_Santepheap({
  subsets: ["khmer"],
  weight: ["400", "700"],
  preload: false,
  variable: "--font-khmer-family",
});

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
  twitter: {
    card: "summary",
    title: "Assessment Service",
    description: "Assessment creation, delivery, analytics, and results management.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${dmSerif.variable} ${dmSans.variable} ${kohSantepheap.variable}`}
    >
      <body>
        <SidebarProvider>
          <ClientLayout>{children}</ClientLayout>
        </SidebarProvider>
      </body>
    </html>
  );
}
