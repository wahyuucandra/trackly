import type { Metadata } from "next";
import { SessionProvider } from "next-auth/react";
import { Providers } from "@/components/Providers";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist-sans" });

export const metadata: Metadata = {
  title: {
    default: "TRACKLY — Monitoring Program PDO & AO",
    template: "%s | TRACKLY",
  },
  description:
    "Sistem monitoring program untuk PDO dan AO. Lacak progres, kelola tugas, dan verifikasi pekerjaan lapangan.",
  openGraph: {
    title: "TRACKLY",
    description: "Sistem monitoring program untuk PDO dan AO",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={cn("h-dvh antialiased", geist.variable)}>
      <body className="h-dvh flex flex-col bg-background text-foreground">
        <SessionProvider>
          <Providers>{children}</Providers>
        </SessionProvider>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
