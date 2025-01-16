"use client";

import { useState, useRef, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button as ShadcnButton } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input as ShadcnInput } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Modal,
  Popconfirm,
  Space,
  Table,
  TableColumnType,
  InputRef,
  Input as AntdInput,
  Button,
} from "antd";
import {
  DeleteFilled,
  SettingFilled,
  InfoCircleFilled,
  SearchOutlined,
  PlusOutlined,
  PlusCircleFilled,
} from "@ant-design/icons";
import type { TableProps } from "antd/es/table";
import { FilterDropdownProps } from "antd/es/table/interface";
import Highlighter from "react-highlight-words";
import { useToast } from "@/hooks/use-toast";
import { cn, generateShortId } from "@/lib/utils";
import {
  deactivateCourseRequest,
  getAllCourses,
  postCourse,
} from "@/lib/firebase/courses";
import { Course, CourseModule } from "@/types/types";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Check, ChevronsUpDown } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import Link from "next/link";
import { useRouter } from "next/navigation";

type CourseIndex = keyof Course;

const createCourseFormSchema = z.object({
  courseName: z.string().min(2, {
    message: "O nome do curso deve ter pelo menos 2 caracteres.",
  }),
  description: z.string().min(10, {
    message: "A descrição deve ter pelo menos 10 caracteres.",
  }),
});
const editCourseFormSchema = z.object({
  courseName: z.string().min(2, {
    message: "O nome do curso deve ter pelo menos 2 caracteres.",
  }),
  description: z.string().min(10, {
    message: "A descrição deve ter pelo menos 10 caracteres.",
  }),
});

type CreateCourseFormValues = z.infer<typeof createCourseFormSchema>;
type EditCourseFormValues = z.infer<typeof editCourseFormSchema>;

const availableModules = [
  {
    id: "module1",
    label: "Module 1",
  },
  {
    id: "module2",
    label: "Module 2",
  },
  {
    id: "module3",
    label: "Module 3",
  },
  {
    id: "module4",
    label: "Module 4",
  },
];

