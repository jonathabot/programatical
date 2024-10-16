import HomePageContent from "@/components/HomePageContent";
import { Metadata } from "next/types";

export const metadata: Metadata = {
  title: "Programatical",
  description: "Aprenda assuntos de programação de uma forma única!",
};

export default function Home() {
  return (
    <div className="flex justify-center items-center p-4">
      <HomePageContent />
    </div>
  );
}
