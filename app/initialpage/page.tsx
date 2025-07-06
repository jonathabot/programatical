import AvailableCourses from "@/components/AvailableCourses";
import OngoingCourses from "@/components/OngoingCourses";
import Ranking from "@/components/Ranking";
import GradientText from "@/components/ui/gradient-text";

export default function InitialPage() {
  return (
    <div className="flex flex-col md:flex-row items-start justify-between w-full">
      <div className="flex flex-col gap-4 items-start justify-around h-full w-full px-2">
        <div className="flex flex-col gap-2 w-full">
          <GradientText className="text-4xl mb-4 text-center md:text-start">Cursos em Andamento</GradientText>
          <OngoingCourses />
        </div>

        <div className="flex flex-col gap-2 w-full">
          <GradientText className="text-4xl mb-4 text-center md:text-start">Cursos Disponíveis</GradientText>
          <AvailableCourses />
        </div>
      </div>

      <div className="ml-12 mt-20">
        <Ranking />
      </div>
    </div>
  );
}
