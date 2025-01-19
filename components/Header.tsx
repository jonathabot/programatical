"use client";

import { motion } from "framer-motion";
import ProgramaticalLogoSVG from "./ProgramaticalLogoSVG";
import { Button } from "./ui/button";
import Link from "next/link";
import { auth } from "@/firebase.config";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { User as FirebaseUser, signOut } from "firebase/auth";
import { fetchUserData, isUserAllowedToAdmPage } from "@/lib/firebase/users";
import { useToast } from "@/hooks/use-toast";

interface UserInformation {
  userRole: string;
  userName: string;
}

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userInformations, setUserInformations] =
    useState<UserInformation | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Executa apenas no lado do cliente
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);

      if (
        !user &&
        pathname !== "/" &&
        pathname !== "/login" &&
        pathname !== "/register" &&
        pathname !== "/about-us"
      ) {
        router.push("/");
      }

      if (user && (pathname == "/login" || pathname == "/register")) {
        router.push("/initialpage");
      }

      if (!user?.uid) {
        return console.error("User doesn't have an UID.");
      }

      const fetchData = async () => {
        try {
          const data = await fetchUserData(user.uid);
          setUserInformations({
            userRole: data.userRole.toString(),
            userName: data?.userName ?? "UndefinedPython123",
          });
        } catch (err) {
          console.error(err);
        }
      };

      fetchData();

      if (user && userInformations && pathname === "/") {
        router.push("/initialpage");
      }
    });

    // Limpeza do listener quando o componente desmonta
    return () => unsubscribe();
  }, [pathname, router]);

  const userSignOut = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error(err);
    } finally {
      router.push("/");
    }
  };

  const userGoToAdmPage = async () => {
    if (!user?.uid) return;
    try {
      await isUserAllowedToAdmPage(user?.uid);
      router.push("/administrationpage");
    } catch (err) {
      console.error(err);
      toast({
        title: "Ooops! ❌❌",
        description:
          "Você não tem permissão para acessar o painel administrativo.",
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      transition={{ ease: "easeIn", duration: 2 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <header className="flex justify-between items-center h-10 py-10 sm:py-14">
        <div>
          <Link href={user ? "/initialpage" : "/"}>
            <div className="cursor-pointer">
              <ProgramaticalLogoSVG />
            </div>
          </Link>

          {pathname.startsWith("/administrationpage") ? (
            <span className="text-pmgGray">Painel Administrativo</span>
          ) : null}
        </div>

        {user && userInformations ? (
          <div className="flex items-center gap-2">
            <div className="flex flex-col justify-center items-end text-right">
              <span className="text-white font-medium leading-none">
                {userInformations.userName}
              </span>
              {userInformations.userRole == "1" ? (
                <span className="text-pmgGray font-medium leading-none text-sm">
                  Aluno
                </span>
              ) : null}
              {userInformations.userRole == "5" ? (
                <span
                  className="text-pmgGray font-medium leading-none text-sm hover:underline hover:cursor-pointer select-none"
                  onClick={userGoToAdmPage}
                >
                  Administrador
                </span>
              ) : null}
            </div>

            <Link href={user ? "/userprofile" : "/"}>
              <div className="relative group">
                <img
                  src="/userPlaceholder.svg"
                  alt="User"
                  width={30}
                  height={30}
                  className="rounded-full group-hover:ring-2 group-hover:ring-gray-300 group-hover:p-1 transition-all duration-300 cursor-pointer"
                />
              </div>
            </Link>

            <Button variant="secondary" className="m-2" onClick={userSignOut}>
              Sair
            </Button>
          </div>
        ) : pathname === "/" || pathname === "/register" ? (
          <Link href="/login">
            <Button variant="secondary" className="m-2">
              Entrar
            </Button>
          </Link>
        ) : null}
      </header>
    </motion.div>
  );
}
