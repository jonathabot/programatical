export interface Course {
  id: string;
  courseId: string;
  courseName: string;
  courseDescription: string;
  createdAt: string;
  active: boolean;
}

export interface Module {
  id: string;
  moduleId: string;
  moduleName: string;
  moduleDescription: string;
  createdAt: string;
  isActive: boolean;
  attachedTo_CourseId: string;
  order: string;
}

export interface Class {
  id: string;
  classId: string;
  className: string;
  classDescription: string;
  createdAt: string;
  isActive: boolean;
  attachedTo_ModuleId: string;
  order: string;
}

type StepType = "Text" | "MultipleChoice" | "DragAndDrop";

export interface Step {
  id: string;
  stepName: string;
  stepType: StepType;
  createdAt: string;
  isActive: boolean;
  attachedTo_ClassId: string;
  order: string;
}

export interface TextStep extends Step {
  stepType: "Text";
  content: string;
}

export interface MultipleChoiceStep extends Step {
  stepType: "MultipleChoice";
  question: {
    statement: string;
    options: { id: number; answer: string }[];
    correctOptionId: number;
  };
  isVerified: boolean;
  onSelect: (selectedOptionId: number) => void;
}

export interface DragAndDropStep extends Step {
  stepType: "DragAndDrop";
  question: {
    statement: string;
    words: { id: number; word: string }[];
    correctWordIds: number[];
  };
  isVerified: boolean;
  onSelect: (selectedOptionId: number) => void;
}

export interface CourseWithModules extends Course {
  modules: Module[];
}

export interface CourseModule {
  id: string;
  moduleId: string;
  isActive: boolean;
  nome: string;
  order: number;
}

export interface UserInfo {
  createdAt: string;
  email: string;
  uid: string;
  userRole: number;
  userName: string;
}

export interface ClassCompletion {
  id: string;
  classId: string;
  finishedAt: string;
  userUid: string;
  moduleDocId: string;
}

export interface ModuleCompletion {
  id?: string;
  moduleId: string;
  userUid: string;
  finishedAt: string;
  courseId: string;
}

export interface CourseCompletion {
  id?: string;
  courseId: string;
  userUid: string;
  finishedAt: string;
}

export interface EnrollmentCourse {
  id?: string;
  courseId: string;
  userUid: string;
  enrollmentDate: string;
}

export interface UserPoints {
  id?: string;
  userUid: string;
  username: string;
  points: number;
  lastUpdated: string;
}
