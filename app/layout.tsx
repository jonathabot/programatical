import type { Metadata } from "next";
import { League_Spartan } from "next/font/google";
import "./globals.css";

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
      <body className="bg-zinc-800 flex items-center justify-center h-full md:px-12 lg:px-20 xl:px-52 2xl:px-64">
        <div className="w-full h-full md:h-[calc(100vh)] md:max-w-[calc(100vw-2rem)] lg:max-h-[calc(100vw-2rem)] rounded-sm border-4 border-pgmt-blue overflow-hidden flex flex-col">
          {children}
        </div>
      </body>
    </html>
  );
}
