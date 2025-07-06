"use client";

import { useParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Class, CourseWithModules, DragAndDropStep, Module, MultipleChoiceStep, Step, TextStep } from "@/types/types";
import { useEffect, useState } from "react";
import { message, Modal } from "antd";
import { SettingFilled } from "@ant-design/icons";
import Skeleton from "@ant-design/pro-skeleton";
import {
  createClass,
  createStep,
  getClassesFromModule,
  getCourseWithModulesByDocId,
  getStepInformations,
  getStepsFromClass,
  postModule,
  updateClassInformations,
  updateCourseInformations,
  updateModuleClassesOrder,
  updateModuleInformations,
  updateModulesOrder,
  updateStepInformations,
} from "@/lib/firebase/courses";
import { cn, generateShortId } from "@/lib/utils";
import type { ProColumns } from "@ant-design/pro-components";
import { DragSortTable } from "@ant-design/pro-components";
import { ArrowUpDown, Check, ChevronsUpDown, Plus, X } from "lucide-react";
import { Switch } from "@/components/ui/switch";

import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const editCourseFormSchema = z.object({
  courseName: z.string().min(2, {
    message: "O nome do curso deve ter pelo menos 2 caracteres.",
  }),
  description: z.string().min(10, {
    message: "A descrição deve ter pelo menos 10 caracteres.",
  }),
  isActive: z.boolean(),
});
type EditCourseFormValues = z.infer<typeof editCourseFormSchema>;

const createModuleFormSchema = z.object({
  moduleName: z.string().min(2, {
    message: "O nome do módulo deve ter pelo menos 2 caracteres.",
  }),
  moduleDescription: z.string().min(10, {
    message: "A descrição deve ter pelo menos 10 caracteres.",
  }),
});
type CreateModuleFormValues = z.infer<typeof createModuleFormSchema>;

const editModuleFormSchema = z.object({
  moduleName: z.string().min(2, {
    message: "O nome do módulo deve ter pelo menos 2 caracteres.",
  }),
  moduleDescription: z.string().min(10, {
    message: "A descrição deve ter pelo menos 10 caracteres.",
  }),
  isActive: z.boolean(),
});
type EditModuleFormValues = z.infer<typeof editModuleFormSchema>;

const createClassFormSchema = z.object({
  className: z.string().min(2, {
    message: "O nome da aula deve ter pelo menos 2 caracteres.",
  }),
  classDescription: z.string().min(10, {
    message: "A descrição deve ter pelo menos 10 caracteres.",
  }),
});
type CreateClassFormValues = z.infer<typeof createClassFormSchema>;

const editClassFormSchema = z.object({
  className: z.string().min(2, {
    message: "O nome da aula deve ter pelo menos 2 caracteres.",
  }),
  classDescription: z.string().min(10, {
    message: "A descrição deve ter pelo menos 10 caracteres.",
  }),
  isActive: z.boolean(),
});
type EditClassFormValues = z.infer<typeof editClassFormSchema>;

const baseStepSchema = z.object({
  stepName: z.string().min(2, {
    message: "O nome do passo deve ter pelo menos 2 caracteres.",
  }),
  stepType: z.enum(["Text", "MultipleChoice", "DragAndDrop"]),
  isActive: z.boolean().optional(),
});
const textStepSchema = baseStepSchema.extend({
  stepType: z.literal("Text"),
  content: z.string().min(1, {
    message: "O conteúdo da etapa não pode estar vazio.",
  }),
});
const multipleChoiceStepSchema = baseStepSchema.extend({
  stepType: z.literal("MultipleChoice"),
  question: z.object({
    statement: z.string().min(1, {
      message: "A declaração da pergunta não pode estar vazia.",
    }),
    options: z
      .array(
        z.object({
          id: z.number(),
          answer: z.string().min(1, {
            message: "A resposta não pode estar vazia.",
          }),
        })
      )
      .min(1, {
        message: "A pergunta deve ter pelo menos 1 opção.",
      }),
    correctOptionId: z.number({
      message: "O ID da opção correta deve ser um número válido.",
    }),
  }),
  isVerified: z.boolean().optional(),
});
const dragAndDropStepSchema = baseStepSchema.extend({
  stepType: z.literal("DragAndDrop"),
  question: z.object({
    statement: z.string().min(1, {
      message: "A declaração da pergunta não pode estar vazia.",
    }),
    words: z
      .array(
        z.object({
          id: z.number(),
          word: z.string().min(1, {
            message: "A palavra não pode estar vazia.",
          }),
        })
      )
      .min(1, {
        message: "A pergunta deve ter pelo menos uma palavra.",
      }),
    correctWordIds: z.array(z.number()).min(1, {
      message: "Deve haver pelo menos um ID de palavra correta.",
    }),
  }),
  isVerified: z.boolean().optional(),
});
const createStepFormSchema = z.discriminatedUnion("stepType", [
  textStepSchema,
  multipleChoiceStepSchema,
  dragAndDropStepSchema,
]);
type CreateStepFormValues = z.infer<typeof createStepFormSchema>;

const editStepFormSchema = z.discriminatedUnion("stepType", [
  textStepSchema,
  multipleChoiceStepSchema,
  dragAndDropStepSchema,
]);
type EditStepFormValues = z.infer<typeof editStepFormSchema>;

