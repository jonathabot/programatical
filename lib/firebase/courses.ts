import { db } from "@/firebase.config";
import { getDocs, collection, doc, getDoc, addDoc, updateDoc, query, where, writeBatch } from "firebase/firestore";
import { Course, Module, CourseWithModules, Class } from "@/types/types";

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

const getCourseWithModules = async (docId: string): Promise<CourseWithModules | null> => {
  try {
    const courseDocRef = doc(db, "courses", docId);
    const response = await getDoc(courseDocRef);

    if (!response.exists()) {
      console.error("Curso não encontrado.");
      return null;
    }

    const courseData = response.data();
    const courseInfo = {
      id: response.id,
      courseId: courseData?.courseId || "",
      courseName: courseData?.courseName || "",
      courseDescription: courseData?.courseDescription || "",
      createdAt: courseData?.createdAt || "",
      active: courseData?.active || false,
    };

    // modulos do curso
    const modules: Module[] = await getModulesForCourse(courseInfo.courseId);

    return {
      ...courseInfo,
      modules,
    };
  } catch (error) {
    console.error("Erro ao buscar o curso:", error);
    return null;
  }
};

// const getModules = async (courseId: string): Promise<Module[]> => {
//   try {
//     const modulesCollectionRef = collection(db, "modules");
//     const q = query(modulesCollectionRef, where("courseId", "==", courseId));
//     const querySnapshot = await getDocs(q);

//     const modules: Module[] = [];
//     querySnapshot.forEach((doc) => {
//         modules.push({ id: doc.id, ...doc.data() } as Module);
//     });

//     return modules;
// } catch (error) {
//     console.error("Error fetching modules:", error);
//     throw error;
// }
// };

const getModulesForCourse = async (courseId: string): Promise<Module[]> => {
  const modulesCollectionRef = collection(db, "modules");
  const modulesQuery = query(modulesCollectionRef, where("attachedTo_CourseId", "==", courseId));
  const modulesSnapshot = await getDocs(modulesQuery);

  return modulesSnapshot.docs
    .map((doc) => ({
      id: doc.id,
      moduleId: doc.data().moduleId,
      moduleName: doc.data().moduleName,
      moduleDescription: doc.data().moduleDescription,
      isActive: doc.data().isActive,
      order: doc.data().order,
      createdAt: doc.data().createdAt,
      attachedTo_CourseId: doc.data().attachedTo_CourseId,
    }))
    .sort((a, b) => a.order - b.order);
};

const getModulesClasses = async (moduleId: string): Promise<Class[]> => {
  const classesCollectionRef = collection(db, "classes");
  const classesQuery = query(classesCollectionRef, where("attachedTo_ModuleId", "==", moduleId));
  const classesSnapshot = await getDocs(classesQuery);

  return classesSnapshot.docs
    .map((doc) => ({
      id: doc.id,
      classId: doc.data().classId,
      className: doc.data().className,
      classDescription: doc.data().classDescription,
      isActive: doc.data().isActive,
      order: doc.data().order,
      createdAt: doc.data().createdAt,
      attachedTo_ModuleId: doc.data().attachedTo_ModuleId,
    }))
    .sort((a, b) => a.order - b.order);
};

