import Image from "next/image";

export default function Home() {
  return (
    <main className="flex min-h-screen items-center flex-col bg-zinc-800">
      <div className="flex justify-between items-center w-full px-10 my-8">
        {/* Substitua pela sua imagem de logo */}
        <Image src="/logoPgm.png" alt="Logo" width={200} height={50} />
        <button className="px-6 py-2 bg-sky-400 text-white rounded-full hover:bg-blue-600">
          Entrar
        </button>
      </div>
    </main>
  );
}
