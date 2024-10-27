import CursosDisponiveis from "@/components/CursosDisponiveis";
import CursosEmAndamento from "@/components/CursosEmAndamento";
import Ranking from "@/components/Ranking";

export default function InitialPage() {
  return (
    <>
      <div className="flex flex-col md:flex-row items-center justify-between w-full">
        <div className="flex flex-col gap-4 items-start justify-around h-full">
          <CursosEmAndamento />
          <CursosDisponiveis />
        </div>
        <div className="mt-12 md:mt-0">
          <Ranking />
        </div>
      </div>
    </>
  );
}
