import AvailableCourses from "@/components/AvailableCourses";
import OngoingCourses from "@/components/OngoingCourses";
import Ranking from "@/components/Ranking";

export default function InitialPage() {
  return (
    <>
      <div className="flex flex-col md:flex-row items-center justify-between w-full">
        <div className="flex flex-col gap-4 items-start justify-around h-full">
          <OngoingCourses />
          <AvailableCourses />
        </div>
        <div className="mt-12 md:mt-0">
          <Ranking />
        </div>
      </div>
    </>
  );
}
