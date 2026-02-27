import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "משימות חכמות",
  description: "אפליקציית ניהול משימות אישית",
  icons: { icon: "/favicon.svg" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="he" dir="rtl">
      <body className={inter.className}>
        {children}
        <Toaster
          position="top-center"
          richColors
          closeButton
          dir="rtl"
        />
      </body>
    </html>
  );
}
