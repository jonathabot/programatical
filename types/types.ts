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
