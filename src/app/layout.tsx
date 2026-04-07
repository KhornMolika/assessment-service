import { DM_Serif_Display, DM_Sans, Koh_Santepheap } from "next/font/google";
import './globals.css'

const dmSerif = DM_Serif_Display({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-heading",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
});

const kohSantepheap = Koh_Santepheap({
  subsets: ["khmer"],
  weight: ["400", "700"],
  variable: "--font-khmer",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${dmSerif.variable} ${dmSans.variable} ${kohSantepheap.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
