import { db } from "@/firebase.config";
import { getDocs, collection, doc, getDoc, addDoc, updateDoc, query, where, writeBatch } from "firebase/firestore";
import {
  Course,
  Module,
  CourseWithModules,
  Class,
  Step,
  TextStep,
  MultipleChoiceStep,
  DragAndDropStep,
  ClassCompletion,
  ModuleCompletion,
  CourseCompletion,
  EnrollmentCourse,
} from "@/types/types";

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

const getModuleInformations = async (docId: string): Promise<Module> => {
  const moduleDocRef = doc(db, "modules", docId);
  const response = await getDoc(moduleDocRef);
  return response.data() as Module;
};

const getClassInformations = async (docId: string): Promise<Class> => {
  const classDocRef = doc(db, "classes", docId);
  const response = await getDoc(classDocRef);
  return response.data() as Class;
};

const getClassesSteps = async (classId: string): Promise<Step[]> => {
  const stepsCollectionRef = collection(db, "steps");
  const stepsQuery = query(stepsCollectionRef, where("attachedTo_ClassId", "==", classId));
  const stepsSnapshot = await getDocs(stepsQuery);

  return stepsSnapshot.docs
    .map((doc) => ({
      id: doc.id,
      stepName: doc.data().stepName,
      stepType: doc.data().stepType,
      isActive: doc.data().isActive,
      order: doc.data().order,
      createdAt: doc.data().createdAt,
      attachedTo_ClassId: doc.data().attachedTo_ClassId,
    }))
    .sort((a, b) => a.order - b.order);
};

const getStep = async (stepId: string): Promise<TextStep | MultipleChoiceStep | DragAndDropStep | null> => {
  const stepDocRef = doc(db, "steps", stepId);
  const response = await getDoc(stepDocRef);

  if (!response.exists()) {
    return null;
  }

  const stepData = response.data();
  const baseStep = {
    id: response.id,
    stepName: stepData?.stepName || "",
    stepType: stepData?.stepType || "",
    isActive: stepData?.isActive || false,
    order: stepData?.order || 0,
    createdAt: stepData?.createdAt || "",
    attachedTo_ClassId: stepData?.attachedTo_ClassId || "",
  };

  if (stepData?.stepType === "Text") {
    return {
      ...baseStep,
      stepType: "Text",
      content: stepData?.content || "",
    } as TextStep;
  } else if (stepData?.stepType === "MultipleChoice") {
    return {
      ...baseStep,
      stepType: "MultipleChoice",
      question: stepData?.question || {
        statement: "",
        options: [],
        correctOptionId: -1,
      },
      isVerified: stepData?.isVerified || false,
      onSelect: () => {},
    } as MultipleChoiceStep;
  } else if (stepData?.stepType === "DragAndDrop") {
    return {
      ...baseStep,
      stepType: "DragAndDrop",
      question: stepData?.question || {
        statement: "",
        words: [],
        correctWordIds: [],
      },
      isVerified: stepData?.isVerified || false,
      onSelect: () => {},
    } as DragAndDropStep;
  }

  return null;
};

const getUserModuleClassesCompletion = async (moduleDocId: string, userUid: string): Promise<ClassCompletion[]> => {
  try {
    const classCompletionsRef = collection(db, "classCompletions");
    const q = query(classCompletionsRef, where("moduleDocId", "==", moduleDocId), where("userUid", "==", userUid));

    const querySnapshot = await getDocs(q);
    const completions: ClassCompletion[] = [];

    querySnapshot.forEach((doc) => {
      completions.push(doc.data() as ClassCompletion);
    });

    return completions;
  } catch (error) {
    console.error("Error fetching class completions:", error);
    return [];
  }
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
    return true;
  } catch (error) {
    console.error("Erro ao atualizar a aula:", error);
    return false;
  }
};

const updateStep = async (docId: string, updatedStep: Omit<Step, "id">): Promise<boolean> => {
  try {
    const stepDocRef = doc(db, "steps", docId);
    await updateDoc(stepDocRef, updatedStep);
    return true;
  } catch (error) {
    console.error("Erro ao atualizar a etapa:", error);
    return false;
  }
};

export const postCourse = async (newCourse: Omit<Course, "id">): Promise<string | null> => {
  try {
    const coursesCollectionRef = collection(db, "courses");
    const docRef = await addDoc(coursesCollectionRef, newCourse);
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
    return docRef.id;
  } catch (error) {
    console.error("Erro ao criar a Aula:", error);
    return null;
  }
};

const postStep = async (newStep: Omit<Step, "id">): Promise<string | null> => {
  try {
    const stepsCollectionRef = collection(db, "steps");
    const docRef = await addDoc(stepsCollectionRef, newStep);
    return docRef.id;
  } catch (error) {
    console.error("Erro ao criar a etapa:", error);
    return null;
  }
};

const postClassCompletion = async (newClassCompletion: Omit<ClassCompletion, "id">): Promise<string | null> => {
  try {
    const classCompletionsCollectionRef = collection(db, "classCompletions");
    const docRef = await addDoc(classCompletionsCollectionRef, newClassCompletion);
    return docRef.id;
  } catch (error) {
    console.error("Erro ao criar a aula concluída:", error);
    return null;
  }
};

