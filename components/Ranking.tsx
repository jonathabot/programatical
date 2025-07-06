"use client";

import { Button } from "./ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { useEffect, useState, useMemo } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getTopUsersRequest, getUserPointsRequest, getUserRankRequest } from "@/lib/firebase/ranking";
import { UserPoints } from "@/types/types";
import { fetchUserData } from "@/lib/firebase/users";

export default function Ranking() {
  const [topUsers, setTopUsers] = useState<UserPoints[]>([]);
  const [currentUserPoints, setCurrentUserPoints] = useState<UserPoints | null>(null);
  const [currentUserRank, setCurrentUserRank] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<"all" | "week">("all");
  const auth = getAuth();
  const [user, setUser] = useState(auth.currentUser);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (!user) {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [auth]);

  useEffect(() => {
    const fetchRankingData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const [topUsers, userPoints, userRank] = await Promise.all([
          getTopUsersRequest(),
          getUserPointsRequest(user.uid),
          getUserRankRequest(user.uid),
        ]);

        let currentUserProfile = null;
        if (user.uid) {
          currentUserProfile = await fetchUserData(user.uid);
        }

        const testUsers: UserPoints[] = [
          { id: "1", userUid: "user1", username: "João Silva", points: 1250, lastUpdated: new Date().toISOString() },
          { id: "2", userUid: "user2", username: "Maria Santos", points: 980, lastUpdated: new Date().toISOString() },
          { id: "3", userUid: "user3", username: "Pedro Oliveira", points: 875, lastUpdated: new Date().toISOString() },
          { id: "4", userUid: "user4", username: "Ana Costa", points: 720, lastUpdated: new Date().toISOString() },
          { id: "5", userUid: "user5", username: "Lucas Ferreira", points: 650, lastUpdated: new Date().toISOString() },
          { id: "6", userUid: "user6", username: "Julia Lima", points: 580, lastUpdated: new Date().toISOString() },
          { id: "7", userUid: "user7", username: "Rafael Souza", points: 490, lastUpdated: new Date().toISOString() },
          { id: "8", userUid: "user8", username: "Carla Martins", points: 420, lastUpdated: new Date().toISOString() },
          { id: "9", userUid: "user9", username: "Bruno Alves", points: 380, lastUpdated: new Date().toISOString() },
        ];

        const allUsers = [...testUsers, ...topUsers].sort((a, b) => b.points - a.points).slice(0, 9);

        if (userPoints && currentUserProfile) {
          userPoints.username = currentUserProfile.userName;
        }

        const updatedTopUsers = await Promise.all(
          allUsers.map(async (user) => {
            if (
              user.userUid !== "user1" &&
              user.userUid !== "user2" &&
              user.userUid !== "user3" &&
              user.userUid !== "user4" &&
              user.userUid !== "user5" &&
              user.userUid !== "user6" &&
              user.userUid !== "user7" &&
              user.userUid !== "user8" &&
              user.userUid !== "user9"
            ) {
              const userProfile = await fetchUserData(user.userUid);
              return { ...user, username: userProfile.userName };
            }
            return user;
          })
        );

        let currentRank = 10;
        if (userPoints) {
          const allUsersWithCurrent = [...updatedTopUsers, userPoints].sort((a, b) => b.points - a.points);
          currentRank = allUsersWithCurrent.findIndex((u) => u.userUid === userPoints.userUid) + 1;
        }

        setTopUsers(updatedTopUsers);
        setCurrentUserPoints(userPoints);
        setCurrentUserRank(currentRank);
      } catch (error) {
        console.error("Error fetching ranking data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRankingData();
  }, [user]);

  const filteredUsers = useMemo(() => {
    if (period === "all") return topUsers;

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    return topUsers
      .filter((user) => {
        const lastUpdated = new Date(user.lastUpdated);
        return lastUpdated >= oneWeekAgo;
      })
      .sort((a, b) => b.points - a.points);
  }, [topUsers, period]);

  const filteredCurrentUser = useMemo(() => {
    if (!currentUserPoints) return null;
    if (period === "all") return currentUserPoints;

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const lastUpdated = new Date(currentUserPoints.lastUpdated);

    return lastUpdated >= oneWeekAgo ? currentUserPoints : null;
  }, [currentUserPoints, period]);

  const filteredRank = useMemo(() => {
    if (!filteredCurrentUser) return "-";
    if (period === "all") return currentUserRank;

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const usersWithMorePoints = filteredUsers.filter((user) => user.points > filteredCurrentUser.points).length;

    return usersWithMorePoints + 1;
  }, [filteredCurrentUser, filteredUsers, period, currentUserRank]);

  const isCurrentUser = (userUid: string) => user?.uid === userUid;

  return (
    <>
      <div className="flex gap-2 mb-4 justify-end">
        <Button
          className={`${
            period === "week" ? "bg-jyunBlue hover:bg-cyan-600 text-white" : "bg-white hover:bg-gray-200 text-black"
          }`}
          onClick={() => setPeriod("week")}
        >
          7 dias
        </Button>
        <Button
          className={`${
            period === "all" ? "bg-jyunBlue hover:bg-cyan-600 text-white" : "bg-white hover:bg-gray-200 text-black"
          }`}
          onClick={() => setPeriod("all")}
        >
          Todos os tempos
        </Button>
      </div>
      <div className="bg-slate-50 rounded-lg w-[350px] text-center text-slate-700 select-none">
        {loading ? (
          "Carregando informações de Ranking..."
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-bold text-center text-slate-700">Rank</TableHead>
                <TableHead className="font-bold text-center text-slate-700">Usuario</TableHead>
                <TableHead className="font-bold text-center text-slate-700">Pontos</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((userAtRank, index) => (
                <TableRow
                  key={userAtRank.userUid}
                  className={`h-10 ${isCurrentUser(userAtRank.userUid) ? "bg-cyan-100/50" : ""}`}
                >
                  <TableCell className="font-bold">{index + 1}</TableCell>
                  <TableCell>{userAtRank.username}</TableCell>
                  <TableCell className="font-bold text-blue-700">{userAtRank.points}</TableCell>
                </TableRow>
              ))}
              {filteredCurrentUser && !filteredUsers.some((u) => u.userUid === filteredCurrentUser.userUid) && (
                <TableRow className="h-10 bg-yellow-100">
                  <TableCell className="font-bold">{filteredRank}</TableCell>
                  <TableCell>{filteredCurrentUser.username}</TableCell>
                  <TableCell className="font-bold text-blue-700">{filteredCurrentUser.points || 0}</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </div>
    </>
  );
}
