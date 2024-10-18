"use client";
import { motion } from "framer-motion";
import { Button, buttonVariants } from "./ui/button";
import GradientText from "./ui/gradient-text";
import Link from "next/link";
import { auth } from "@/firebase.config";
import { useRouter } from "next/navigation";

export default function HomePageContent() {
  const router = useRouter();
  // Checando se o usuário está logado
  auth.onAuthStateChanged((user) => {
    if (user) {
      console.log(user);
      router.push("/initialpage");
    } else {
      console.log("Not logged yet.");
    }
  });

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

      <span className="text-base md:text-xl text-white text-center">
        Conteúdos como: Scrum, Arquitetura de Software, Solid, Domain Driven
        Design e Git.
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
