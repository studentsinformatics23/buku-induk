import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Aplikasi Buku Induk Santri - Pondok Pesantren Miftahul Huda Al-Faqih",
  description: "Aplikasi Buku Induk Santri dan Rekapitulasi Nilai Pondok Pesantren Miftahul Huda Al-Faqih",
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <head>
        <link rel="icon" href="/logo.png" />
      </head>
      <body className="min-h-full bg-slate-50 text-slate-800 flex flex-col font-sans">
        {children}
      </body>
    </html>
  );
}
