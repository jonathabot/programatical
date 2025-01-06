"use client";

import { Button as ShadcnButton } from "@/components/ui/button";

import {
  Button,
  Input,
  InputRef,
  Popconfirm,
  Space,
  Table,
  TableColumnType,
} from "antd";
import {
  DeleteFilled,
  SettingFilled,
  InfoCircleFilled,
  SearchOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import type { TableProps } from "antd/es/table";
import { useRef, useState } from "react";
import { FilterDropdownProps } from "antd/es/table/interface";
import Highlighter from "react-highlight-words";

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

export default function CourseManagement() {
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
      //define a interface
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters,
      close,
    }) => (
      <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
        <Input
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
    filterIcon: (
      filtered: boolean //adiciona o icon de filtro
    ) => <SearchOutlined style={{ color: filtered ? "#1677ff" : undefined }} />,
    onFilter: (
      value,
      record //logica de filtro
    ) =>
      record[courseIndex]
        .toString()
        .toLowerCase()
        .includes((value as string).toLowerCase()),
    filterDropdownProps: {
      //configuração de comportamento do filtro
      onOpenChange(open) {
        if (open) {
          setTimeout(() => searchInput.current?.select(), 100);
        }
      },
    },
    render: (
      text //realçar os itens filtrados
    ) =>
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
  //Inicio de configuração filtro!

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
  };

  return (
    <div className="w-4/5 h-full">
      <div className="flex justify-between items-center text-center mb-4">
        <h1 className="text-center flex-grow">Gerenciamento de Cursos</h1>
        <ShadcnButton
          variant="green"
          className="gap-2"
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
  );
}
