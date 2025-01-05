// lib/firebase/courses.ts

import { db } from "@/firebase.config"; // Importa a configuração do Firebase
import { getDocs, collection, doc, getDoc } from "firebase/firestore";
import { CourseModule, Curso } from "@/types/types"; // Importa a interface de tipos

const getCourses = async (): Promise<Curso[]> => {
  const coursesCollectionRef = collection(db, "cursos");
  const response = await getDocs(coursesCollectionRef);

  const data = response.docs.map((doc) => {
    const courseData = doc.data();
    return {
      id: doc.id,
      idCurso: courseData.idCurso || "",
      nomeCurso: courseData.nomeCurso || "",
      descricao: courseData.descricao || "",
    };
  });

  return data;
};

const getCourse = async (courseId: string): Promise<Curso | null> => {
  try {
    const courseDocRef = doc(db, "cursos", courseId);
    const response = await getDoc(courseDocRef);

    if (response.exists()) {
      const courseData = response.data();
      return {
        id: response.id,
        idCurso: courseData?.idCurso || "",
        nomeCurso: courseData?.nomeCurso || "",
        descricao: courseData?.descricao || "",
      };
    } else {
      console.log("Curso não encontrado.");
      return null;
    }
  } catch (error) {
    console.error("Erro ao buscar o curso:", error);
    return null;
  }
};

const getModules = async (courseId: string) => {
  const courseDocRef = doc(db, "cursos", courseId);
  const modulesCollectionRef = collection(courseDocRef, "modulos");
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
// Função para buscar os cursos disponíveis para o usuário.
export const getAvailableCourses = async () => {
  const courses = await getCourses();
  return courses;
};

// Função para buscar os cursos em andamento do usuário
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
