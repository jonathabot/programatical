import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Metadata } from "next/types";

export const metadata: Metadata = {
  title: "Programatical",
  description: "Aprenda assuntos de programação de uma forma única!",
};

export default function Home() {
  return (
    <main className="flex min-h-screen items-center flex-col bg-zinc-800">
      <div className="flex justify-between items-center w-full px-10 my-8">
        <Image src="/logoPgm.png" alt="Logo" width={200} height={50} />
        <Button variant="default">Entrar</Button>
      </div>
    </main>
  );
}
