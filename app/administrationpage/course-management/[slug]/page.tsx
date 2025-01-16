"use client";

import { useParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Course, CourseModule } from "@/types/types";
import { useEffect, useState } from "react";
import { toast } from "@/hooks/use-toast";
import { Modal, Popconfirm, Table } from "antd";
import { DeleteFilled, PlusCircleFilled } from "@ant-design/icons";
import { Skeleton } from "@/components/ui/skeleton";
import { getCourseById, postModule } from "@/lib/firebase/courses";
import { PackageOpen, PlusCircleIcon } from "lucide-react";
import { generateShortId } from "@/lib/utils";

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
    message: "O nome do curso deve ter pelo menos 2 caracteres.",
  }),
  moduleDescription: z.string().min(10, {
    message: "A descrição deve ter pelo menos 10 caracteres.",
  }),
});
type CreateModuleFormValues = z.infer<typeof createModuleFormSchema>;

export default function courseEdit() {
  const { slug } = useParams();
  const docId = String(slug);
  const [isEditingCourse, setIsEditingCourse] = useState(false);
  const [isCreatingModule, setIsCreatingModule] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [isModalCreateModuleOpen, setIsModalCreateModuleOpen] = useState(false);

  const editCourseForm = useForm<EditCourseFormValues>({
    resolver: zodResolver(editCourseFormSchema),
    defaultValues: {
      courseName: "",
      description: "",
    },
  });
  const { isDirty } = editCourseForm.formState;

  const createModuleForm = useForm<CreateModuleFormValues>({
    resolver: zodResolver(createModuleFormSchema),
    defaultValues: {
      moduleName: "",
      moduleDescription: "",
    },
  });

  useEffect(() => {
    const gettingCourseInfo = async () => {
      try {
        const courseInfo = await getCourseById(docId);
        setEditingCourse(courseInfo);
        editCourseForm.setValue("courseName", courseInfo?.courseName || "");
        editCourseForm.setValue(
          "description",
          courseInfo?.courseDescription || ""
        );
        console.log(editingCourse);
      } catch (error) {
        console.log(error);
      }
    };

    gettingCourseInfo();
  }, []);

  const handleEditCourseRequest = async () => {
    if (editingCourse) {
      const updatedCourse = {
        ...editingCourse,
        courseName: editCourseForm.getValues("courseName"),
        courseDescription: editCourseForm.getValues("description"),
      };
      console.log("Atualizando curso: ", updatedCourse);

      // Chame a função para atualizar o curso no banco de dados
      // const response = await postCourse(updatedCourse); // Aqui você pode atualizar via API/Firebase

      toast({
        title: "Sucesso!",
        description: "Curso editado com sucesso.",
      });

      // if (response) {
      //   toast({
      //     title: "Sucesso!",
      //     description: "Curso editado com sucesso.",
      //   });
      //   setCourses((prevCourses) =>
      //     prevCourses.map((course) =>
      //       course.id === updatedCourse.id ? updatedCourse : course
      //     )
      //   );
      // } else {
      //   toast({
      //     title: "Erro!",
      //     description: "Ocorreu um erro ao editar o curso.",
      //   });
      // }
    }
  };

  const handleCreateModule = async ({
    moduleName,
    moduleDescription,
  }: CreateModuleFormValues) => {
    setIsCreatingModule(true);

    const newModule = {
      moduleName: moduleName,
      moduleId: generateShortId(),
      moduleDescription: moduleDescription,
      createdAt: new Date().toISOString(),
      isActive: true,
      attachedTo_CourseId: editingCourse?.courseId || "",
      order: "1", //Preciso de uma logica
    };

    console.log("Criando novo module: ", newModule);
    const moduleId = await postModule(newModule);
    console.log(moduleId);

    if (moduleId) {
      // setCourses((prevCourses) => [
      //   { ...newCourse, id: moduleId },
      //   ...prevCourses,
      // ]);

      toast({
        title: "Sucesso!",
        description: "Modulo criado com sucesso.",
      });
    } else {
      toast({
        title: "Erro!",
        description: "Ocorreu um erro ao criar o Modulo.",
      });
    }

    handleCreateModuleModalOk();
    setIsCreatingModule(false);
  };

  const handleCreateModuleModalOk = () => {
    setIsModalCreateModuleOpen(false);
  };

  const handleModalCreateModuleCancel = () => {
    if (!isCreatingModule) {
      setIsModalCreateModuleOpen(false);
      createModuleForm.reset();
    }
  };

  return (
    <div className="w-4/5 h-full">
      <div className="flex flex-col items-center mb-4">
        {editingCourse ? (
          <>
            <span className="text-3xl text-zinc-200">
              Gerenciamento de Curso
            </span>

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
                      <FormLabel className="text-base">Nome do Curso</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Digite o nome do curso"
                          {...field}
                          className="text-zinc-950"
                        />
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

                <FormItem className="flex flex-col gap-2">
                  <FormLabel className="text-base">Modulos</FormLabel>

                  <div className="relative">
                    <Table<CourseModule>
                      dataSource={[]}
                      columns={[
                        {
                          title: "ID do Modulo",
                          dataIndex: "moduleId",
                          key: "moduleId",
                          width: "30%",
                        },
                        {
                          title: "Nome do Modulo",
                          dataIndex: "moduleName",
                          key: "moduleName",
                        },
                        {
                          title: "Ações",
                          key: "actions",
                          width: "10%",
                          render: (_, record) => (
                            <div className="cursor-pointer">
                              <Popconfirm
                                title="Deseja mesmo remover o modulo?"
                                onConfirm={() => console.log(record.id)}
                              >
                                <a href="#">
                                  <DeleteFilled
                                    style={{
                                      color: "#ff0000",
                                      fontSize: "16px",
                                    }}
                                    className="text-pmgRed text-[16px] hover:scale-125 hover:shadow-lg transition-all"
                                  />
                                </a>
                              </Popconfirm>
                            </div>
                          ),
                        },
                      ]}
                      rowKey="id"
                      locale={{
                        emptyText: (
                          <div className="text-zinc-500 flex flex-col gap-2 items-center my-6">
                            <PackageOpen />
                            <span>Sem módulos cadastrados</span>
                          </div>
                        ),
                      }}
                    />

                    <PlusCircleFilled
                      className="absolute bottom-4 right-4 text-green-500 text-4xl hover:text-green-600 hover:text-5xl cursor-pointer transition-all duration-300"
                      onClick={() => setIsModalCreateModuleOpen(true)}
                    />
                  </div>
                </FormItem>

                <FormItem className="flex justify-end">
                  <Button
                    type="submit"
                    loading={isEditingCourse}
                    loadingText="Criando..."
                    disabled={!isDirty || isEditingCourse}
                  >
                    {isEditingCourse ? "Salvando..." : "Salvar"}
                  </Button>
                </FormItem>
              </form>
            </Form>
          </>
        ) : (
          <div className="space-y-2">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
          </div>
        )}
      </div>

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
                    <Textarea
                      placeholder="Digite a descrição do modulo"
                      className="min-h-[100px]"
                      {...field}
                    />
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
              >
                {isCreatingModule ? "Criando..." : "Criar Modulo"}
              </Button>
            </div>
          </form>
        </Form>
      </Modal>
    </div>
  );
}
