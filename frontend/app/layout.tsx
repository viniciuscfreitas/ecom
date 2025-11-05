import type { Metadata } from "next";
import "./globals.css";
import { QueryClientProvider } from "@/lib/query-client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Toaster } from "@/components/ui/sonner";
import { AdminLayoutWrapper } from "@/components/AdminLayoutWrapper";

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
    <html lang="pt-BR" suppressHydrationWarning>
      <body className="flex flex-col min-h-screen">
        <QueryClientProvider>
          <AdminLayoutWrapper>
            <Header />
            <Footer />
          </AdminLayoutWrapper>
          <main className="flex-1">{children}</main>
          <Toaster />
        </QueryClientProvider>
      </body>
    </html>
  );
}

