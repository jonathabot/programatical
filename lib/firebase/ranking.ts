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

      q = query(pointsRef, where("lastUpdated", ">=", oneWeekAgo.toISOString()), orderBy("points", "desc"), limit(10));
    } else {
      q = query(pointsRef, orderBy("points", "desc"), limit(10));
    }

    const querySnapshot = await getDocs(q);
    const users = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as UserPoints[];

    const usersWithNames = await Promise.all(
      users.map(async (user) => {
        const userName = await fetchUserName(user.userUid);
        return { ...user, username: userName };
      })
    );

    return usersWithNames;
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

const calculateWeeklyPoints = async (userUid: string): Promise<number> => {
  try {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    let weeklyPoints = 0;

    const classCompletionsRef = collection(db, "classCompletions");
    const classQuery = query(
      classCompletionsRef,
      where("userUid", "==", userUid),
      where("finishedAt", ">=", oneWeekAgo.toISOString())
    );
    const classSnapshot = await getDocs(classQuery);
    weeklyPoints += classSnapshot.size * 5;

    const moduleCompletionsRef = collection(db, "moduleCompletions");
    const moduleQuery = query(
      moduleCompletionsRef,
      where("userUid", "==", userUid),
      where("finishedAt", ">=", oneWeekAgo.toISOString())
    );
    const moduleSnapshot = await getDocs(moduleQuery);
    weeklyPoints += moduleSnapshot.size * 10;

    const courseCompletionsRef = collection(db, "courseCompletions");
    const courseQuery = query(
      courseCompletionsRef,
      where("userUid", "==", userUid),
      where("finishedAt", ">=", oneWeekAgo.toISOString())
    );
    const courseSnapshot = await getDocs(courseQuery);
    weeklyPoints += courseSnapshot.size * 100;

    return weeklyPoints;
  } catch (error) {
    console.error("Error calculating weekly points:", error);
    return 0;
  }
};

const fetchUserName = async (userUid: string): Promise<string> => {
  try {
    const userRef = doc(db, "users", userUid);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      return userSnap.data().userName || "Usuário";
    }
    return "Usuário";
  } catch {
    return "Usuário";
  }
};

const getTopUsersWeeklyPoints = async (): Promise<UserPoints[]> => {
  try {
    const pointsRef = collection(db, "userPoints");
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const q = query(pointsRef, where("lastUpdated", ">=", oneWeekAgo.toISOString()), orderBy("lastUpdated", "desc"));

    const querySnapshot = await getDocs(q);
    const allUsers = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as UserPoints[];

    const usersWithWeeklyPoints = await Promise.all(
      allUsers.map(async (user) => {
        const weeklyPoints = await calculateWeeklyPoints(user.userUid);
        const userName = await fetchUserName(user.userUid);
        return { ...user, points: weeklyPoints, username: userName };
      })
    );

    const topUsers = usersWithWeeklyPoints
      .filter((user) => user.points > 0)
      .sort((a, b) => b.points - a.points)
      .slice(0, 10);

    return topUsers;
  } catch (error) {
    console.error("Error fetching top users weekly points:", error);
    return [];
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

export const getTopUsersWeeklyPointsRequest = async () => {
  return await getTopUsersWeeklyPoints();
};
