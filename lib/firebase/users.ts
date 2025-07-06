import { addDoc, collection, doc, getDoc, getDocs, limit, orderBy, query, updateDoc, where } from "firebase/firestore";
import { db } from "@/firebase.config";
import { UserInfo, UserPoints } from "@/types/types";
import { getAuth } from "firebase/auth";

const getUserData = async (uid: string): Promise<UserInfo> => {
  try {
    const userRef = doc(db, "users", uid);
    const userSnapshot = await getDoc(userRef);

    if (userSnapshot.exists()) {
      const data = userSnapshot.data();

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
          userRole: typeof data.userRole === "string" ? parseInt(data.userRole) : data.userRole,
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
    throw new Error("Oops! Você não tem permissão para acessar o painel administrativo.");
  }
};

//RANKING

const getUserPoints = async (userUid: string): Promise<UserPoints | null> => {
  try {
    const pointsRef = collection(db, "userPoints");
    const q = query(pointsRef, where("userUid", "==", userUid));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) return null;

    const doc = querySnapshot.docs[0];
    return { id: doc.id, ...doc.data() } as UserPoints;
  } catch (error) {
    console.error("Error fetching user points:", error);
    return null;
  }
};

const updateUserPoints = async (userUid: string, username: string, pointsToAdd: number) => {
  try {
    const pointsRef = collection(db, "userPoints");
    const q = query(pointsRef, where("userUid", "==", userUid));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      const newPoints: Omit<UserPoints, "id"> = {
        userUid,
        username,
        points: pointsToAdd,
        lastUpdated: new Date().toISOString(),
      };
      await addDoc(pointsRef, newPoints);
    } else {
      const doc = querySnapshot.docs[0];
      const currentPoints = doc.data().points;
      await updateDoc(doc.ref, {
        points: currentPoints + pointsToAdd,
        lastUpdated: new Date().toISOString(),
      });
    }
  } catch (error) {
    console.error("Error updating user points:", error);
  }
};

const getTopUsers = async (limitCount: number = 9): Promise<UserPoints[]> => {
  try {
    const pointsRef = collection(db, "userPoints");
    const q = query(pointsRef, orderBy("points", "desc"), limit(limitCount));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as UserPoints[];
  } catch (error) {
    console.error("Error fetching top users:", error);
    return [];
  }
};

const getUserRank = async (userUid: string): Promise<number> => {
  try {
    const pointsRef = collection(db, "userPoints");
    const userPoints = await getUserPoints(userUid);

    if (!userPoints) return 0;

    const q = query(pointsRef, where("points", ">", userPoints.points));
    const querySnapshot = await getDocs(q);

    return querySnapshot.size + 1;
  } catch (error) {
    console.error("Error fetching user rank:", error);
    return 0;
  }
};

export const getUserPointsRequest = async (userUid: string) => {
  return await getUserPoints(userUid);
};

export const updateUserPointsRequest = async (userUid: string, username: string, pointsToAdd: number) => {
  return await updateUserPoints(userUid, username, pointsToAdd);
};

export const getTopUsersRequest = async (limit: number = 9) => {
  return await getTopUsers(limit);
};

export const getUserRankRequest = async (userUid: string) => {
  return await getUserRank(userUid);
};
