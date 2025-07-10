"use client";

import { useEffect, useState } from "react";
import { getAvailableCourses, enrollCourseRequest, getUserEnrollmentsRequest } from "@/lib/firebase/courses";
import { Skeleton } from "./ui/skeleton";
import useCoursePage from "@/hooks/route-to-course";
import { Course } from "@/types/types";
import { ScrollArea, ScrollBar } from "./ui/scrollarea";
import { getAuth, onAuthStateChanged } from "firebase/auth";

export default function AvailableCourses() {
  const navigateToCourse = useCoursePage();
  const [availableCourses, setAvailableCourses] = useState<Course[] | null>(null);
  const [loading, setLoading] = useState(true);
  const auth = getAuth();
  const [user, setUser] = useState(auth.currentUser);
  const [showEnrollmentAlert, setShowEnrollmentAlert] = useState(false);
  const [selectedCourseForEnrollment, setSelectedCourseForEnrollment] = useState<Course | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });

    return () => unsubscribe();
  }, [auth]);

  const handleCourseClick = (course: Course) => {
    setSelectedCourseForEnrollment(course);
    setShowEnrollmentAlert(true);
  };

  const handleConfirmEnrollment = async () => {
    if (selectedCourseForEnrollment && user) {
      try {
        const enrollmentData = {
          courseId: selectedCourseForEnrollment.id,
          userUid: user.uid,
          enrollmentDate: new Date().toISOString(),
        };

        const enrollmentId = await enrollCourseRequest(enrollmentData);

        if (enrollmentId) {
          navigateToCourse(selectedCourseForEnrollment.id);
        } else {
          console.error("Failed to create enrollment");
        }
      } catch (error) {
        console.error("Error creating enrollment:", error);
      }
    }
    setShowEnrollmentAlert(false);
  };

  useEffect(() => {
    const fetchCourses = async () => {
      if (!user) return;

      try {
        setLoading(true);
        const [allCourses, userEnrollments] = await Promise.all([
          getAvailableCourses(),
          getUserEnrollmentsRequest(user.uid),
        ]);

        const enrolledCourseIds = userEnrollments.map((enrollment) => enrollment.courseId);
        const availableCourses = allCourses.filter((course) => !enrolledCourseIds.includes(course.id) && course.active);

        setAvailableCourses(availableCourses);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [user]);

  return (
    <>
      <div className="rounded-md bg-gradient-to-br from-jyunBlue to-cyan-500 p-[2px]">
        <ScrollArea className="rounded-md bg-gray-900">
          <div className="flex p-8">
            {loading ? (
              <Skeleton className="w-32 h-32 rounded-full" />
            ) : availableCourses?.length == 0 ? (
              <span>Poxa! Pelo visto não temos mais nenhum curso disponível para você ainda.</span>
            ) : (
              availableCourses?.map((course) => (
                <div className="relative w-32 h-32 mr-6" key={course.id}>
                  <div className="absolute inset-0 rounded-full border-4 border-jyunBlue"></div>
                  <div
                    className="absolute inset-2 bg-gray-300 rounded-full flex items-center justify-center text-center hover:bg-gray-400 cursor-pointer"
                    onClick={() => handleCourseClick(course)}
                  >
                    <span className="text-gray-500 text-base px-4 leading-4">{course.courseName}</span>
                  </div>
                </div>
              ))
            )}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>

      {showEnrollmentAlert && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 animate-in fade-in duration-200">
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-[90%] max-w-md animate-in zoom-in-95 duration-300">
            <h2 className="text-xl font-semibold mb-4 text-white">Iniciar novo curso</h2>
            <p className="text-lg mb-6 text-gray-200">
              Deseja iniciar o curso "{selectedCourseForEnrollment?.courseName}"?
            </p>
            <div className="flex gap-4 justify-end">
              <button
                onClick={() => setShowEnrollmentAlert(false)}
                className="px-4 py-2 rounded-md bg-gray-700 hover:bg-gray-600 text-white transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmEnrollment}
                className="px-4 py-2 rounded-md bg-jyunBlue hover:bg-blue-600 text-white transition-colors"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
