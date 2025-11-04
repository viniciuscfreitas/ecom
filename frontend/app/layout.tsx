import type { Metadata } from "next";
import "./globals.css";
import { QueryClientProvider } from "@/lib/query-client";

export const metadata: Metadata = {
  title: "Pet Shop E-commerce",
  description: "Pet Shop E-commerce + Delivery",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>
        <QueryClientProvider>{children}</QueryClientProvider>
      </body>
    </html>
  );
}

