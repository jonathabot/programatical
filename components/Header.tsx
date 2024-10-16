"use client";

import { motion } from "framer-motion";
import ProgramaticalLogoSVG from "./ProgramaticalLogoSVG";
import { Button } from "./ui/button";
import Link from "next/link";

export default function Header() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      transition={{ ease: "easeIn", duration: 2 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <header className="flex justify-between items-center h-10 py-10 sm:py-14">
        <Link href="/">
          <div className="cursor-pointer">
            <ProgramaticalLogoSVG />
          </div>
        </Link>

        <Link href="/login">
          <Button variant="secondary" className="m-2">
            Entrar
          </Button>
        </Link>
      </header>
    </motion.div>
  );
}