const getUserModuleCompletions = async (courseId: string, userUid: string): Promise<ModuleCompletion[]> => {
  try {
    const moduleCompletionsRef = collection(db, "moduleCompletions");
    const q = query(moduleCompletionsRef, where("courseId", "==", courseId), where("userUid", "==", userUid));

    const querySnapshot = await getDocs(q);
    const completions: ModuleCompletion[] = [];

    querySnapshot.forEach((doc) => {
      completions.push({ id: doc.id, ...doc.data() } as ModuleCompletion);
    });

    return completions;
  } catch (error) {
    console.error("Error fetching module completions:", error);
    return [];
  }
};

const postModuleCompletion = async (newModuleCompletion: Omit<ModuleCompletion, "id">): Promise<string | null> => {
  try {
    const moduleCompletionsCollectionRef = collection(db, "moduleCompletions");
    const docRef = await addDoc(moduleCompletionsCollectionRef, newModuleCompletion);
    console.log("Módulo concluído com sucesso. ID Firebase Doc:", docRef.id);
    return docRef.id;
  } catch (error) {
    console.error("Erro ao criar o módulo concluído:", error);
    return null;
  }
};

const postCourseCompletion = async (newCourseCompletion: Omit<CourseCompletion, "id">): Promise<string | null> => {
  try {
    const docRef = await addDoc(collection(db, "courseCompletions"), newCourseCompletion);
    console.log("Course Completion written with ID: ", docRef.id);
    return docRef.id;
  } catch (e) {
    console.error("Error adding course completion: ", e);
    return null;
  }
};

const postEnrollmentCourse = async (newEnrollment: Omit<EnrollmentCourse, "id">): Promise<string | null> => {
  try {
    const enrollmentCollectionRef = collection(db, "coursesEnrollments");
    const docRef = await addDoc(enrollmentCollectionRef, newEnrollment);
    console.log("Enrollment course created with ID: ", docRef.id);
    return docRef.id;
  } catch (e) {
    console.error("Error adding enrollment course: ", e);
    return null;
  }
};

const getUserEnrollments = async (userUid: string): Promise<EnrollmentCourse[]> => {
  try {
    const enrollmentsRef = collection(db, "coursesEnrollments");
    const q = query(enrollmentsRef, where("userUid", "==", userUid));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
        } as EnrollmentCourse)
    );
  } catch (error) {
    console.error("Error fetching user enrollments:", error);
    return [];
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

export const getModuleInfoByDocId = async (docId: string) => {
  const module = await getModuleInformations(docId);
  return module;
};

export const getClassInfoByDocId = async (docId: string) => {
  const _class = await getClassInformations(docId);
  return _class;
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

export const updateStepInformations = async (docId: string, updatedStep: Omit<Step, "id">) => {
  const updateResponse = await updateStep(docId, updatedStep);
  return updateResponse;
};

export const createClass = async (newClass: Omit<Class, "id">) => {
  const postResponse = await postClass(newClass);
  return postResponse;
};

export const createStep = async (newStep: Omit<Step, "id">) => {
  const postResponse = await postStep(newStep);
  return postResponse;
};

export const getClassesFromModule = async (moduleId: string) => {
  const getResponse = await getModulesClasses(moduleId);
  return getResponse;
};

export const getStepsFromClass = async (classId: string) => {
  const getResponse = await getClassesSteps(classId);
  return getResponse;
};

export const getStepInformations = async (stepId: string) => {
  const getResponse = await getStep(stepId);
  return getResponse;
};

export const classCompletionRequest = async (newClassCompletion: Omit<ClassCompletion, "id">) => {
  console.log(newClassCompletion);
  const postResponse = await postClassCompletion(newClassCompletion);
  return postResponse;
};

export const getUserClassesCompletionsFromModuleByDocId = async (moduleDocId: string, userUid: string) => {
  const getResponse = await getUserModuleClassesCompletion(moduleDocId, userUid);
  return getResponse;
};

export const moduleCompletionRequest = async (newModuleCompletion: Omit<ModuleCompletion, "id">) => {
  const postResponse = await postModuleCompletion(newModuleCompletion);
  return postResponse;
};

export const getUserModuleCompletionsRequest = async (courseId: string, userUid: string) => {
  const completions = await getUserModuleCompletions(courseId, userUid);
  return completions;
};

export const courseCompletionRequest = async (newCourseCompletion: Omit<CourseCompletion, "id">) => {
  const postResponse = await postCourseCompletion(newCourseCompletion);
  return postResponse;
};

export const enrollCourseRequest = async (newEnrollment: Omit<EnrollmentCourse, "id">) => {
  const postResponse = await postEnrollmentCourse(newEnrollment);
  return postResponse;
};

export const getUserEnrollmentsRequest = async (userUid: string) => {
  const enrollments = await getUserEnrollments(userUid);
  return enrollments;
};
