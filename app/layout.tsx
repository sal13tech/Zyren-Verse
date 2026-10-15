import type { Metadata } from "next";
import { StoreProvider } from "@/contexts/StoreContext";
import "./globals.css";

export const metadata: Metadata = {
  title: "ZYREN VERSÉ",
  description: "Zamansız tasarım, modern zarafet.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <body>
        <StoreProvider>{children}</StoreProvider>
      </body>
    </html>
  );
}