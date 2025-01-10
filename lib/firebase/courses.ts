import { db } from "@/firebase.config";
import { getDocs, collection, doc, getDoc, addDoc } from "firebase/firestore";
import { CourseModule, Course } from "@/types/types";

const getCourses = async (): Promise<Course[]> => {
  const coursesCollectionRef = collection(db, "courses");
  const response = await getDocs(coursesCollectionRef);

  const data = response.docs.map((doc) => {
    const courseData = doc.data();
    return {
      id: doc.id,
      courseId: courseData.courseId || "",
      courseName: courseData.courseName || "",
      courseDescription: courseData.courseDescription || "",
    };
  });

  return data;
};

const getCourse = async (courseId: string): Promise<Course | null> => {
  try {
    const courseDocRef = doc(db, "courses", courseId);
    const response = await getDoc(courseDocRef);

    if (response.exists()) {
      const courseData = response.data();
      return {
        id: response.id,
        courseId: courseData?.courseId || "",
        courseName: courseData?.courseName || "",
        courseDescription: courseData?.courseDescription || "",
      };
    } else {
      console.error("Curso não encontrado.");
      return null;
    }
  } catch (error) {
    console.error("Erro ao buscar o curso:", error);
    return null;
  }
};

const getModules = async (courseId: string) => {
  const courseDocRef = doc(db, "courses", courseId);
  const modulesCollectionRef = collection(courseDocRef, "modules");
  const response = await getDocs(modulesCollectionRef);

  const modules: CourseModule[] = response.docs.map((doc) => {
    const moduleData = doc.data();
    return {
      id: doc.id,
      isActive: moduleData.isActive ?? false,
      nome: moduleData.nome ?? "",
      order: moduleData.order ?? 0,
    };
  });

  return modules;
};

export const postCourse = async (
  newCourse: Omit<Course, "id">
): Promise<string | null> => {
  try {
    const coursesCollectionRef = collection(db, "courses");
    const docRef = await addDoc(coursesCollectionRef, newCourse);
    console.log("Curso criado com sucesso. ID do curso:", docRef.id);
    return docRef.id; // Retorna o ID do documento criado
  } catch (error) {
    console.error("Erro ao criar o curso:", error);
    return null;
  }
};

export const getAvailableCourses = async () => {
  const courses = await getCourses();
  return courses;
};

export const getOnGoingCourses = async () => {
  const courses = await getCourses();
  return courses;
};

export const getCourseModules = async (courseId: string) => {
  const modules = await getModules(courseId);
  return modules;
};

export const getCourseById = async (courseId: string) => {
  const course = await getCourse(courseId);
  return course;
};
