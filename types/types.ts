export interface Curso {
  id: string;
  idCurso: string;
  nomeCurso: string;
  descricao: string;
}

export interface CourseModule {
  id: string;
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
