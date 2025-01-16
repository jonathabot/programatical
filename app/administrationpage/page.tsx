import { Separator } from "@/components/ui/separator";
import {
  ProfileOutlined,
  TeamOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import Link from "next/link";

interface AdmButtonProps {
  bgColor: string;
  textColor: string;
  icon: React.ReactNode;
  name: string;
  goToUrl: string;
}

const AdmButton = (props: AdmButtonProps) => {
  return (
    <Link
      className="flex flex-col items-start justify-between h-32 p-4 cursor-pointer select-none rounded-lg"
      style={{
        backgroundColor: props.bgColor,
        color: props.textColor,
      }}
      href={`administrationpage/${props.goToUrl}`}
    >
      <div className="icon" style={{ fontSize: "42px", height: "50px" }}>
        {props.icon}
      </div>

      <span className="font-normal leading-tight overflow-hidden text-ellipsis">
        {props.name}
      </span>
    </Link>
  );
};

export default function AdministrationPage() {
  return (
    <div className="flex flex-col justify-start items-start w-full h-full py-20">
      <AdmButton
        bgColor="#00ff5587"
        textColor="#ffffff"
        icon={<ProfileOutlined />}
        name="Gerenciar Cursos"
        goToUrl="/course-management"
      />

      <Separator className="my-20" />

      <div className="flex gap-10">
        <AdmButton
          bgColor="#008cff86"
          textColor="#ffffff"
          icon={<SettingOutlined />}
          name="Editar/Criar Modulos Avulsos"
          goToUrl="/modules-management"
        />

        <AdmButton
          bgColor="#00d9ff86"
          textColor="#ffffff"
          icon={<SettingOutlined />}
          name="Editar/Criar Aulas Avulsas"
          goToUrl="/course-management"
        />

        <AdmButton
          bgColor="#ea00ff85"
          textColor="#ffffff"
          icon={<SettingOutlined />}
          name="Editar/Criar Etapas Avulsas"
          goToUrl="/course-management"
        />

        <AdmButton
          bgColor="#bbbbbb85"
          textColor="#ffffff"
          icon={<TeamOutlined />}
          name="Administrar Alunos"
          goToUrl="/course-management"
        />
      </div>
    </div>
  );
}
