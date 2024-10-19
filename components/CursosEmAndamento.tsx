import GradientText from "./ui/gradient-text";

export default function CursosEmAndamento() {
  return (
    <div className="flex flex-col justify-center">
      <GradientText className="text-4xl mb-4">Cursos em Andamento</GradientText>

      <div className="relative w-36 h-36 cursor-pointer">
        {/* Green border circle */}
        <div className="absolute inset-0 rounded-full border-4 border-[#00FF19]"></div>

        {/* Gray inner circle with content */}
        <div className="absolute inset-2 bg-gray-300 rounded-full flex flex-col items-center justify-center text-center">
          <span className="text-gray-500 text-sm px-4 leading-3">
            Arquitetura de Software
          </span>
          <span className="text-gray-600 text-3xl mt-2">10%</span>
        </div>
      </div>
    </div>
  );
}
