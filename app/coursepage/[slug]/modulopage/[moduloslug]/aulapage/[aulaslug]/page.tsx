"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { AulaConcluida, EtapaPerguntaArraste, EtapaPerguntaMultiplaEscolha, EtapaTexto } from "@/components/Etapas";
import { useParams, useRouter } from "next/navigation";
import { Class, Step, TextStep, MultipleChoiceStep, DragAndDropStep, ClassCompletion, Module } from "@/types/types";
import {
  getClassInfoByDocId,
  getStepsFromClass,
  getStepInformations,
  classCompletionRequest,
  getClassesFromModule,
  getModuleInfoByDocId,
  moduleCompletionRequest,
  getCourseWithModulesByDocId,
  courseCompletionRequest,
  getCourseById,
} from "@/lib/firebase/courses";
import { updateUserPointsRequest } from "@/lib/firebase/ranking";
import { getAuth } from "firebase/auth";
import { Trophy, CheckCircle2 } from "lucide-react";

const ModuloConcluido = () => {
  return (
    <div className="flex flex-col items-center justify-center text-center">
      <Trophy className="w-24 h-24 text-yellow-500 mb-6" />
      <h2 className="text-2xl font-bold mb-4">Módulo Concluído!</h2>
      <p className="text-zinc-400 mb-8">Parabéns! Você completou todas as aulas deste módulo.</p>
    </div>
  );
};

const CursoConcluido = () => {
  return (
    <div className="flex flex-col items-center justify-center text-center">
      <CheckCircle2 className="w-24 h-24 text-green-500 mb-6" />
      <h2 className="text-2xl font-bold mb-4 text-green-500">CURSO CONCLUÍDO!</h2>
      <p className="text-zinc-400 mb-8">Parabéns! Você completou todos os módulos deste curso.</p>
    </div>
  );
};

