"use client";
import { motion } from "framer-motion";
import { Button } from "./ui/button";
import GradientText from "./ui/gradient-text";
import Link from "next/link";
import { Typewriter } from "react-simple-typewriter";

export default function HomePageContent() {
  const topics = [
    "Scrum.",
    "Arquitetura de Software.",
    "Solid.",
    "Domain Driven Design.",
    "Git.",
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      transition={{ ease: "easeIn", duration: 2 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col gap-16 w-[80%]"
    >
      <GradientText className="text-2xl md:text-6xl">
        Aprenda novos conceitos sobre <br /> Programação de forma única e
        gratuita.
      </GradientText>

      <span className="text-base md:text-xl text-gray-300 text-center">
        Conteúdos como:{" "}
        <Typewriter
          words={topics}
          loop={0}
          cursor
          cursorStyle="_"
          typeSpeed={70}
          deleteSpeed={100}
          delaySpeed={2000}
        />
      </span>

      <div className="text-2xl flex justify-evenly w-full">
        {/* <Button variant="secondary" size="lg">
          Mais informações
        </Button> */}
        <Link href="/register">
          <Button size="lg">Começar agora</Button>
        </Link>
      </div>
    </motion.div>
  );
}
