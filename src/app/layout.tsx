import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";

export const metadata: Metadata = {
  title: "API FORGE | Industrial API Catalog",
  description: "Discover, collect, and export free public APIs for your next project. Industrial Cyberpunk API Marketplace.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#0D0D0D] text-[#E0E0E0] antialiased">
        <Header />
        <main className="pt-16">
          {children}
        </main>
      </body>
    </html>
  );
}
