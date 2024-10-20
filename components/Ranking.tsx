import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";

const rankingData = [
  {
    rank: 1,
    usuario: "Jonatha Botelho",
    pontos: 500,
  },
  {
    rank: 2,
    usuario: "Matheus Rodrigues",
    pontos: 499,
  },
  {
    rank: 3,
    usuario: "Caio Mendes",
    pontos: 498,
  },
  {
    rank: 4,
    usuario: "Ana Nascimento",
    pontos: 497,
  },
  {
    rank: 5,
    usuario: "Ellie Goulding",
    pontos: 496,
  },
  {
    rank: 6,
    usuario: "Taylor Swift",
    pontos: 495,
  },
  {
    rank: 7,
    usuario: "Mathews",
    pontos: 494,
  },
  {
    rank: 8,
    usuario: "Grimes",
    pontos: 493,
  },
  {
    rank: 9,
    usuario: "Orlando Naoestavanacal",
    pontos: 492,
  },
];

export default function Ranking() {
  return (
    <>
      <div className="bg-slate-50 rounded-lg w-[350px] text-center text-slate-700 select-none">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="font-bold text-center text-slate-700">
                Rank
              </TableHead>
              <TableHead className="font-bold text-center text-slate-700">
                Usuario
              </TableHead>
              <TableHead className="font-bold text-center text-slate-700">
                Pontos
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rankingData.map((userAtRank, index) => (
              <TableRow key={index} className="h-10">
                <TableCell className="font-bold">{userAtRank.rank}</TableCell>
                <TableCell>{userAtRank.usuario}</TableCell>
                <TableCell className="font-bold text-blue-700">
                  {userAtRank.pontos}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
