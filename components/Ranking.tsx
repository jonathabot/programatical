import { Button } from "./ui/button";
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
    usuario: "CleanZebra444",
    pontos: 500,
  },
  {
    rank: 2,
    usuario: "LeftOpossum532",
    pontos: 499,
  },
  {
    rank: 3,
    usuario: "EssentialRook731",
    pontos: 498,
  },
  {
    rank: 4,
    usuario: "GleamingWarbler597",
    pontos: 497,
  },
  {
    rank: 5,
    usuario: "DesirableLoon323",
    pontos: 496,
  },
  {
    rank: 6,
    usuario: "AppallingOstrich527",
    pontos: 495,
  },
  {
    rank: 7,
    usuario: "CombativeBedbug436",
    pontos: 494,
  },
  {
    rank: 8,
    usuario: "FrontChameleon286",
    pontos: 493,
  },
  {
    rank: 9,
    usuario: "TastelessPerch420",
    pontos: 492,
  },
];

export default function Ranking() {
  return (
    <>
      <div className="flex gap-2 mb-4 justify-end">
        <Button
          variant="outline"
          className="bg-white hover:bg-gray-200 text-black"
        >
          7 dias
        </Button>
        <Button className="bg-jyunBlue hover:bg-cyan-600 text-white">
          Todos os tempos
        </Button>
      </div>
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