export default function courseEdit() {
  //  --------------------- Array/data states

  const [editingCourse, setEditingCourse] = useState<CourseWithModules | null>(null);
  const [editingCourseModules, setEditingCourseModules] = useState<Module[]>([]);
  const [editingModule, setEditingModule] = useState<Module | null>(null);
  const [editingModuleClasses, setEditingModuleClasses] = useState<Class[]>([]);
  const [editingClass, setEditingClass] = useState<Class | null>(null);
  const [editingClassSteps, setEditingClassSteps] = useState<Step[]>([]);
  const [editingStep, setEditingStep] = useState<Step | null>(null);

  //  --------------------- Request states

  // - Course
  const [isEditingCourse, setIsEditingCourse] = useState(false);
  // - Module
  const [isCreatingModule, setIsCreatingModule] = useState(false);
  const [isEditingModulesOrdering, setIsEditingModulesOrdering] = useState(false);
  const [isEditingModule, setIsEditingModule] = useState(false);
  // - Class
  const [isCreatingClass, setIsCreatingClass] = useState(false);
  const [isEditingModulesClassesOrdering, setIsEditingModulesClassesOrdering] = useState(false);
  const [isEditingClass, setIsEditingClass] = useState(false);
  // - Step
  const [isCreatingStep, setIsCreatingStep] = useState(false);
  const [isEditingStepsOrdering, setIsEditingStepsOrdering] = useState(false);
  const [isEditingStep, setIsEditingStep] = useState(false);

  //  --------------------- Modal opening states

  const [isModalCreateModuleOpen, setIsModalCreateModuleOpen] = useState(false);
  const [isModalEditModuleOpen, setIsModalEditModuleOpen] = useState(false);
  const [isModalCreateClassOpen, setIsModalCreateClassOpen] = useState(false);
  const [isModalEditClassOpen, setIsModalEditClassOpen] = useState(false);
  const [isModalCreateStepOpen, setIsModalCreateStepOpen] = useState(false);
  const [isModalEditStepOpen, setIsModalEditStepOpen] = useState(false);

  //  --------------------- Others

  const [messageApi, contextHolder] = message.useMessage();
  const { slug } = useParams();
  const docId = String(slug);

  //  --------------------- Form

  const editCourseForm = useForm<EditCourseFormValues>({
    resolver: zodResolver(editCourseFormSchema),
  });
  const { isDirty: isEditCourseFormDirty } = editCourseForm.formState;

  const editModuleForm = useForm<EditModuleFormValues>({
    resolver: zodResolver(editModuleFormSchema),
  });
  const { isDirty: isEditModuleFormDirty } = editModuleForm.formState;

  const createModuleForm = useForm<CreateModuleFormValues>({
    resolver: zodResolver(createModuleFormSchema),
    defaultValues: {
      moduleName: "",
      moduleDescription: "",
    },
  });
  const { isDirty: isCreateModuleFormDirty } = createModuleForm.formState;

  const createClassForm = useForm<CreateClassFormValues>({
    resolver: zodResolver(createClassFormSchema),
    defaultValues: {
      className: "",
      classDescription: "",
    },
  });
  const { isDirty: isCreateClassFormDirty } = createClassForm.formState;

  const editClassForm = useForm<EditClassFormValues>({
    resolver: zodResolver(editClassFormSchema),
  });
  const { isDirty: isEditClassFormDirty } = editClassForm.formState;

  const createStepForm = useForm<CreateStepFormValues>({
    resolver: zodResolver(createStepFormSchema),
    defaultValues: {
      stepName: "",
      stepType: undefined,
      content: "",
      question: {
        statement: "",
        options: [{ id: 0, answer: "" }],
        correctOptionId: -1,
        words: [{ id: 0, word: "" }],
        correctWordIds: [],
      },
    },
  });
  const { isDirty: isCreateStepFormDirty } = createStepForm.formState;

  const editStepForm = useForm<EditStepFormValues>({
    resolver: zodResolver(editStepFormSchema),
    defaultValues: {
      stepName: "",
      stepType: undefined,
      content: "",
      question: {
        statement: "",
        options: [{ id: 0, answer: "" }],
        correctOptionId: -1,
        words: [{ id: 0, word: "" }],
        correctWordIds: [],
      },
    },
  });
  const { isDirty: isEditStepFormDirty } = editStepForm.formState;

  //  --------------------- Use Effect | Pegar Informações inicias

  useEffect(() => {
    const gettingCourseInfo = async () => {
      try {
        const courseInfo = await getCourseWithModulesByDocId(docId);

        if (!courseInfo) {
          console.error("Algum erro");
        }

        editCourseForm.setValue("courseName", courseInfo?.courseName || "");
        editCourseForm.setValue("description", courseInfo?.courseDescription || "");

        setEditingCourse(courseInfo);
        setEditingCourseModules(courseInfo?.modules || []);
      } catch (error) {
        console.log(error);
      }
    };

    gettingCourseInfo();
  }, [docId, editCourseForm]);

  //  --------------------- Create Requests

  const handleCreateModule = async ({ moduleName, moduleDescription }: CreateModuleFormValues) => {
    setIsCreatingModule(true);
    messageApi.info("Criando modulo...");

    const newModule = {
      moduleName: moduleName,
      moduleId: generateShortId(),
      moduleDescription: moduleDescription,
      createdAt: new Date().toISOString(),
      isActive: false,
      attachedTo_CourseId: editingCourse?.courseId || "",
      order:
        editingCourseModules && editingCourseModules.length > 0
          ? (Math.max(...editingCourseModules.map((module) => Number(module.order) || 0)) + 1).toString()
          : "1",
    };

    console.log("Criando novo module: ", newModule);

    const moduleId = await postModule(newModule);

    if (moduleId) {
      setEditingCourseModules((prevModules) => {
        const newModules = [...prevModules, { ...newModule, id: moduleId }];
        return newModules;
      });
      messageApi.success("Modulo criado com sucesso.");
    } else {
      messageApi.error("Ocorreu um erro ao criar o Modulo.");
    }

    handleModalCreateModuleOk();
    setIsCreatingModule(false);
  };

  const handleCreateClass = async ({ className, classDescription }: CreateClassFormValues) => {
    setIsCreatingClass(true);
    messageApi.info("Criando aula...");

    const newClass = {
      className: className,
      classId: generateShortId(),
      classDescription: classDescription,
      createdAt: new Date().toISOString(),
      isActive: false,
      attachedTo_ModuleId: editingModule?.moduleId || "",
      order:
        editingModuleClasses && editingModuleClasses.length > 0
          ? (Math.max(...editingModuleClasses.map((classItem) => Number(classItem.order) || 0)) + 1).toString()
          : "1",
    };

    console.log("Criando nova aula: ", newClass);

    const classId = await createClass(newClass);

    if (classId) {
      setEditingModuleClasses((prevClasses) => {
        const newClasses = [...prevClasses, { ...newClass, id: classId }];
        return newClasses;
      });
      messageApi.success("Aula criada com sucesso.");
    } else {
      messageApi.error("Ocorreu um erro ao criar a aula.");
    }

    handleModalCreateClassOk();
    setIsCreatingClass(false);
  };

  const handleCreateStep = async ({ stepName, stepType }: CreateStepFormValues) => {
    setIsCreatingStep(true);
    messageApi.info("Criando etapa...");

    let stepData: any = {
      stepName: stepName,
      stepId: generateShortId(),
      stepType: stepType,
      createdAt: new Date().toISOString(),
      isActive: false,
      attachedTo_ClassId: editingClass?.classId || "",
      order:
        editingClassSteps && editingClassSteps.length > 0
          ? (Math.max(...editingClassSteps.map((stepItem) => Number(stepItem.order) || 0)) + 1).toString()
          : "1",
    };

    if (stepType === "Text") {
      stepData = {
        ...stepData,
        content: createStepForm.getValues("content"),
      };
    } else if (stepType === "MultipleChoice") {
      const options = createStepForm.getValues("question.options");
      const correctOptionId = createStepForm.getValues("question.correctOptionId");

      const validOptions = options.filter((option) => option.answer.trim() !== "");

      stepData = {
        ...stepData,
        question: {
          statement: createStepForm.getValues("question.statement"),
          options: validOptions,
          correctOptionId: correctOptionId,
        },
        isVerified: false,
      };
    } else if (stepType === "DragAndDrop") {
      stepData = {
        ...stepData,
        question: {
          statement: createStepForm.getValues("question.statement"),
          words: createStepForm.getValues("question.words"),
          correctWordIds: createStepForm.getValues("question.correctWordIds"),
        },
        isVerified: false,
      };
    }

    console.log("Criando nova etapa: ", stepData);
    const stepId = await createStep(stepData);
    if (stepId) {
      setEditingClassSteps((prevSteps) => {
        const newSteps = [...prevSteps, { ...stepData, id: stepId }];
        return newSteps;
      });
      messageApi.success("Etapa criada com sucesso.");
    } else {
      messageApi.error("Ocorreu um erro ao criar a etapa.");
    }
    handleModalCreateStepOk();
    setIsCreatingStep(false);
  };

  //  --------------------- Edit Requests

  const handleEditCourseRequest = async () => {
    setIsEditingCourse(true);
    if (editingCourse) {
      const previousInfo = { ...editingCourse };

      const updatedCourse = {
        ...editingCourse,
        courseName: editCourseForm.getValues("courseName"),
        courseDescription: editCourseForm.getValues("description"),
      };

      console.log("Atualizando curso: ", updatedCourse);
      messageApi.info("Atualizando informações do curso...");

      setEditingCourse(updatedCourse);

      try {
        const isUpdated = await updateCourseInformations(editingCourse.id, updatedCourse);

        if (isUpdated) {
          messageApi.success("Curso editado com sucesso.");
        } else {
          throw new Error("Erro ao atualizar o curso");
        }

        editCourseForm.reset({
          courseName: updatedCourse.courseName,
          description: updatedCourse.courseDescription,
        });

        setIsEditingCourse(false);
      } catch (error) {
        console.error(error);
        setEditingCourse(previousInfo);
        messageApi.error("Ocorreu um erro ao editar o curso.");
      }
    }
    setIsEditingCourse(false);
  };

  const handleEditModuleRequest = async () => {
    setIsEditingModule(true);

    if (editingModule) {
      const previousInfo = { ...editingModule };

      const updatedModule = {
        ...editingModule,
        moduleName: editModuleForm.getValues("moduleName"),
        moduleDescription: editModuleForm.getValues("moduleDescription"),
        isActive: editModuleForm.getValues("isActive"),
      };

      console.log("Atualizando modulo: ", updatedModule);
      messageApi.info("Atualizando informações do modulo...");

      setEditingModule(updatedModule);

      try {
        const isUpdated = await updateModuleInformations(editingModule.id, updatedModule);

        if (isUpdated) {
          setEditingCourseModules((prevModules) =>
            prevModules.map((module) => (module.id === editingModule.id ? updatedModule : module))
          );
          messageApi.success("Módulo editado com sucesso.");
        } else {
          throw new Error("Erro ao atualizar o módulo");
        }

        setIsEditingModule(false);
      } catch (error) {
        console.error(error);
        setEditingModule(previousInfo);
        messageApi.error("Ocorreu um erro ao editar o modulo.");
      }
    }
    setIsEditingModule(false);
  };

  const handleEditClassRequest = async () => {
    setIsEditingClass(true);

    if (editingClass) {
      const previousClassInfo = { ...editingClass };

      const updatedClass = {
        ...editingClass,
        className: editClassForm.getValues("className"),
        classDescription: editClassForm.getValues("classDescription"),
        isActive: editClassForm.getValues("isActive"),
      };

      console.log("Atualizando aula: ", updatedClass);
      messageApi.info("Atualizando informações da aula...");

      setEditingClass(updatedClass);

      try {
        const isUpdated = await updateClassInformations(editingClass.id, updatedClass);

        if (isUpdated) {
          setEditingModuleClasses((prevClasses) =>
            prevClasses.map((classItem) => (classItem.id === editingClass.id ? updatedClass : classItem))
          );
          messageApi.success("Aula editada com sucesso.");
        } else {
          throw new Error("Erro ao atualizar a aula");
        }

        setIsEditingClass(false);
      } catch (error) {
        console.error(error);
        setEditingClass(previousClassInfo);
        messageApi.error("Ocorreu um erro ao editar a aula.");
      }
    }
    setIsEditingClass(false);
  };

  const handleEditStepRequest = async () => {
    setIsEditingStep(true);

    if (editingStep) {
      const previousStepInfo = { ...editingStep };

      let updatedStep: Step = {
        ...editingStep,
        stepName: editStepForm.getValues("stepName"),
        stepType: editStepForm.getValues("stepType"),
        isActive: editStepForm.getValues("isActive"),
      } as Step;

      if (updatedStep.stepType === "Text") {
        updatedStep = {
          ...updatedStep,
          content: editStepForm.getValues("content"),
        } as TextStep;
      } else if (updatedStep.stepType === "MultipleChoice") {
        updatedStep = {
          ...updatedStep,
          question: {
            statement: editStepForm.getValues("question.statement"),
            options: editStepForm.getValues("question.options"),
            correctOptionId: editStepForm.getValues("question.correctOptionId"),
          },
          isVerified: false,
        } as MultipleChoiceStep;

        const { onSelect, ...stepWithoutFunction } = updatedStep as MultipleChoiceStep;
        updatedStep = stepWithoutFunction as Step;
      } else if (updatedStep.stepType === "DragAndDrop") {
        updatedStep = {
          ...updatedStep,
          question: {
            statement: editStepForm.getValues("question.statement"),
            words: editStepForm.getValues("question.words"),
            correctWordIds: editStepForm.getValues("question.correctWordIds"),
          },
          isVerified: false,
        } as DragAndDropStep;

        const { onSelect, ...stepWithoutFunction } = updatedStep as DragAndDropStep;
        updatedStep = stepWithoutFunction as Step;
      }

      console.log("Atualizando etapa: ", updatedStep);
      messageApi.info("Atualizando informações da etapa...");

      setEditingStep(updatedStep);

      try {
        const isUpdated = await updateStepInformations(editingStep.id, updatedStep);

        if (isUpdated) {
          setEditingClassSteps((prevSteps) =>
            prevSteps.map((step) => (step.id === editingStep.id ? updatedStep : step))
          );
          messageApi.success("Etapa editada com sucesso.");
        } else {
          throw new Error("Erro ao atualizar a etapa");
        }

        setIsEditingStep(false);
      } catch (error) {
        console.error(error);
        setEditingStep(previousStepInfo);
        messageApi.error("Ocorreu um erro ao editar a etapa.");
      }
    }
    setIsEditingStep(false);
  };

  //  --------------------- Modal Handlers -- Create Module

  const handleModalCreateModuleOk = () => {
    setIsModalCreateModuleOpen(false);
  };

  const handleModalCreateModuleCancel = () => {
    if (!isCreatingModule) {
      setIsModalCreateModuleOpen(false);
      createModuleForm.reset();
    }
  };

  //  --------------------- Modal Handlers -- Edit Module

  const handleModalEditModuleOpen = async (module: Module) => {
    setEditingModule(module);

    try {
      const moduleClasses = await getClassesFromModule(module?.moduleId);
      setEditingModuleClasses(moduleClasses || []);
    } catch (error) {
      console.error(error);
    }

    setIsModalEditModuleOpen(true);

    editModuleForm.setValue("moduleName", module.moduleName);
    editModuleForm.setValue("moduleDescription", module.moduleDescription);
    editModuleForm.setValue("isActive", module.isActive);
  };

  const handleModalEditModuleCancel = () => {
    if (!isEditingModule) {
      setIsModalEditModuleOpen(false);
    }
  };

  //  --------------------- Modal Handlers -- Create Class

  const handleModalCreateClassOk = () => {
    setIsModalCreateClassOpen(false);
  };

  const handleModalCreateClassCancel = () => {
    if (!isCreatingClass) {
      setIsModalCreateClassOpen(false);
      createClassForm.reset();
    }
  };

  //  --------------------- Modal Handlers -- Edit Class

  const handleModalEditClassOpen = async (_class: Class) => {
    setEditingClass(_class);

    try {
      const classSteps = await getStepsFromClass(_class?.classId);
      setEditingClassSteps(classSteps || []);
    } catch (error) {
      console.error(error);
    }

    setIsModalEditClassOpen(true);

    editClassForm.setValue("className", _class.className);
    editClassForm.setValue("classDescription", _class.classDescription);
    editClassForm.setValue("isActive", _class.isActive);
  };

  const handleModalEditClassCancel = () => {
    if (!isEditingClass) {
      setIsModalEditClassOpen(false);
      editClassForm.reset();
    }
  };

  //  --------------------- Modal Handlers -- Create Step

  const handleModalCreateStepOk = () => {
    setIsModalCreateStepOpen(false);
  };

  const handleModalCreateStepCancel = () => {
    if (!isCreatingStep) {
      setIsModalCreateStepOpen(false);
      createStepForm.reset({
        stepName: "",
        stepType: undefined,
        content: "",
        isActive: false,
        question: {
          statement: "",
          options: [],
          correctOptionId: -1,
          words: [],
          correctWordIds: [],
        },
      });
    }
  };

  //  --------------------- Modal Handlers -- Edit Step

  const handleModalEditStepOpen = async (step: any) => {
    setEditingStep(step);

    try {
      const stepInfo = await getStepInformations(step.id);

      if (stepInfo) {
        setEditingStep(stepInfo);

        editStepForm.setValue("stepType", stepInfo.stepType);
        editStepForm.setValue("stepName", stepInfo.stepName);
        editStepForm.setValue("isActive", stepInfo.isActive);

        if (stepInfo.stepType === "Text") {
          editStepForm.setValue("content", stepInfo.content || "");
        } else if (stepInfo.stepType === "MultipleChoice") {
          editStepForm.setValue("question.statement", stepInfo.question?.statement || "");
          editStepForm.setValue("question.options", stepInfo.question?.options || [{ id: 0, answer: "" }]);
          editStepForm.setValue("question.correctOptionId", stepInfo.question?.correctOptionId || -1);
        } else if (stepInfo.stepType === "DragAndDrop") {
          editStepForm.setValue("question.statement", stepInfo.question?.statement || "");
          editStepForm.setValue("question.words", stepInfo.question?.words || [{ id: 0, word: "" }]);
          editStepForm.setValue("question.correctWordIds", stepInfo.question?.correctWordIds || []);
        }
      }
    } catch (error) {
      console.error(error);
    }

    setIsModalEditStepOpen(true);
  };

  const handleModalEditStepCancel = () => {
    if (!isEditingStep) {
      setIsModalEditStepOpen(false);
      editStepForm.reset();
    }
  };

  //  --------------------- Table columns

  const columnsModulesTable: ProColumns<Module>[] = [
    {
      title: <ArrowUpDown size={15} />,
      dataIndex: "sort",
      width: 5,
      className: "drag-visible",
    },
    {
      title: "Ordem",
      dataIndex: "order",
      width: "10%",
      align: "center",
      className: "font-bold",
    },
    {
      title: "ID do Modulo",
      dataIndex: "moduleId",
      width: "25%",
      align: "center",
    },
    {
      title: "Nome do Modulo",
      dataIndex: "moduleName",
      key: "moduleName",
      width: "30%",
    },
    {
      title: "Status",
      dataIndex: "isActive",
      key: "isActive",
      width: "20%",
      align: "center",
      render: (_, record) => <span> {record.isActive ? "✅ Ativo" : "❌ Inativo"}</span>,
    },
    {
      title: "Ações",
      key: "actions",
      width: "10%",
      align: "center",
      render: (_, record) => (
        <div className="cursor-pointer flex justify-center" onClick={() => handleModalEditModuleOpen(record)}>
          <SettingFilled className="text-gray-600 hover:text-blue-500 text-[16px] hover:scale-125 hover:shadow-lg transition-all" />
        </div>
      ),
    },
  ];

  const columnsModulesClassesTable: ProColumns<Class>[] = [
    {
      title: <ArrowUpDown size={15} />,
      dataIndex: "sort",
      width: 5,
      className: "drag-visible",
    },
    {
      title: "Ordem",
      dataIndex: "order",
      width: "10%",
      align: "center",
      className: "font-bold",
    },
    {
      title: "ID da Aula",
      dataIndex: "classId",
      width: "25%",
      align: "center",
    },
    {
      title: "Nome da Aula",
      dataIndex: "className",
      key: "className",
      width: "30%",
    },
    {
      title: "Status",
      dataIndex: "isActive",
      key: "isActive",
      width: "20%",
      align: "center",
      render: (_, record) => <span> {record.isActive ? "✅ Ativo" : "❌ Inativo"}</span>,
    },
    {
      title: "Ações",
      key: "actions",
      width: "10%",
      align: "center",
      render: (_, record) => (
        <div className="cursor-pointer flex justify-center" onClick={() => handleModalEditClassOpen(record)}>
          <SettingFilled className="text-gray-600 hover:text-blue-500 text-[16px] hover:scale-125 hover:shadow-lg transition-all" />
        </div>
      ),
    },
  ];

  const columnsClassesSteps: ProColumns<Step>[] = [
    {
      title: <ArrowUpDown size={15} />,
      dataIndex: "sort",
      width: 5,
      className: "drag-visible",
    },
    {
      title: "Ordem",
      dataIndex: "order",
      width: "10%",
      align: "center",
      className: "font-bold",
    },
    {
      title: "Nome da Etapa",
      dataIndex: "stepName",
      key: "stepName",
      width: "30%",
    },
    {
      title: "Tipo da Etapa",
      dataIndex: "stepType",
      key: "stepType",
      width: "30%",
    },
    {
      title: "Status",
      dataIndex: "isActive",
      key: "isActive",
      width: "20%",
      align: "center",
      render: (_, record) => <span> {record.isActive ? "✅ Ativo" : "❌ Inativo"}</span>,
    },
    {
      title: "Ações",
      key: "actions",
      width: "10%",
      align: "center",
      render: (_, record) => (
        <div className="cursor-pointer flex justify-center" onClick={() => handleModalEditStepOpen(record)}>
          <SettingFilled className="text-gray-600 hover:text-blue-500 text-[16px] hover:scale-125 hover:shadow-lg transition-all" />
        </div>
      ),
    },
  ];

  //  --------------------- ProComponents TableDrag Handlers

  const handleDragEndSortModulesOrder = async (beforeIndex: number, afterIndex: number, newDataSource: Module[]) => {
    const previousModules = [...editingCourseModules];

    console.log("Movendo itens: ", newDataSource);
    messageApi.info("Movendo módulo de ordem, aguarde!");
    setIsEditingModulesOrdering(true);

    const updatedModules = newDataSource.map((item, index) => ({
      ...item,
      order: (index + 1).toString(),
    }));

    setEditingCourseModules(updatedModules);

    const success = await updateModulesOrder(updatedModules);

    if (success) {
      messageApi.success("Módulo movido de ordem com sucesso!");
    } else {
      setEditingCourseModules(previousModules);
      messageApi.error("Erro com o servidor ao mover ordem do módulo!");
    }

    setIsEditingModulesOrdering(false);
  };

  const handleDragEndSortClassesOrder = async (beforeIndex: number, afterIndex: number, newDataSource: Class[]) => {
    const previousModuleClasses = [...editingModuleClasses];

    console.log("Movendo itens: ", newDataSource);
    messageApi.info("Movendo aula de ordem, aguarde!");
    setIsEditingModulesClassesOrdering(true);

    const updatedModuleClasses = newDataSource.map((item, index) => ({
      ...item,
      order: (index + 1).toString(),
    }));

    setEditingModuleClasses(updatedModuleClasses);

    const success = await updateModuleClassesOrder(updatedModuleClasses);

    if (success) {
      messageApi.success("Aula movida de ordem com sucesso!");
    } else {
      setEditingModuleClasses(previousModuleClasses);
      messageApi.error("Erro com o servidor ao mover ordem das aulas!");
    }

    setIsEditingModulesClassesOrdering(false);
  };

  const handleDragEndSortStepsOrder = async (beforeIndex: number, afterIndex: number, newDataSource: Step[]) => {};

  const stepTypes = [
    { label: "Texto", value: "Text" },
    { label: "Multipla Escolha", value: "MultipleChoice" },
    { label: "Pergunta Arraste e Solte", value: "DragAndDrop" },
  ] as const;

  return (
    <div className="w-[90%] h-full">
      {contextHolder}
      <div className="flex flex-col items-center mb-4">
        {editingCourse ? (
          <>
            <span className="text-3xl text-zinc-200">Gerenciamento de Curso</span>

            <Form {...editCourseForm}>
              <form
                onSubmit={editCourseForm.handleSubmit(handleEditCourseRequest)}
                className="w-3/5 space-y-4 mt-4 rounded-lg"
              >
                <FormField
                  control={editCourseForm.control}
                  name="courseName"
                  render={({ field }) => (
                    <FormItem className="">
                      <FormLabel className="text-base flex justify-between">
                        <span>Nome do Curso</span>
                        <span>ID: {editingCourse.courseId}</span>
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Digite o nome do curso" {...field} className="text-zinc-950" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={editCourseForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base">Descrição</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Digite a descrição do curso"
                          className="min-h-[100px] text-zinc-950"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex flex-row justify-end gap-4 items-center">
                  <Button
                    type="button"
                    variant="secondary"
                    disabled={isEditingCourse || !isEditCourseFormDirty}
                    onClick={() => {
                      editCourseForm.reset({
                        courseName: editingCourse.courseName || "",
                        description: editingCourse.courseDescription || "",
                      });
                    }}
                    className="w-auto"
                  >
                    Cancelar
                  </Button>

                  <Button
                    type="submit"
                    loading={isEditingCourse}
                    loadingText="Salvando..."
                    disabled={!isEditCourseFormDirty || isEditingCourse}
                    className="w-auto"
                  >
                    Salvar
                  </Button>
                </div>
              </form>
            </Form>

            <div className="w-3/5 space-y-4 mt-6 rounded-lg">
              <span className="text-base font-medium">Modulos</span>

              <div className="flex flex-col gap-4 bg-white rounded-lg px-2 pt-2 pb-4">
                <div className="flex justify-between items-center mb-[-15px] z-10">
                  <span className="text-zinc-600 ml-2 mt-1 leading-3">
                    Gerencie a ordem e informações dos módulos do curso
                  </span>

                  <Button
                    className="flex items-center justify-center gap-1 bg-green-500 hover:bg-green-600 cursor-pointer transition-all duration-300"
                    onClick={() => setIsModalCreateModuleOpen(true)}
                  >
                    <Plus size={15} className="mb-1" />
                    Adicionar módulo
                  </Button>
                </div>

                <DragSortTable
                  columns={columnsModulesTable}
                  rowKey="id"
                  search={false}
                  pagination={false}
                  dragSortKey="sort"
                  dataSource={editingCourseModules || []}
                  onDragSortEnd={handleDragEndSortModulesOrder}
                  toolBarRender={false}
                  rowClassName={() => "rowClassName1"}
                  bordered
                  loading={isEditingModulesOrdering}
                  locale={{ emptyText: "Não há módulos para este curso." }}
                />
              </div>
            </div>
          </>
        ) : (
          <div className="space-y-2">
            <Skeleton type="list" />
          </div>
        )}
      </div>

      {/* Modal - Criar módulo */}
      <Modal
        title="Crie um modulo para o curso"
        open={isModalCreateModuleOpen}
        onCancel={() => setIsModalCreateModuleOpen(false)}
        footer={null}
      >
        <Form {...createModuleForm}>
          <form
            onSubmit={createModuleForm.handleSubmit(handleCreateModule)}
            className="space-y-4 mt-4 p-4 bg-zinc-800 rounded-lg"
          >
            <FormField
              control={createModuleForm.control}
              name="moduleName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Nome do Modulo</FormLabel>
                  <FormControl>
                    <Input placeholder="Digite o nome do modulo" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={createModuleForm.control}
              name="moduleDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Descrição</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Digite a descrição do modulo" className="min-h-[100px]" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="secondary"
                onClick={handleModalCreateModuleCancel}
                disabled={isCreatingModule}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                loading={isCreatingModule}
                loadingText="Criando..."
                disabled={isCreatingModule || !isCreateModuleFormDirty}
              >
                Criar Modulo
              </Button>
            </div>
          </form>
        </Form>
      </Modal>

      {/* Modal - Editar módulo */}
      <Modal
        title="Edição de informações e aulas do módulo"
        open={isModalEditModuleOpen}
        onCancel={handleModalEditModuleCancel}
        closable={true}
        footer={null}
        width="70%"
        maskClosable={false}
      >
        <div className="mt-4 p-4 bg-zinc-800 rounded-lg text-zinc-300">
          <Form {...editModuleForm}>
            <form onSubmit={editModuleForm.handleSubmit(handleEditModuleRequest)} className="flex flex-col gap-4">
              <FormField
                control={editModuleForm.control}
                name="moduleName"
                render={({ field }) => (
                  <FormItem className="">
                    <FormLabel className="text-base flex justify-between">
                      <span>Nome do Módulo</span>
                      <span>ID: {editingModule?.moduleId}</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Digite o nome do módulo" {...field} className="text-zinc-950" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editModuleForm.control}
                name="moduleDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base">Descrição</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Digite a descrição do modulo"
                        className="min-h-[100px] text-zinc-950"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editModuleForm.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex gap-2 items-end">
                    <FormLabel className="text-base">Status: </FormLabel>
                    <FormControl>
                      <div className="flex gap-2 items-end">
                        <Switch
                          checked={field.value}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              field.onChange(true);
                            } else {
                              field.onChange(false);
                            }
                          }}
                          checkedIcon={<Check size={12} color="green" className="ml-1 mt-1" />}
                          uncheckedIcon={<X size={12} color="gray" className="ml-1 mt-1" />}
                          className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-zinc-700"
                        />
                        <span> {field.value ? "✅ Ativo" : "❌ Inativo"}</span>
                      </div>
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className="flex flex-row justify-end gap-4 items-center">
                <Button
                  type="button"
                  variant="secondary"
                  disabled={isEditingModule || !isEditModuleFormDirty}
                  onClick={() => {
                    editModuleForm.reset({
                      moduleName: editingModule?.moduleName || "",
                      moduleDescription: editingModule?.moduleDescription || "",
                      isActive: editingModule?.isActive || false,
                    });
                    setIsModalEditModuleOpen(false);
                  }}
                  className="w-auto"
                >
                  Cancelar
                </Button>

                <Button
                  type="submit"
                  loading={isEditingModule}
                  loadingText="Salvando..."
                  disabled={!isEditModuleFormDirty || isEditingModule}
                  className="w-auto"
                >
                  Salvar
                </Button>
              </div>
            </form>
          </Form>

          <div className="mt-6 rounded-lg gap-4">
            <span className="text-base font-medium">Aulas</span>

            <div className="flex flex-col gap-4 bg-white rounded-lg px-2 pt-2 pb-4">
              <div className="flex justify-between items-center mb-[-15px] z-10">
                <span className="text-zinc-600 ml-2 mt-1 leading-3">
                  Gerencie a ordem e informações das aulas do módulo
                </span>

                <Button
                  className="flex items-center justify-center gap-1 bg-green-500 hover:bg-green-600 cursor-pointer transition-all duration-300"
                  onClick={() => setIsModalCreateClassOpen(true)}
                >
                  <Plus size={15} className="mb-1" />
                  Adicionar aula
                </Button>
              </div>

              <DragSortTable
                columns={columnsModulesClassesTable}
                rowKey="id"
                search={false}
                pagination={false}
                dragSortKey="sort"
                dataSource={editingModuleClasses || []}
                onDragSortEnd={handleDragEndSortClassesOrder}
                toolBarRender={false}
                rowClassName={() => "rowClassName1"}
                bordered
                loading={isEditingModulesClassesOrdering}
                locale={{ emptyText: "Não há aulas para este módulos." }}
              />
            </div>
          </div>
        </div>
      </Modal>

      {/* Modal - Criar Aula */}
      <Modal
        title="Crie uma aula para o módulo"
        open={isModalCreateClassOpen}
        onCancel={() => setIsModalCreateClassOpen(false)}
        footer={null}
      >
        <Form {...createClassForm}>
          <form
            onSubmit={createClassForm.handleSubmit(handleCreateClass)}
            className="space-y-4 mt-4 p-4 bg-zinc-800 rounded-lg"
          >
            <FormField
              control={createClassForm.control}
              name="className"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Nome da aula</FormLabel>
                  <FormControl>
                    <Input placeholder="Digite o nome da aula" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={createClassForm.control}
              name="classDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Descrição</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Digite a descrição da aula" className="min-h-[100px]" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="secondary"
                onClick={handleModalCreateClassCancel}
                disabled={isCreatingClass}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                loading={isCreatingClass}
                loadingText="Criando..."
                disabled={isCreatingClass || !isCreateClassFormDirty}
              >
                Criar Aula
              </Button>
            </div>
          </form>
        </Form>
      </Modal>

      {/* Modal - Editar Aula */}
      <Modal
        title="Edição de informações e etapas da aula"
        open={isModalEditClassOpen}
        onCancel={handleModalEditClassCancel}
        closable={true}
        footer={null}
        width="50%"
        maskClosable={false}
      >
        <div className="mt-4 p-4 bg-zinc-800 rounded-lg text-zinc-300">
          <Form {...editClassForm}>
            <form onSubmit={editClassForm.handleSubmit(handleEditClassRequest)} className="flex flex-col gap-4">
              <FormField
                control={editClassForm.control}
                name="className"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base flex justify-between">
                      <span>Nome da Aula</span>
                      <span>ID: {editingClass?.classId}</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Digite o nome do módulo" {...field} className="text-zinc-950" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editClassForm.control}
                name="classDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base">Descrição</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Digite a descrição da aula"
                        className="min-h-[100px] text-zinc-950"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editClassForm.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex gap-2 items-end">
                    <FormLabel className="text-base">Status: </FormLabel>
                    <FormControl>
                      <div className="flex gap-2 items-end">
                        <Switch
                          checked={field.value}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              field.onChange(true);
                            } else {
                              field.onChange(false);
                            }
                          }}
                          checkedIcon={<Check size={12} color="green" className="ml-1 mt-1" />}
                          uncheckedIcon={<X size={12} color="gray" className="ml-1 mt-1" />}
                          className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-zinc-700"
                        />
                        <span> {field.value ? "✅ Ativo" : "❌ Inativo"}</span>
                      </div>
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className="flex flex-row justify-end gap-4 items-center">
                <Button
                  type="button"
                  variant="secondary"
                  disabled={isEditingClass || !isEditClassFormDirty}
                  onClick={() => {
                    editClassForm.reset({
                      className: editingClass?.className || "",
                      classDescription: editingClass?.classDescription || "",
                      isActive: editingClass?.isActive || false,
                    });
                    setIsModalEditClassOpen(false);
                  }}
                  className="w-auto"
                >
                  Cancelar
                </Button>

                <Button
                  type="submit"
                  loading={isEditingClass}
                  loadingText="Salvando..."
                  disabled={!isEditClassFormDirty || isEditingClass}
                  className="w-auto"
                >
                  Salvar
                </Button>
              </div>
            </form>
          </Form>

          <div className="mt-6 rounded-lg gap-4">
            <span className="text-base font-medium">Etapas</span>

            <div className="flex flex-col gap-4 bg-white rounded-lg px-2 pt-2 pb-4">
              <div className="flex justify-between items-center mb-[-15px] z-10">
                <span className="text-zinc-600 ml-2 mt-1 leading-3">
                  Gerencie a ordem e informações das etapas da aula
                </span>

                <Button
                  className="flex items-center justify-center gap-1 bg-green-500 hover:bg-green-600 cursor-pointer transition-all duration-300"
                  onClick={() => setIsModalCreateStepOpen(true)}
                >
                  <Plus size={15} className="mb-1" />
                  Adicionar etapa
                </Button>
              </div>

              <DragSortTable
                columns={columnsClassesSteps}
                rowKey="id"
                search={false}
                pagination={false}
                dragSortKey="sort"
                dataSource={editingClassSteps || []}
                onDragSortEnd={handleDragEndSortStepsOrder}
                toolBarRender={false}
                rowClassName={() => "rowClassName1"}
                bordered
                loading={isEditingStepsOrdering}
                locale={{ emptyText: "Não há etapas para essa aula." }}
              />
            </div>
          </div>
        </div>
      </Modal>

      {/* Modal - Criar Etapa */}
      <Modal
        title="Crie uma etapa para a aula"
        open={isModalCreateStepOpen}
        onCancel={() => setIsModalCreateStepOpen(false)}
        footer={null}
      >
        <Form {...createStepForm}>
          <form
            onSubmit={createStepForm.handleSubmit(handleCreateStep)}
            className="space-y-4 mt-4 p-4 bg-zinc-800 rounded-lg z-50"
          >
            <FormField
              control={createStepForm.control}
              name="stepName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Nome da etapa</FormLabel>
                  <FormControl>
                    <Input placeholder="Digite o nome da etapa" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={createStepForm.control}
              name="stepType"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel className="text-white">Tipo da Etapa</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          className={cn(
                            "w-[250px] justify-between bg-white text-black border-gray-200",
                            !field.value && "text-gray-500"
                          )}
                        >
                          {field.value
                            ? stepTypes.find((type) => type.value === field.value)?.label
                            : "Selecione uma etapa"}
                          <ChevronsUpDown className="opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-[200px] p-0 z-[1050] bg-white">
                      <Command className="text-black">
                        {stepTypes.map((type) => (
                          <CommandItem
                            value={type.label}
                            key={type.value}
                            className={`text-black hover:bg-gray-200 cursor-pointer ${
                              type.value === field.value ? "font-medium" : "font-normal"
                            }`}
                            onSelect={() => {
                              createStepForm.setValue("stepType", type.value);
                            }}
                          >
                            {type.label}
                            <Check
                              className={cn("ml-auto", type.value === field.value ? "opacity-100" : "opacity-0")}
                            />
                          </CommandItem>
                        ))}
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <FormDescription>O formulário mudará para o tipo de etapa da sua escolha.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {createStepForm.watch("stepType") === "Text" && (
              <FormField
                control={createStepForm.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Conteúdo do texto da etapa</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Digite o texto da etapa" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {createStepForm.watch("stepType") === "MultipleChoice" && (
              <>
                <FormField
                  control={createStepForm.control}
                  name="question.statement"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Pergunta</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Digite a pergunta" className="min-h-[100px] text-zinc-950" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <FormLabel className="text-white">Opções de resposta</FormLabel>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const currentOptions = createStepForm.getValues("question.options") || [];
                        const newOption = {
                          id: currentOptions.length,
                          answer: "",
                        };
                        createStepForm.setValue("question.options", [...currentOptions, newOption]);
                      }}
                      className="text-white hover:text-white"
                    >
                      <Plus size={15} className="mr-1" />
                      Adicionar opção
                    </Button>
                  </div>
                  {createStepForm.watch("question.options")?.map((_, index) => (
                    <div key={index} className="flex gap-2 items-center">
                      <FormField
                        control={createStepForm.control}
                        name={`question.options.${index}.answer`}
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormControl>
                              <Input placeholder={`Opção ${index + 1}`} {...field} className="text-zinc-950" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={createStepForm.control}
                        name="question.correctOptionId"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Switch
                                checked={field.value === index}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    field.onChange(index);
                                  } else {
                                    field.onChange(-1);
                                  }
                                }}
                                checkedIcon={<Check size={12} color="green" className="ml-1 mt-1" />}
                                uncheckedIcon={<X size={12} color="gray" className="ml-1 mt-1" />}
                                className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-zinc-700"
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const currentOptions = createStepForm.getValues("question.options") || [];
                          const newOptions = currentOptions.filter((_, i) => i !== index);
                          createStepForm.setValue("question.options", newOptions);

                          if (createStepForm.getValues("question.correctOptionId") === index) {
                            createStepForm.setValue("question.correctOptionId", -1);
                          }
                        }}
                        className="text-red-500 hover:text-red-600"
                      >
                        <X size={15} />
                      </Button>
                    </div>
                  ))}
                </div>
              </>
            )}

            {createStepForm.watch("stepType") === "DragAndDrop" && (
              <>
                <FormField
                  control={createStepForm.control}
                  name="question.statement"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Pergunta</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Digite a pergunta" className="min-h-[100px] text-zinc-950" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <FormLabel className="text-white">Palavras para arrastar</FormLabel>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const currentWords = createStepForm.getValues("question.words") || [];
                        const newWord = {
                          id: currentWords.length,
                          word: "",
                        };
                        createStepForm.setValue("question.words", [...currentWords, newWord]);
                      }}
                      className="text-white hover:text-white"
                    >
                      <Plus size={15} className="mr-1" />
                      Adicionar palavra
                    </Button>
                  </div>
                  {createStepForm.watch("question.words")?.map((_, index) => (
                    <div key={index} className="flex gap-2 items-center">
                      <FormField
                        control={createStepForm.control}
                        name={`question.words.${index}.word`}
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormControl>
                              <Input placeholder={`Palavra ${index + 1}`} {...field} className="text-zinc-950" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={createStepForm.control}
                        name="question.correctWordIds"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Switch
                                checked={field.value?.includes(index)}
                                onCheckedChange={(checked) => {
                                  const currentValue = field.value || [];
                                  if (checked) {
                                    field.onChange([...currentValue, index]);
                                  } else {
                                    field.onChange(currentValue.filter((id: number) => id !== index));
                                  }
                                }}
                                checkedIcon={<Check size={12} color="green" className="ml-1 mt-1" />}
                                uncheckedIcon={<X size={12} color="gray" className="ml-1 mt-1" />}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const currentWords = createStepForm.getValues("question.words") || [];
                          const newWords = currentWords.filter((_, i) => i !== index);
                          createStepForm.setValue("question.words", newWords);

                          const currentCorrectIds = createStepForm.getValues("question.correctWordIds") || [];
                          createStepForm.setValue(
                            "question.correctWordIds",
                            currentCorrectIds.filter((id: number) => id !== index)
                          );
                        }}
                        className="text-red-500 hover:text-red-600"
                      >
                        <X size={15} />
                      </Button>
                    </div>
                  ))}
                </div>
              </>
            )}

            <div className="flex justify-end space-x-4">
              <Button type="button" variant="secondary" onClick={handleModalCreateStepCancel} disabled={isCreatingStep}>
                Cancelar
              </Button>
              <Button
                type="submit"
                loading={isCreatingStep}
                loadingText="Criando..."
                disabled={isCreatingStep || !isCreateStepFormDirty}
              >
                Criar Etapa
              </Button>
            </div>
          </form>
        </Form>
      </Modal>

      {/* Modal - Editar Etapa */}
      <Modal
        title="Editar de informações da Etapa"
        open={isModalEditStepOpen}
        onCancel={handleModalEditStepCancel}
        closable={true}
        footer={null}
        width="50%"
        maskClosable={false}
        className="mt-10"
      >
        <div className="mt-4 p-4 bg-zinc-800 rounded-lg text-zinc-300">
          <Form {...editStepForm}>
            <form onSubmit={editStepForm.handleSubmit(handleEditStepRequest)} className="flex flex-col gap-4">
              <FormField
                control={editStepForm.control}
                name="stepName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base flex justify-between">
                      <span>Nome da Etapa</span>
                      <span>ID: {editingStep?.id}</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Digite o nome da etapa" {...field} className="text-zinc-950" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editStepForm.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex gap-2 items-end">
                    <FormLabel className="text-base">Status: </FormLabel>
                    <FormControl>
                      <div className="flex gap-2 items-end">
                        <Switch
                          checked={field.value}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              field.onChange(true);
                            } else {
                              field.onChange(false);
                            }
                          }}
                          checkedIcon={<Check size={12} color="green" className="ml-1 mt-1" />}
                          uncheckedIcon={<X size={12} color="gray" className="ml-1 mt-1" />}
                          className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-zinc-700"
                        />
                        <span> {field.value ? "✅ Ativo" : "❌ Inativo"}</span>
                      </div>
                    </FormControl>
                  </FormItem>
                )}
              />

              {editStepForm.watch("stepType") === "Text" && (
                <FormField
                  control={editStepForm.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Conteúdo do texto da etapa</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Digite o texto da etapa"
                          className="min-h-[100px] text-zinc-950"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {editStepForm.watch("stepType") === "MultipleChoice" && (
                <>
                  <FormField
                    control={editStepForm.control}
                    name="question.statement"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Pergunta</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Digite a pergunta"
                            className="min-h-[100px] text-zinc-950"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <FormLabel className="text-white">Opções de resposta</FormLabel>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const currentOptions = editStepForm.getValues("question.options") || [];
                          const newOption = {
                            id: currentOptions.length,
                            answer: "",
                          };
                          editStepForm.setValue("question.options", [...currentOptions, newOption]);
                        }}
                        className="text-white hover:text-white"
                      >
                        <Plus size={15} className="mr-1" />
                        Adicionar opção
                      </Button>
                    </div>
                    {editStepForm.watch("question.options")?.map((_, index) => (
                      <div key={index} className="flex gap-2 items-center">
                        <FormField
                          control={editStepForm.control}
                          name={`question.options.${index}.answer`}
                          render={({ field }) => (
                            <FormItem className="flex-1">
                              <FormControl>
                                <Input placeholder={`Opção ${index + 1}`} {...field} className="text-zinc-950" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={editStepForm.control}
                          name="question.correctOptionId"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Switch
                                  checked={field.value === index}
                                  onCheckedChange={(checked) => {
                                    if (checked) {
                                      field.onChange(index);
                                    } else {
                                      field.onChange(-1);
                                    }
                                  }}
                                  checkedIcon={<Check size={12} color="green" className="ml-1 mt-1" />}
                                  uncheckedIcon={<X size={12} color="gray" className="ml-1 mt-1" />}
                                  className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-zinc-700"
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const currentOptions = editStepForm.getValues("question.options") || [];
                            const newOptions = currentOptions.filter((_, i) => i !== index);
                            editStepForm.setValue("question.options", newOptions);

                            if (editStepForm.getValues("question.correctOptionId") === index) {
                              editStepForm.setValue("question.correctOptionId", -1);
                            }
                          }}
                          className="text-red-500 hover:text-red-600"
                        >
                          <X size={15} />
                        </Button>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {editStepForm.watch("stepType") === "DragAndDrop" && (
                <>
                  <FormField
                    control={editStepForm.control}
                    name="question.statement"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Pergunta</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Digite a pergunta"
                            className="min-h-[100px] text-zinc-950"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <FormLabel className="text-white">Palavras para arrastar</FormLabel>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const currentWords = editStepForm.getValues("question.words") || [];
                          const newWord = {
                            id: currentWords.length,
                            word: "",
                          };
                          editStepForm.setValue("question.words", [...currentWords, newWord]);
                        }}
                        className="text-white hover:text-white"
                      >
                        <Plus size={15} className="mr-1" />
                        Adicionar palavra
                      </Button>
                    </div>
                    {editStepForm.watch("question.words")?.map((_, index) => (
                      <div key={index} className="flex gap-2 items-center">
                        <FormField
                          control={editStepForm.control}
                          name={`question.words.${index}.word`}
                          render={({ field }) => (
                            <FormItem className="flex-1">
                              <FormControl>
                                <Input placeholder={`Palavra ${index + 1}`} {...field} className="text-zinc-950" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={editStepForm.control}
                          name="question.correctWordIds"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Switch
                                  checked={field.value?.includes(index)}
                                  onCheckedChange={(checked) => {
                                    const currentValue = field.value || [];
                                    if (checked) {
                                      field.onChange([...currentValue, index]);
                                    } else {
                                      field.onChange(currentValue.filter((id: number) => id !== index));
                                    }
                                  }}
                                  checkedIcon={<Check size={12} color="green" className="ml-1 mt-1" />}
                                  uncheckedIcon={<X size={12} color="gray" className="ml-1 mt-1" />}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const currentWords = editStepForm.getValues("question.words") || [];
                            const newWords = currentWords.filter((_, i) => i !== index);
                            editStepForm.setValue("question.words", newWords);

                            const currentCorrectIds = editStepForm.getValues("question.correctWordIds") || [];
                            editStepForm.setValue(
                              "question.correctWordIds",
                              currentCorrectIds.filter((id: number) => id !== index)
                            );
                          }}
                          className="text-red-500 hover:text-red-600"
                        >
                          <X size={15} />
                        </Button>
                      </div>
                    ))}
                  </div>
                </>
              )}

              <div className="flex flex-row justify-end gap-4 items-center">
                <Button
                  type="button"
                  variant="secondary"
                  disabled={isEditingStep || !isEditStepFormDirty}
                  onClick={() => {
                    if (editingStep?.stepType) {
                      if (editingStep.stepType === "Text") {
                        editStepForm.reset({
                          stepName: editingStep.stepName || "",
                          stepType: "Text",
                          content: (editingStep as TextStep)?.content || "",
                          isActive: editingStep.isActive || false,
                        });
                      } else if (editingStep.stepType === "MultipleChoice") {
                        editStepForm.reset({
                          stepName: editingStep.stepName || "",
                          stepType: "MultipleChoice",
                          isActive: editingStep.isActive || false,
                          question: {
                            statement: (editingStep as MultipleChoiceStep)?.question?.statement || "",
                            options: (editingStep as MultipleChoiceStep)?.question?.options || [{ id: 0, answer: "" }],
                            correctOptionId: (editingStep as MultipleChoiceStep)?.question?.correctOptionId || -1,
                          },
                        });
                      } else if (editingStep.stepType === "DragAndDrop") {
                        editStepForm.reset({
                          stepName: editingStep.stepName || "",
                          stepType: "DragAndDrop",
                          isActive: editingStep.isActive || false,
                          question: {
                            statement: (editingStep as DragAndDropStep)?.question?.statement || "",
                            words: (editingStep as DragAndDropStep)?.question?.words || [{ id: 0, word: "" }],
                            correctWordIds: (editingStep as DragAndDropStep)?.question?.correctWordIds || [],
                          },
                        });
                      }
                    }
                    setIsModalEditStepOpen(false);
                  }}
                  className="w-auto"
                >
                  Cancelar
                </Button>

                <Button
                  type="submit"
                  loading={isEditingStep}
                  loadingText="Salvando..."
                  disabled={!isEditStepFormDirty || isEditingStep}
                  className="w-auto"
                >
                  Salvar
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </Modal>
    </div>
  );
}
