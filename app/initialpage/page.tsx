import CursosDisponiveis from "@/components/CursosDisponiveis";
import CursosEmAndamento from "@/components/CursosEmAndamento";
import Ranking from "@/components/Ranking";
import GradientText from "@/components/ui/gradient-text";

export default function InitialPage() {
  return (
    <>
      <div className="flex items-center justify-between w-full">
        <div className="flex flex-col items-start justify-around h-full">
          <CursosEmAndamento />
          <CursosDisponiveis />
        </div>
        <Ranking />
      </div>
    </>
  );
}