export default function AulaPage() {
  const router = useRouter();
  const auth = getAuth();
  const user = auth.currentUser;

  const { slug, moduloslug, aulaslug } = useParams();
  const [classInfo, setClassInfo] = useState<Class | null>(null);
  const [classSteps, setClassSteps] = useState<Step[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLastActiveClass, setIsLastActiveClass] = useState(false);
  const [showModuleCompletion, setShowModuleCompletion] = useState(false);
  const [showCourseCompletion, setShowCourseCompletion] = useState(false);
  const [courseName, setCourseName] = useState("");
  const [moduleInfo, setModuleInfo] = useState<Module | null>(null);

  const checkIfLastActiveClass = async () => {
    try {
      const moduleInfo = await getModuleInfoByDocId(String(moduloslug));
      const classes = await getClassesFromModule(moduleInfo.moduleId);
      const activeClasses = classes.filter((c) => c.isActive);
      const sortedClasses = [...activeClasses].sort((a, b) => parseInt(a.order) - parseInt(b.order));
      const lastActiveClass = sortedClasses[sortedClasses.length - 1];
      setIsLastActiveClass(lastActiveClass?.id === aulaslug);
    } catch (err) {
      console.error("Error checking last active class:", err);
    }
  };

  const handleExitAula = () => {
    if (showCourseCompletion) {
      router.push("/initialpage");
    } else {
      router.push(`/coursepage/${slug}`);
    }
  };

  const handleClassCompletion = async () => {
    try {
      if (!classInfo?.classId || !user?.uid) {
        throw new Error("Aulapage: Missing user information");
      }

      const newClassCompletion = {
        classId: classInfo.classId,
        userUid: user.uid,
        finishedAt: new Date().toISOString(),
        moduleDocId: String(moduloslug),
      };

      await classCompletionRequest(newClassCompletion);
      await updateUserPointsRequest(user.uid, user.displayName || "Usuário", 5);

      if (isLastActiveClass) {
        const moduleInfo = await getModuleInfoByDocId(String(moduloslug));

        const newModuleCompletion = {
          moduleId: moduleInfo.moduleId,
          userUid: user.uid,
          finishedAt: new Date().toISOString(),
          courseId: String(slug),
        };

        await moduleCompletionRequest(newModuleCompletion);
        await updateUserPointsRequest(user.uid, user.displayName || "Usuário", 10);

        const courseInfoWithModules = await getCourseWithModulesByDocId(String(slug));
        if (courseInfoWithModules) {
          const activeModules = courseInfoWithModules.modules.filter((m) => m.isActive);
          const sortedActiveModules = [...activeModules].sort((a, b) => parseInt(a.order) - parseInt(b.order));
          const lastActiveModule = sortedActiveModules[sortedActiveModules.length - 1];

          if (moduleInfo.id === lastActiveModule.id) {
            const newCourseCompletion = {
              courseId: String(slug),
              userUid: user.uid,
              finishedAt: new Date().toISOString(),
            };
            await courseCompletionRequest(newCourseCompletion);
            await updateUserPointsRequest(user.uid, user.displayName || "Usuário", 100);
            setShowCourseCompletion(true);
          } else {
            setShowModuleCompletion(true);
          }
        } else {
          setShowModuleCompletion(true);
        }
      } else {
        handleExitAula();
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const fetchClassSteps = async () => {
      setIsLoading(true);
      const _class = await getClassInfoByDocId(String(aulaslug));
      const basicSteps = await getStepsFromClass(_class?.classId);

      const completeSteps = await Promise.all(
        basicSteps.map(async (step) => {
          const stepInfo = await getStepInformations(step.id);
          return stepInfo || step;
        })
      );

      setClassInfo(_class);
      setClassSteps(completeSteps);
      await checkIfLastActiveClass();

      const course = await getCourseById(String(slug));
      setCourseName(course?.courseName || "");

      const module = await getModuleInfoByDocId(String(moduloslug));
      setModuleInfo(module);

      setIsLoading(false);
    };
    fetchClassSteps();
  }, [aulaslug, moduloslug, slug]);

  const [currentStep, setCurrentStep] = useState(1);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isVerified, setIsVerified] = useState<boolean>(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [correctAnswers, setCorrectAnswers] = useState<number[]>([]);

  const etapaAtual = classSteps && classSteps.length > 0 ? classSteps[currentStep - 1] : null;
  const isCompleted = !classSteps || currentStep > classSteps.length;
  const progressValue = isLoading ? 0 : isCompleted ? 100 : ((currentStep - 1) / (classSteps?.length || 1 - 1)) * 95;

  const handleVerification = () => {
    if (etapaAtual?.stepType === "MultipleChoice") {
      const correctOptionId = (etapaAtual as MultipleChoiceStep).question?.correctOptionId;
      setIsCorrect(selectedAnswer === correctOptionId);
      setCorrectAnswers(correctOptionId ? [correctOptionId] : []);
    } else if (etapaAtual?.stepType === "DragAndDrop") {
      const correctWordIds = (etapaAtual as DragAndDropStep).question?.correctWordIds || [];
      setIsCorrect(correctWordIds.includes(selectedAnswer || -1));
      setCorrectAnswers(correctWordIds);
    }
    setIsVerified(true);
  };

  const handleNextStep = () => {
    if (etapaAtual?.stepType === "Text" || isCorrect) {
      setCurrentStep(currentStep + 1);
      setSelectedAnswer(null);
      setIsVerified(false);
      setIsCorrect(null);
      setCorrectAnswers([]);
    } else {
      setSelectedAnswer(null);
      setIsVerified(false);
      setIsCorrect(null);
      setCorrectAnswers([]);
    }
  };

  return (
    <div className="flex items-center justify-center p-4 w-1/2">
      <div className="w-full text-white h-full">
        <div className="h-[10%]">
          <div className="flex items-end justify-between">
            <span className="text-md">
              {isLoading
                ? "Carregando..."
                : !isCompleted
                ? `Etapa ${currentStep} (${currentStep} de ${classSteps?.length || 0}) `
                : "Etapas concluídas!"}
            </span>
            <div className="flex flex-col items-end">
              <span className="text-sm">
                {courseName || "..."} {moduleInfo ? `| Módulo ${moduleInfo.order}` : ""}
              </span>
              <span className="text-sm">Aula {classInfo?.order}</span>
            </div>
          </div>
          <Progress value={progressValue} className="mt-3 h-2 bg-zinc-700" indicatorColor="bg-green-500" />
        </div>

        <div className="h-[80%] flex items-center justify-center">
          {isLoading ? (
            <div className="text-center">
              <div className="text-xl mb-4">Carregando conteúdo da aula...</div>
              <div className="animate-pulse">Aguarde um momento</div>
            </div>
          ) : showCourseCompletion ? (
            <CursoConcluido />
          ) : showModuleCompletion ? (
            <ModuloConcluido />
          ) : isCompleted ? (
            <AulaConcluida />
          ) : etapaAtual?.stepType === "Text" ? (
            <EtapaTexto content={(etapaAtual as TextStep).content || ""} />
          ) : etapaAtual?.stepType === "MultipleChoice" ? (
            <EtapaPerguntaMultiplaEscolha
              pergunta={{
                enunciado: (etapaAtual as MultipleChoiceStep).question?.statement || "",
                opcoes:
                  (etapaAtual as MultipleChoiceStep).question?.options.map((opt) => ({
                    id: opt.id,
                    resposta: opt.answer,
                  })) || [],
                idOpcaoCorreta: (etapaAtual as MultipleChoiceStep).question?.correctOptionId || 0,
              }}
              isVerified={isVerified}
              onSelect={setSelectedAnswer}
            />
          ) : etapaAtual?.stepType === "DragAndDrop" ? (
            <EtapaPerguntaArraste
              pergunta={{
                enunciado: (etapaAtual as DragAndDropStep).question?.statement || "",
                palavras:
                  (etapaAtual as DragAndDropStep).question?.words.map((word) => ({
                    id: word.id,
                    palavra: word.word,
                  })) || [],
                idsPalavrasCorretas: (etapaAtual as DragAndDropStep).question?.correctWordIds || [],
              }}
              isVerified={isVerified}
              onSelect={setSelectedAnswer}
            />
          ) : (
            ""
          )}
        </div>

        <div className="flex justify-around border-t border-zinc-700 h-[10%] items-center">
          <Button
            variant="outline"
            className="text-white border-zinc-700 hover:bg-zinc-700"
            onClick={() => (currentStep === 1 ? handleExitAula() : setCurrentStep(Math.max(1, currentStep - 1)))}
            disabled={isLoading}
          >
            {currentStep === 1 ? "Sair" : "Anterior"}
          </Button>

          {isLoading ? (
            <Button className="bg-slate-600 hover:bg-slate-700" disabled>
              Carregando...
            </Button>
          ) : showCourseCompletion ? (
            <Button className="bg-green-600 hover:bg-green-700" onClick={handleExitAula}>
              Voltar para Cursos
            </Button>
          ) : showModuleCompletion ? (
            <Button className="bg-green-600 hover:bg-green-700" onClick={handleExitAula}>
              Voltar a Página de Curso
            </Button>
          ) : isCompleted ? (
            <Button className="bg-green-600 hover:bg-green-700" onClick={handleClassCompletion}>
              {isLastActiveClass ? "Concluir Módulo" : "Finalizar"}
            </Button>
          ) : etapaAtual?.stepType !== "Text" && !isVerified ? (
            <Button
              className="bg-slate-600 hover:bg-slate-700"
              onClick={handleVerification}
              disabled={selectedAnswer === null || selectedAnswer < 0}
            >
              Verificar
            </Button>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <Button
                className={`${
                  etapaAtual?.stepType === "Text"
                    ? "bg-cyan-500 hover:bg-cyan-600"
                    : isCorrect
                    ? "bg-cyan-500 hover:bg-cyan-600"
                    : "bg-red-600 hover:bg-red-700"
                }`}
                onClick={handleNextStep}
              >
                {etapaAtual?.stepType === "Text" ? "Próximo" : isCorrect ? "Próximo" : "Tentar Novamente"}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
