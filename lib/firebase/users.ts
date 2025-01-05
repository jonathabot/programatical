import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase.config";
import { UserInfo } from "@/types/types";

const getUserData = async (uid: string): Promise<UserInfo> => {
  try {
    const userRef = doc(db, "users", uid);
    const userSnapshot = await getDoc(userRef);

    if (userSnapshot.exists()) {
      const data = userSnapshot.data();

      // Verifica se as propriedades obrigatórias existem
      if (
        typeof data.createdAt === "string" &&
        typeof data.email === "string" &&
        typeof data.uid === "string" &&
        (typeof data.userRole === "string" || typeof data.userRole === "number")
      ) {
        return {
          createdAt: data.createdAt,
          email: data.email,
          uid: data.uid,
          userRole:
            typeof data.userRole === "string"
              ? parseInt(data.userRole)
              : data.userRole,
          userName: data.userName,
        };
      } else {
        throw new Error("Dados do usuário incompletos ou inválidos.");
      }
    } else {
      throw new Error("Usuário não encontrado.");
    }
  } catch (error) {
    console.error("Erro ao buscar usuário:", error);
    throw error;
  }
};

export const fetchUserData = async (uid: string): Promise<UserInfo> => {
  return await getUserData(uid);
};

export const isUserAllowedToAdmPage = async (uid: string) => {
  const userData = await getUserData(uid);
  if (userData.userRole == 5) {
    return true;
  } else {
    throw new Error(
      "Oops! Você não tem permissão para acessar o painel administrativo."
    );
  }
};
