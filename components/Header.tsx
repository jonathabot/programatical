"use client";

import { motion } from "framer-motion";
import ProgramaticalLogoSVG from "./ProgramaticalLogoSVG";
import { Button } from "./ui/button";
import Link from "next/link";
import { auth } from "@/firebase.config";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { User as FirebaseUser, signOut } from "firebase/auth";

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<FirebaseUser | null>(null);

  auth.onAuthStateChanged((user) => {
    if (user) {
      setUser(user);
    } else {
      setUser(null);
    }

    if (user && pathname === "/") {
      router.push("/initialpage");
    }

    if (
      !user &&
      pathname !== "/" &&
      pathname !== "/login" &&
      pathname !== "/register"
    ) {
      router.push("/");
    }
  });

  const userSignOut = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.log(auth);
    } finally {
      router.push("/");
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
        <Link href={user ? "/initialpage" : "/"}>
          <div className="cursor-pointer">
            <ProgramaticalLogoSVG />
          </div>
        </Link>

        {user ? (
          <Button variant="secondary" className="m-2" onClick={userSignOut}>
            Sair
          </Button>
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
