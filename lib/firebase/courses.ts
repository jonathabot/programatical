// lib/firebase/courses.ts

import { db } from "@/firebase.config"; // Importa a configuração do Firebase
import { getDocs, collection } from "firebase/firestore";
import { Curso } from "@/types/courses"; // Importa a interface de tipos

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
