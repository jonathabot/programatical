"use client";

import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter, useParams, usePathname } from "next/navigation";

export default function BackButton() {
  const router = useRouter();
  const params = useParams();
  const pathname = usePathname();

  const isCoursePage = pathname?.startsWith("/coursepage/");
  const isModulePage = isCoursePage && params.moduloslug;
  const isAulaPage = isModulePage && params.aulaslug;

  let buttonConfig = null;

  if (isAulaPage) {
    buttonConfig = {
      text: "Voltar para módulo",
      path: `/coursepage/${params.slug}/modulopage/${params.moduloslug}`,
    };
  } else if (isModulePage) {
    buttonConfig = {
      text: "Voltar para curso",
      path: `/coursepage/${params.slug}`,
    };
  } else if (isCoursePage) {
    buttonConfig = {
      text: "Voltar para cursos",
      path: "/initialpage",
    };
  }

  if (!buttonConfig) {
    return null;
  }

  return (
    <Button
      variant="ghost"
      className="flex gap-2 text-zinc-400 hover:text-white hover:bg-transparent mb-4"
      onClick={() => router.push(buttonConfig.path)}
    >
      <ChevronLeft className="h-4 w-4" />
      {buttonConfig.text}
    </Button>
  );
}
