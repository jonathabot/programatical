import { db } from "@/firebase.config";
import {
  getDocs,
  collection,
  doc,
  getDoc,
  addDoc,
  deleteDoc,
  updateDoc,
} from "firebase/firestore";
import { CourseModule, Course, Module } from "@/types/types";

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
      createdAt: courseData.createdAt || "",
      active: courseData.active || false,
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
        createdAt: courseData.createdAt || "",
        active: courseData.active || false,
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
      moduleId: moduleData.moduleName ?? "",
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
    console.log(
      "Curso criado com sucesso. ID Firebase Doc do curso:",
      docRef.id
    );
    return docRef.id;
  } catch (error) {
    console.error("Erro ao criar o curso:", error);
    return null;
  }
};

export const postModule = async (
  newModule: Omit<Module, "id">
): Promise<string | null> => {
  try {
    const modulesCollectionRef = collection(db, "modules");
    const docRef = await addDoc(modulesCollectionRef, newModule);
    console.log(
      "Modulo criado com sucesso. ID Firebase Doc do Modulo:",
      docRef.id
    );
    return docRef.id;
  } catch (error) {
    console.error("Erro ao criar o modulo:", error);
    return null;
  }
};

const deactivateCourse = async (docId: string): Promise<boolean> => {
  try {
    const courseDocRef = doc(db, "courses", docId);
    const courseDoc = await getDoc(courseDocRef);

    if (!courseDoc.exists()) {
      console.error(`Curso com ID ${docId} não encontrado.`);
      return false;
    }

    await updateDoc(courseDocRef, {
      active: false,
    });

    console.log(`Curso com ID ${docId} desativado com sucesso.`);
    return true;
  } catch (error) {
    console.error("Erro ao desativar o curso:", error);
    return false;
  }
};

const activateCourse = async (docId: string): Promise<boolean> => {
  try {
    const courseDocRef = doc(db, "courses", docId);
    const courseDoc = await getDoc(courseDocRef);

    if (!courseDoc.exists()) {
      console.error(`Curso com ID ${docId} não encontrado.`);
      return false;
    }

    await updateDoc(courseDocRef, {
      active: true,
    });

    console.log(`Curso com ID ${docId} desativado com sucesso.`);
    return true;
  } catch (error) {
    console.error("Erro ao desativar o curso:", error);
    return false;
  }
};

export const getAllCourses = async () => {
  const courses = await getCourses();
  return courses;
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

export const deactivateCourseRequest = async (docId: string) => {
  const deactivateRequestResponse = await deactivateCourse(docId);
  return deactivateRequestResponse;
};

export const activateCourseRequest = async (docId: string) => {
  const activateRequestResponse = await activateCourse(docId);
  return activateRequestResponse;
};
