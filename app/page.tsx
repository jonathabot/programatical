import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Metadata } from "next/types";

export const metadata: Metadata = {
  title: "Programatical",
  description: "Aprenda assuntos de programação de uma forma única!",
};

export default function Home() {
  return (
    <div className="flex justify-center items-center p-4">
      <div className="flex flex-col gap-16 w-[80%] ">
        <span className="text-2xl md:text-6xl text-transparent bg-clip-text bg-radial-gradient-text-home text-center">
          Aprenda novos conceitos sobre <br /> Programação de forma única e
          gratuita.
        </span>

        <span className="text-base md:text-2xl text-white text-center">
          Conteúdos como: Scrum, Arquitetura de Software, Solid, Domain Driven
          Design e Git.
        </span>

        <div className="text-2xl flex justify-evenly w-full">
          <Button className="bg-[#B2B4B7] hover:bg-[#7a7e81] h-20 w-60">
            <span className="text-transparent bg-gradient-to-r from-[#433E3E] to-[#181111] bg-clip-text">
              Mais informações
            </span>
          </Button>
          <Button className="h-20 w-60">Começar agora</Button>
        </div>
      </div>
    </div>
  );
}
