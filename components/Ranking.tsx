"use client";

import { Button } from "./ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { useEffect, useState, useMemo } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { Loader } from "lucide-react";
import {
  getTopUsersRequest,
  getUserPointsRequest,
  getUserRankRequest,
  getTopUsersWeeklyPointsRequest,
} from "@/lib/firebase/ranking";
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
        let topUsers = [];
        if (period === "week") {
          topUsers = await getTopUsersWeeklyPointsRequest();
        } else {
          topUsers = await getTopUsersRequest();
        }
        const [userPoints, userRank] = await Promise.all([
          getUserPointsRequest(user.uid, period),
          getUserRankRequest(user.uid, period),
        ]);

        let currentUserProfile = null;
        if (user.uid) {
          currentUserProfile = await fetchUserData(user.uid);
        }

        if (userPoints && currentUserProfile) {
          userPoints.username = currentUserProfile.userName;
        }

        let updatedTopUsers = topUsers;
        const isCurrentUserInTop = topUsers.some((u) => u.userUid === user?.uid);
        if (!isCurrentUserInTop && user) {
          if (topUsers.length >= 10) {
            updatedTopUsers = [
              ...topUsers.slice(0, 9),
              {
                userUid: user.uid,
                username: currentUserProfile?.userName || "Usuário",
                points: 0,
                lastUpdated: new Date().toISOString(),
              },
            ];
          } else {
            updatedTopUsers = [
              ...topUsers,
              {
                userUid: user.uid,
                username: currentUserProfile?.userName || "Usuário",
                points: 0,
                lastUpdated: new Date().toISOString(),
              },
            ];
          }
        }

        let currentRank = userRank;
        if (userPoints) {
          setCurrentUserRank(currentRank);
        }

        setTopUsers(updatedTopUsers);
        setCurrentUserPoints(userPoints);
        setCurrentUserRank(currentRank);
      } catch (error) {
        console.error("Erro ao buscar ranking:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRankingData();
  }, [user, period]);

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
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="font-bold text-center text-slate-700">Rank</TableHead>
              <TableHead className="font-bold text-center text-slate-700">Usuario</TableHead>
              <TableHead className="font-bold text-center text-slate-700">Pontos</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-8">
                  <Loader className="mx-auto mb-4 h-6 w-6 animate-spin" />
                  Carregando informações de Ranking...
                </TableCell>
              </TableRow>
            ) : (
              <>
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
              </>
            )}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
