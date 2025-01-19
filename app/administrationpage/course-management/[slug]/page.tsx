"use client";

import { useParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Class, CourseWithModules, Module, Steps } from "@/types/types";
import { useEffect, useState } from "react";
import { message, Modal } from "antd";
import { SettingFilled } from "@ant-design/icons";
import Skeleton from "@ant-design/pro-skeleton";
import {
  createClass,
  getClassesFromModule,
  getCourseWithModulesByDocId,
  postModule,
  updateClassInformations,
  updateCourseInformations,
  updateModuleClassesOrder,
  updateModuleInformations,
  updateModulesOrder,
} from "@/lib/firebase/courses";
import { generateShortId } from "@/lib/utils";
import type { ProColumns } from "@ant-design/pro-components";
import { DragSortTable } from "@ant-design/pro-components";
import { ArrowUpDown, Check, Plus, X } from "lucide-react";
import { Switch } from "@/components/ui/switch";

const editCourseFormSchema = z.object({
  courseName: z.string().min(2, {
    message: "O nome do curso deve ter pelo menos 2 caracteres.",
  }),
  description: z.string().min(10, {
    message: "A descrição deve ter pelo menos 10 caracteres.",
  }),
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

export default function courseEdit() {
  //  Array/data states

  const [editingCourse, setEditingCourse] = useState<CourseWithModules | null>(null);
  const [editingCourseModules, setEditingCourseModules] = useState<Module[]>([]);
  const [editingModule, setEditingModule] = useState<Module | null>(null);
  const [editingModuleClasses, setEditingModuleClasses] = useState<Class[]>([]);
  const [editingClass, setEditingClass] = useState<Class | null>(null);

  //  Request states

  const [isEditingCourse, setIsEditingCourse] = useState(false); //Course
  const [isCreatingModule, setIsCreatingModule] = useState(false); //Module
  const [isEditingModulesOrdering, setIsEditingModulesOrdering] = useState(false);
  const [isEditingModule, setIsEditingModule] = useState(false);
  const [isCreatingClass, setIsCreatingClass] = useState(false); //Class
  const [isEditingModulesClassesOrdering, setIsEditingModulesClassesOrdering] = useState(false);
  const [isEditingClass, setIsEditingClass] = useState(false);

  //  Modal opening states

  const [isModalCreateModuleOpen, setIsModalCreateModuleOpen] = useState(false);
  const [isModalEditModuleOpen, setIsModalEditModuleOpen] = useState(false);
  const [isModalCreateClassOpen, setIsModalCreateClassOpen] = useState(false);
  const [isModalEditClassOpen, setIsModalEditClassOpen] = useState(false);

  // Others

  const [messageApi, contextHolder] = message.useMessage();
  const { slug } = useParams();
  const docId = String(slug);

  // Form

  const editCourseForm = useForm<EditCourseFormValues>({
    resolver: zodResolver(editCourseFormSchema),
    defaultValues: {
      courseName: "",
      description: "",
    },
  });
  const { isDirty: isEditCourseFormDirty } = editCourseForm.formState;

  const editModuleForm = useForm<EditModuleFormValues>({
    resolver: zodResolver(editModuleFormSchema),
    defaultValues: {
      moduleName: "",
      moduleDescription: "",
    },
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
    defaultValues: {
      className: "",
      classDescription: "",
      isActive: false,
    },
  });
  const { isDirty: isEditClassFormDirty } = editClassForm.formState;

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

  // Create Requests

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
      messageApi.success("Ocorreu um erro ao criar a aula.");
    }

    handleModalCreateClassOk();
    setIsCreatingClass(false);
  };

  const handleCreateStep = async () => {};

  // Edit Requests

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
      };

      console.log("Atualizando modulo: ", updatedModule);
      messageApi.info("Atualizando informações do modulo...");

      setEditingModule(updatedModule);

      try {
        const isUpdated = await updateModuleInformations(editingModule.id, updatedModule);

        if (isUpdated) {
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

  //Modal Handlers -- Create Module

  const handleModalCreateModuleOk = () => {
    setIsModalCreateModuleOpen(false);
  };

  const handleModalCreateModuleCancel = () => {
    if (!isCreatingModule) {
      setIsModalCreateModuleOpen(false);
      createModuleForm.reset();
    }
  };

  //Modal Handlers -- Edit Module

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
  };

  const handleModalEditModuleCancel = () => {
    if (!isEditingModule) {
      setIsModalEditModuleOpen(false);
    }
  };

  //Modal Handlers -- Create Class

  const handleModalCreateClassOk = () => {
    setIsModalCreateClassOpen(false);
  };

  const handleModalCreateClassCancel = () => {
    if (!isCreatingClass) {
      setIsModalCreateClassOpen(false);
      createClassForm.reset();
    }
  };

  //Modal Handlers -- Edit Class

  const handleModalEditClassOpen = async (_class: Class) => {
    setEditingClass(_class);

    // pegar Steps da aula

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

  // Table columns

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

  const columnsClassesSteps: ProColumns<Class>[] = [{}];

  // ProComponents TableDrag Handlers

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

  const handleDragEndSortStepsOrder = async (beforeIndex: number, afterIndex: number, newDataSource: Steps[]) => {};

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
                <FormField // courseName
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

                <FormField // courseDescription
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
        width="60%"
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
                      <span>ID: {editingModule?.moduleName}</span>
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

              <div className="flex flex-row justify-end gap-4 items-center">
                <Button
                  type="button"
                  variant="secondary"
                  disabled={isEditingModule || !isEditModuleFormDirty}
                  onClick={() => {
                    editModuleForm.reset({
                      moduleName: editingModule?.moduleName || "",
                      moduleDescription: editingModule?.moduleDescription || "",
                    });
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
        className="mt-10"
      >
        <div className="mt-4 p-4 bg-zinc-800 rounded-lg text-zinc-300">
          <Form {...editClassForm}>
            <form onSubmit={editClassForm.handleSubmit(handleEditClassRequest)} className="flex flex-col gap-4">
              <FormField
                control={editClassForm.control}
                name="className"
                render={({ field }) => (
                  <FormItem className="">
                    <FormLabel className="text-base flex justify-between">
                      <span>Nome do Módulo</span>
                      <span>ID: {editingClass?.className}</span>
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
                          className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-gray-400"
                          checkedIcon={<Check size={12} color="green" className="ml-1 mt-1" />}
                          uncheckedIcon={<X size={12} color="gray" className="ml-1 mt-1" />}
                          checked={field.value}
                          onCheckedChange={field.onChange}
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
        </div>
      </Modal>
    </div>
  );
}
