import { addDoc, collection, doc, getDoc, getDocs, limit, orderBy, query, updateDoc, where } from "firebase/firestore";
import { db } from "@/firebase.config";
import { UserPoints } from "@/types/types";
import { Timestamp } from "firebase/firestore";

const getUserPoints = async (userUid: string, period: "all" | "week" = "all"): Promise<UserPoints | null> => {
  try {
    const pointsRef = collection(db, "userPoints");
    let q;

    if (period === "week") {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      q = query(pointsRef, where("userUid", "==", userUid), where("lastUpdated", ">=", oneWeekAgo.toISOString()));
    } else {
      q = query(pointsRef, where("userUid", "==", userUid));
    }

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

const getTopUsers = async (period: "all" | "week" = "all"): Promise<UserPoints[]> => {
  try {
    const pointsRef = collection(db, "userPoints");
    let q;

    if (period === "week") {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      q = query(pointsRef, where("lastUpdated", ">=", oneWeekAgo.toISOString()), orderBy("points", "desc"), limit(9));
    } else {
      q = query(pointsRef, orderBy("points", "desc"), limit(9));
    }

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

const getUserRank = async (userUid: string, period: "all" | "week" = "all"): Promise<number> => {
  try {
    const pointsRef = collection(db, "userPoints");
    const userPoints = await getUserPoints(userUid, period);

    if (!userPoints) return 0;

    let q;
    if (period === "week") {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      q = query(
        pointsRef,
        where("lastUpdated", ">=", oneWeekAgo.toISOString()),
        where("points", ">", userPoints.points)
      );
    } else {
      q = query(pointsRef, where("points", ">", userPoints.points));
    }

    const querySnapshot = await getDocs(q);
    return querySnapshot.size + 1;
  } catch (error) {
    console.error("Error fetching user rank:", error);
    return 0;
  }
};

export const getUserPointsRequest = async (userUid: string, period: "all" | "week" = "all") => {
  return await getUserPoints(userUid, period);
};

export const updateUserPointsRequest = async (userUid: string, username: string, pointsToAdd: number) => {
  return await updateUserPoints(userUid, username, pointsToAdd);
};

export const getTopUsersRequest = async (period: "all" | "week" = "all") => {
  return await getTopUsers(period);
};

export const getUserRankRequest = async (userUid: string, period: "all" | "week" = "all") => {
  return await getUserRank(userUid, period);
};