export default function CourseManagement() {
  const { toast } = useToast();

  const [courses, setCourses] = useState<Course[]>([]);
  const [isModalCreateCourseOpen, setIsModalCreateCourseOpen] = useState(false);
  const [isModalEditCourseOpen, setIsModalEditCourseOpen] = useState(false);
  const [isCreatingCourse, setIsCreatingCourse] = useState(false);
  const [isEditingCourse, setIsEditingCourse] = useState(false);
  const [newCourseIdHighlightTrigger, setNewCourseIdHighlightTrigger] =
    useState<String | null>(null);
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const searchInput = useRef<InputRef>(null);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");

  const router = useRouter();
  const handleEditCourseClick = (moduloslug: string) => {
    router.push(`course-management/${moduloslug}`);
  };

  const getColumnSearchProps = (
    courseIndex: CourseIndex
  ): TableColumnType<Course> => ({
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters,
      close,
    }) => (
      <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
        <AntdInput
          ref={searchInput}
          placeholder={`Digite aqui...`}
          value={selectedKeys[0]}
          onChange={(e) =>
            setSelectedKeys(e.target.value ? [e.target.value] : [])
          }
          onPressEnter={() =>
            handleSearch(selectedKeys as string[], confirm, courseIndex)
          }
          style={{ marginBottom: 8, display: "block" }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() =>
              handleSearch(selectedKeys as string[], confirm, courseIndex)
            }
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90 }}
          >
            Procurar
          </Button>
          <Button
            onClick={() => clearFilters && handleReset(clearFilters)}
            size="small"
            style={{ width: 90 }}
          >
            Apagar
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered: boolean) => (
      <SearchOutlined style={{ color: filtered ? "#1677ff" : undefined }} />
    ),
    onFilter: (value, record) =>
      record[courseIndex]
        .toString()
        .toLowerCase()
        .includes((value as string).toLowerCase()),
    filterDropdownProps: {
      onOpenChange(open) {
        if (open) {
          setTimeout(() => searchInput.current?.select(), 100);
        }
      },
    },
    render: (text) =>
      searchedColumn === courseIndex ? (
        <Highlighter
          highlightStyle={{ backgroundColor: "#ffc069", padding: 0 }}
          searchWords={[searchText]}
          autoEscape
          textToHighlight={text ? text.toString() : ""}
        />
      ) : (
        text
      ),
  });

  const columns: TableProps<Course>["columns"] = [
    {
      title: "ID",
      dataIndex: "courseId",
      key: "courseId",
      ...getColumnSearchProps("courseId"),
      sorter: (a, b) => Number(a.courseId) - Number(b.courseId),
      sortDirections: ["descend", "ascend"],
      width: "15%",
    },
    {
      title: "Nome do Curso",
      dataIndex: "courseName",
      key: "courseName",
      ...getColumnSearchProps("courseName"),
      width: "40%",
    },
    {
      title: "Criado em",
      dataIndex: "createdAt",
      key: "createdAt",
      sorter: (a, b) => Date.parse(a.createdAt) - Date.parse(b.createdAt),
      sortDirections: ["descend", "ascend"],
      render: (text) => (!text ? "-" : new Date(text).toLocaleString()),
    },
    {
      title: "Ações",
      dataIndex: "actions",
      key: "actions",
      render: (_, record) => (
        <div className="flex flex-row gap-5">
          <div
            className="cursor-pointer"
            onClick={() => {
              // showEditCourseModal(record);
              handleEditCourseClick(record.id);
            }}
          >
            <SettingFilled className="text-gray-600 hover:text-blue-500 text-[16px] hover:scale-125 hover:shadow-lg transition-all" />
          </div>

          <div className="cursor-pointer">
            <Popconfirm
              title="Deseja mesmo desativar esse curso?"
              onConfirm={() => handleDeactivateCourse(record.id)}
            >
              <a href="#">
                <DeleteFilled
                  style={{ color: "#ff0000", fontSize: "16px" }}
                  className="text-pmgRed text-[16px] hover:scale-125 hover:shadow-lg transition-all"
                />
              </a>
            </Popconfirm>
          </div>

          <div className="cursor-pointer" onClick={handleCourseInformation}>
            <InfoCircleFilled className="text-pmgInfoBlue text-[16px] hover:scale-125 hover:shadow-lg transition-all" />
          </div>
        </div>
      ),
    },
  ];

  const createCourseForm = useForm<CreateCourseFormValues>({
    resolver: zodResolver(createCourseFormSchema),
    defaultValues: {
      courseName: "",
      description: "",
    },
  });
  const editCourseForm = useForm<EditCourseFormValues>({
    resolver: zodResolver(editCourseFormSchema),
    defaultValues: {
      courseName: "",
      description: "",
    },
  });

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const coursesResponse = await getAllCourses();
        console.log(coursesResponse);
        setCourses(coursesResponse);
      } catch (err) {
        console.error(err);
      }
    };

    fetchCourses();
  }, []);

  const showCreateModal = () => {
    setIsModalCreateCourseOpen(true);
    createCourseForm.reset();
  };
  const handleCreateModalOk = () => {
    setIsModalCreateCourseOpen(false);
  };
  const handleCreateModalCancel = () => {
    if (!isCreatingCourse) {
      setIsModalCreateCourseOpen(false);
      createCourseForm.reset();
    }
  };
  const handleCreateCourse = async ({
    courseName,
    description,
  }: CreateCourseFormValues) => {
    setIsCreatingCourse(true);

    const newCourse = {
      courseName: courseName,
      courseId: generateShortId(),
      courseDescription: description,
      createdAt: new Date().toISOString(),
      active: true,
    };

    console.log("Criando novo curso: ", newCourse);

    const courseId = await postCourse(newCourse);

    console.log(courseId);

    if (courseId) {
      setCourses((prevCourses) => [
        { ...newCourse, id: courseId },
        ...prevCourses,
      ]);

      setNewCourseIdHighlightTrigger(newCourse.courseId);

      toast({
        title: "Sucesso!",
        description: "Curso criado com sucesso.",
      });
    } else {
      toast({
        title: "Erro!",
        description: "Ocorreu um erro ao criar o curso.",
      });
    }

    handleCreateModalOk();
    setIsCreatingCourse(false);
  };

  const showEditCourseModal = (course: Course) => {
    setEditingCourse(course);
    setIsModalEditCourseOpen(true);
    editCourseForm.setValue("courseName", course.courseName);
    editCourseForm.setValue("description", course.courseDescription);
  };
  const handleEditModalOk = () => {
    setIsModalEditCourseOpen(false);
  };
  const handleEditModalCancel = () => {
    if (!isCreatingCourse) {
      setIsModalEditCourseOpen(false);
      setValue("");
      createCourseForm.reset();
    }
  };
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

    setIsModalEditCourseOpen(false);
  };

  const handleSearch = (
    selectedKeys: string[],
    confirm: FilterDropdownProps["confirm"],
    courseIndex: CourseIndex
  ) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(courseIndex);
  };

  const handleReset = (clearFilters: () => void) => {
    clearFilters();
    setSearchText("");
  };

  const handleDeactivateCourse = async (courseId: string) => {
    const response = await deactivateCourseRequest(courseId);

    response
      ? toast({
          title: `Curso ${courseId} desativado!`,
          description: "O curso foi desativado com sucesso.",
        })
      : toast({
          title: "Oops!",
          description: "Deu algum erro ao deletar o seu curso.",
        });
  };

  const handleCourseInformation = () => {
    console.log("Informação do curso.");
    toast({
      title: "",
      description: "Em breve Informação do curso..",
    });
  };

  const handleCreateNewCourse = () => {
    console.log("Criar um novo curso.");
    showCreateModal();
  };

  return (
    <>
      <div className="w-4/5 h-full">
        <div className="flex items-center justify-between mb-4">
          <span className="text-3xl text-zinc-200">
            Gerenciamento de Cursos
          </span>

          <ShadcnButton
            variant="green"
            className="gap-2 flex items-center justify-center"
            onClick={handleCreateNewCourse}
          >
            <PlusOutlined />
            Adicionar Curso
          </ShadcnButton>
        </div>

        <Table<Course>
          dataSource={courses}
          columns={columns}
          rowKey="courseId"
          className="bg-white rounded-lg"
          rowClassName={(record) =>
            newCourseIdHighlightTrigger &&
            record.courseId == newCourseIdHighlightTrigger
              ? "highlight-row"
              : ""
          }
          locale={{
            triggerDesc: "Ordenar em ordem decrescente",
            triggerAsc: "Ordenar em ordem crescente",
            cancelSort: "Cancelar ordenação",
          }}
        />
      </div>

      <Modal
        title="Formulário - Criar um novo curso"
        open={isModalCreateCourseOpen}
        onCancel={handleCreateModalCancel}
        footer={null}
      >
        <Form {...createCourseForm}>
          <form
            onSubmit={createCourseForm.handleSubmit(handleCreateCourse)}
            className="space-y-4 mt-4 p-4 bg-zinc-800 rounded-lg"
          >
            <FormField
              control={createCourseForm.control}
              name="courseName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Nome do Curso</FormLabel>
                  <FormControl>
                    <ShadcnInput
                      placeholder="Digite o nome do curso"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={createCourseForm.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Descrição</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Digite a descrição do curso"
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end space-x-4">
              <ShadcnButton
                type="button"
                variant="secondary"
                onClick={handleCreateModalCancel}
                disabled={isCreatingCourse}
              >
                Cancelar
              </ShadcnButton>
              <ShadcnButton
                type="submit"
                loading={isCreatingCourse}
                loadingText="Criando..."
              >
                {isCreatingCourse ? "Criando..." : "Criar Curso"}
              </ShadcnButton>
            </div>
          </form>
        </Form>
      </Modal>

      <Modal
        title="Formulário - Editar curso"
        open={isModalEditCourseOpen}
        onCancel={handleEditModalCancel}
        footer={null}
      >
        <Form {...editCourseForm}>
          <form
            onSubmit={editCourseForm.handleSubmit(handleEditCourseRequest)}
            className="space-y-4 mt-4 rounded-lg"
          >
            <FormField
              control={editCourseForm.control}
              name="courseName"
              render={({ field }) => (
                <FormItem className="">
                  <FormLabel className="text-base">Nome do Curso</FormLabel>
                  <FormControl>
                    <ShadcnInput
                      placeholder="Digite o nome do curso"
                      {...field}
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
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormItem className="flex flex-col gap-2">
              <FormLabel className="text-base">Modulos</FormLabel>
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
                      <Space>
                        <div className="cursor-pointer">
                          <Popconfirm
                            title="Deseja mesmo remover o modulo?"
                            onConfirm={() => console.log(record.id)}
                          >
                            <a href="#">
                              <DeleteFilled
                                style={{ color: "#ff0000", fontSize: "16px" }}
                                className="text-pmgRed text-[16px] hover:scale-125 hover:shadow-lg transition-all"
                              />
                            </a>
                          </Popconfirm>
                        </div>
                      </Space>
                    ),
                  },
                ]}
                rowKey="id"
                className="rounded-lg shadow-lg"
              />

              <div className="flex gap-2">
                <Popover open={open} onOpenChange={setOpen}>
                  <PopoverTrigger asChild>
                    <ShadcnButton
                      variant="outline"
                      role="combobox"
                      aria-expanded={open}
                      className="w-[200px] justify-between"
                    >
                      {value
                        ? availableModules.find((module) => module.id === value)
                            ?.label
                        : "Adicione um modulo..."}
                      <ChevronsUpDown className="opacity-50" />
                    </ShadcnButton>
                  </PopoverTrigger>
                  <PopoverContent className="w-[200px] p-0 z-[1050]">
                    <Command>
                      <CommandInput
                        placeholder="Search framework..."
                        className="h-9"
                      />
                      <CommandList>
                        <CommandEmpty>No framework found.</CommandEmpty>
                        <CommandGroup>
                          {availableModules.map((module) => (
                            <CommandItem
                              key={module.id}
                              value={module.id}
                              onSelect={(currentValue) => {
                                setValue(
                                  currentValue === value ? "" : currentValue
                                );
                                setOpen(false);
                              }}
                              className="cursor-pointer"
                            >
                              {module.label}
                              <Check
                                className={cn(
                                  "ml-auto",
                                  value === module.id
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>

                {value ? (
                  <PlusOutlined
                    className="text-lg font-bold bg-green-500 hover:bg-green-600 px-3 rounded-lg transition-all duration-300 text-white"
                    onClick={() => console.log("aaa")}
                  />
                ) : null}
              </div>
            </FormItem>

            <div className="flex justify-end space-x-4">
              <ShadcnButton
                type="button"
                variant="outline"
                onClick={handleEditModalCancel}
                disabled={isEditingCourse}
              >
                Cancelar
              </ShadcnButton>
              <ShadcnButton
                type="submit"
                loading={isEditingCourse}
                loadingText="Criando..."
              >
                {isEditingCourse ? "Salvando..." : "Salvar"}
              </ShadcnButton>
            </div>
          </form>
        </Form>
      </Modal>
    </>
  );
}
