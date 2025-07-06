import { Separator } from "@/components/ui/separator";
import { ProfileOutlined, TeamOutlined, SettingOutlined } from "@ant-design/icons";
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
      className="flex flex-col items-start justify-between h-32 p-4 cursor-pointer select-none rounded-lg transition-colors duration-200 hover:bg-opacity-100"
      style={{
        backgroundColor: props.bgColor,
        color: props.textColor,
      }}
      href={`administrationpage/${props.goToUrl}`}
    >
      <div className="icon" style={{ fontSize: "42px", height: "50px" }}>
        {props.icon}
      </div>

      <span className="font-normal leading-tight overflow-hidden text-ellipsis">{props.name}</span>
    </Link>
  );
};

export default function AdministrationPage() {
  return (
    <div className="flex flex-col items-start justify-start w-full mt-16">
      <Separator className="bg-gray-400" />
      <div className="flex gap-8 justify-start items-start w-full h-full py-10">
        <AdmButton
          bgColor="rgba(0, 255, 85, 0.4)"
          textColor="#ffffff"
          icon={<ProfileOutlined />}
          name="Gerenciar Cursos"
          goToUrl="/course-management"
        />

        <AdmButton
          bgColor="rgba(187, 187, 187, 0.4)"
          textColor="#ffffff"
          icon={<TeamOutlined />}
          name="Administrar Alunos"
          goToUrl="/admin-users-list"
        />
      </div>
    </div>
  );
}
