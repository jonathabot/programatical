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

export interface Steps {
  id: string;
  createdAt: string;
  isActive: boolean;
  attachedTo_ClassId: string;
  order: string;
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
