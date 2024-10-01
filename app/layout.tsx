import type { Metadata } from "next";
import { League_Spartan } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const leagueSpartanFont = League_Spartan({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Programatical",
  description: "Aprenda assuntos de programação de uma forma única!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={leagueSpartanFont.className}>
      <body className="bg-zinc-800 flex flex-col h-screen justify-between px-4 md:px-12 lg:px-20 xl:px-52 2xl:px-64">
        <Header />
        <main className="mb-auto flex itens-center justify-center h-screen text-slate-300">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
