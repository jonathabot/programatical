"use client";

import { useState, useRef, useId } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
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
} from "@ant-design/icons";
import type { TableProps } from "antd/es/table";
import { FilterDropdownProps } from "antd/es/table/interface";
import Highlighter from "react-highlight-words";
import { useToast } from "@/hooks/use-toast";
import { generateShortId } from "@/lib/utils";
import { postCourse } from "@/lib/firebase/courses";
interface CourseInformation {
  idCourse: string;
  courseName: string;
  createdAt: string;
}

type CourseIndex = keyof CourseInformation;

const dataSource = Array.from<CourseInformation>({
  length: 46,
}).map<CourseInformation>((_, i) => ({
  idCourse: `${i}`,
  courseName: `Edward King ${i}`,
  createdAt: `2025-01-05T03:30:04.492Z`,
}));

const formSchema = z.object({
  courseName: z.string().min(2, {
    message: "O nome do curso deve ter pelo menos 2 caracteres.",
  }),
  description: z.string().min(10, {
    message: "A descrição deve ter pelo menos 10 caracteres.",
  }),
});

type FormValues = z.infer<typeof formSchema>;

export default function CourseManagement() {
  const [isModalCreateCourseOpen, setIsModalCreateCourseOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      courseName: "",
      description: "",
    },
  });

  const showModal = () => {
    setIsModalCreateCourseOpen(true);
    form.reset();
  };

  const handleOk = () => {
    setIsModalCreateCourseOpen(false);
  };

  const handleCancel = () => {
    if (!isSubmitting) {
      setIsModalCreateCourseOpen(false);
      form.reset();
    }
  };

  const handleCreateCourse = async ({
    courseName,
    description,
  }: FormValues) => {
    setIsSubmitting(true);

    const newCourse = {
      courseName: courseName,
      courseId: generateShortId(),
      courseDescription: description,
    };

    console.log("Criando novo curso: ", newCourse);

    const courseId = await postCourse(newCourse);

    if (courseId) {
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

    handleOk();
    setIsSubmitting(false);
  };

  //Inicio de configuração filtro!
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const searchInput = useRef<InputRef>(null);
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

  const getColumnSearchProps = (
    courseIndex: CourseIndex
  ): TableColumnType<CourseInformation> => ({
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

  const columns: TableProps<CourseInformation>["columns"] = [
    {
      title: "ID do Curso",
      dataIndex: "idCourse",
      key: "idCourse",
      sorter: (a, b) => Number(a.idCourse) - Number(b.idCourse),
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
      render: (text) => new Date(text).toLocaleString(),
    },
    {
      title: "Operação",
      dataIndex: "operation",
      key: "operation",
      render: (_, record) => (
        <div className="flex flex-row gap-5">
          <div className="cursor-pointer" onClick={handleCourseEdit}>
            <SettingFilled className="text-gray-600 hover:text-blue-500 text-[16px] hover:scale-125 hover:shadow-lg transition-all" />
          </div>

          <div className="cursor-pointer">
            <Popconfirm
              title="Confirmar remoção?"
              onConfirm={() => handleDeleteCourse(record)}
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

  const handleCourseEdit = () => {
    console.log("Editar curso.");
  };

  const handleDeleteCourse = (infoCurso: CourseInformation) => {
    console.log("Deletar curso.");
  };

  const handleCourseInformation = () => {
    console.log("Informação do curso.");
  };

  const handleCreateNewCourse = () => {
    console.log("Criar um novo curso.");
    showModal();
  };

  return (
    <>
      <div className="w-4/5 h-full">
        <div className="relative flex items-center justify-center mb-4">
          <h1 className="text-center text-5xl">Gerenciamento de Cursos</h1>
          <ShadcnButton
            variant="green"
            className="absolute right-4 gap-2"
            onClick={handleCreateNewCourse}
          >
            <PlusOutlined />
            Adicionar Curso
          </ShadcnButton>
        </div>

        <Table<CourseInformation>
          dataSource={dataSource}
          columns={columns}
          rowKey="idCourse"
          className="bg-white rounded-lg"
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
        onCancel={handleCancel}
        footer={null}
      >
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleCreateCourse)}
            className="space-y-4 mt-4 p-4 bg-zinc-800 rounded-lg"
          >
            <FormField
              control={form.control}
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
              control={form.control}
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
                onClick={handleCancel}
                disabled={isSubmitting}
              >
                Cancelar
              </ShadcnButton>
              <ShadcnButton
                type="submit"
                loading={isSubmitting}
                loadingText="Criando..."
              >
                {isSubmitting ? "Criando..." : "Criar Curso"}
              </ShadcnButton>
            </div>
          </form>
        </Form>
      </Modal>
    </>
  );
}