const updateDeactivateCourse = async (docId: string): Promise<boolean> => {
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

const updateModulesOrdering = async (modules: Module[]): Promise<boolean> => {
  const batch = writeBatch(db);

  try {
    modules.forEach((module, index) => {
      const moduleDocRef = doc(db, "modules", module.id);
      batch.update(moduleDocRef, {
        order: (index + 1).toString(),
      });
    });
    await batch.commit();
    console.log("Modulos atualizados com sucesso!");
    return true;
  } catch (error) {
    console.error("Erro ao atualizar a ordem dos modulos:", error);
    return false;
  }
};

const updateModuleClassesOrdering = async (classes: Class[]): Promise<boolean> => {
  const batch = writeBatch(db);

  try {
    classes.forEach((eachClass, index) => {
      const eachClassDocRef = doc(db, "classes", eachClass.id);
      batch.update(eachClassDocRef, {
        order: (index + 1).toString(),
      });
    });
    await batch.commit();
    console.log("Aulas atualizadas com sucesso!");
    return true;
  } catch (error) {
    console.error("Erro ao atualizar a ordem dos aulas:", error);
    return false;
  }
};

const updateCourseInfo = async (docId: string, updatedCourse: Omit<Course, "id">): Promise<boolean> => {
  try {
    const courseDocRef = doc(db, "courses", docId);
    await updateDoc(courseDocRef, updatedCourse);
    console.log("Curso atualizado com sucesso!");
    return true;
  } catch (error) {
    console.error("Erro ao atualizar o curso:", error);
    return false;
  }
};

const updateModuleInfo = async (docId: string, updatedModule: Omit<Module, "id">): Promise<boolean> => {
  try {
    const moduleDocRef = doc(db, "modules", docId);
    await updateDoc(moduleDocRef, updatedModule);
    console.log("Modulo atualizado com sucesso!");
    return true;
  } catch (error) {
    console.error("Erro ao atualizar o modulo:", error);
    return false;
  }
};

const updateClassInfo = async (docId: string, updatedClass: Omit<Class, "id">): Promise<boolean> => {
  try {
    const classDocRef = doc(db, "classes", docId);
    await updateDoc(classDocRef, updatedClass);
    console.log("Aula atualizada com sucesso!");
    return true;
  } catch (error) {
    console.error("Erro ao atualizar a aula:", error);
    return false;
  }
};

export const postCourse = async (newCourse: Omit<Course, "id">): Promise<string | null> => {
  try {
    const coursesCollectionRef = collection(db, "courses");
    const docRef = await addDoc(coursesCollectionRef, newCourse);
    console.log("Curso criado com sucesso. ID Firebase Doc do curso:", docRef.id);
    return docRef.id;
  } catch (error) {
    console.error("Erro ao criar o curso:", error);
    return null;
  }
};

export const postModule = async (newModule: Omit<Module, "id">): Promise<string | null> => {
  try {
    const modulesCollectionRef = collection(db, "modules");
    const docRef = await addDoc(modulesCollectionRef, newModule);
    console.log("Modulo criado com sucesso. ID Firebase Doc do Modulo:", docRef.id);
    return docRef.id;
  } catch (error) {
    console.error("Erro ao criar o modulo:", error);
    return null;
  }
};

const postClass = async (newClass: Omit<Class, "id">): Promise<string | null> => {
  try {
    const classesCollectionRef = collection(db, "classes");
    const docRef = await addDoc(classesCollectionRef, newClass);
    console.log("Aula criada com sucesso. ID Firebase Doc do Aula:", docRef.id);
    return docRef.id;
  } catch (error) {
    console.error("Erro ao criar o modulo:", error);
    return null;
  }
};

//Front End Functions

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

export const getCourseWithModulesByDocId = async (courseId: string) => {
  const courseWithModules = await getCourseWithModules(courseId);

  return courseWithModules;
};

export const getCourseById = async (courseId: string) => {
  const course = await getCourse(courseId);
  return course;
};

export const deactivateCourseRequest = async (docId: string) => {
  const deactivateRequestResponse = await updateDeactivateCourse(docId);
  return deactivateRequestResponse;
};

export const activateCourseRequest = async (docId: string) => {
  const activateRequestResponse = await activateCourse(docId);
  return activateRequestResponse;
};

export const updateModulesOrder = async (modules: Module[]) => {
  const updateResponse = await updateModulesOrdering(modules);
  return updateResponse;
};

export const updateModuleClassesOrder = async (classes: Class[]) => {
  const updateResponse = await updateModuleClassesOrdering(classes);
  return updateResponse;
};

export const updateCourseInformations = async (docId: string, updatedCourse: Omit<Course, "id">) => {
  const updateResponse = await updateCourseInfo(docId, updatedCourse);
  return updateResponse;
};

export const updateModuleInformations = async (docId: string, updatedModule: Omit<Module, "id">) => {
  const updateResponse = updateModuleInfo(docId, updatedModule);
  return updateResponse;
};

export const updateClassInformations = async (docId: string, updateClass: Omit<Class, "id">) => {
  const updateResponse = updateClassInfo(docId, updateClass);
  return updateResponse;
};

export const createClass = async (newClass: Omit<Class, "id">) => {
  const postResponse = await postClass(newClass);
  return postResponse;
};

export const getClassesFromModule = async (moduleId: string) => {
  const getResponse = await getModulesClasses(moduleId);
  return getResponse;
};
