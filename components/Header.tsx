"use client";

import { motion } from "framer-motion";
import ProgramaticalLogoSVG from "./ProgramaticalLogoSVG";
import { Button } from "./ui/button";

export default function Header() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      transition={{ ease: "easeIn", duration: 2 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <header className="flex justify-between items-center h-10 py-10 sm:py-14">
        <div className="cursor-pointer">
          <ProgramaticalLogoSVG />
        </div>

        <Button variant="default" className="m-2">
          Entrar
        </Button>
      </header>
    </motion.div>
  );
}
