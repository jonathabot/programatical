import GradientText from "./ui/gradient-text";

export default function CursosDisponiveis() {
  return (
    <div className="flex flex-col justify-center">
      <GradientText className="text-4xl mb-4">Cursos Disponiveis</GradientText>

      <div className="relative w-36 h-36 cursor-pointer">
        {/* Blue border circle */}
        <div className="absolute inset-0 rounded-full border-4 border-[#00C2FF]"></div>

        {/* Gray inner circle with content */}
        <div className="absolute inset-2 bg-gray-300 rounded-full flex items-center justify-center text-center">
          <span className="text-gray-500 text-lg px-4">Curso 1</span>
        </div>
      </div>
    </div>
  );
}
