import { useRef, useState } from "react";
import { paperService } from "@/service";
import { RetrieveResult } from "@/service/entities/paper";
import { toast } from "sonner";
import { match } from "@/lib/result";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { SearchWindow } from "./search-window";

export const Retrieval = () => {
  const history = ["paper 1", "paper 2", "paper 3"];
  const [results, setResults] = useState<RetrieveResult[]>([]);
  const searchRef = useRef<HTMLTextAreaElement>(null);
  const [activePdfEncoded, setActivePdfEncoded] = useState<string | null>(null);
  const [chunkingPaperId, setChunkingPaperId] = useState<string | null>(null);

  // const entry: PaperEntry = {
  //   title: "How to cook sunny side up",
  //   abstract: "Instruction: 1. aaa. 2. bbb",
  //   authors: "Master. Egg",
  //   comments: "This is really impressive literacture",
  //   encoded: "encoded data",
  // };

  const [targetPaper, setTargetPaper] = useState<RetrieveResult | null>(null);

  const handleOpenChunks = (paper: RetrieveResult) => {
    setTargetPaper(paper);
  };

  const deactivatePdf = () => {
    setActivePdfEncoded(null);
  };

  const handleChunk = async (paper: RetrieveResult) => {
    setChunkingPaperId(paper.metadata.uuid);
    // Mock chunking action
    setTimeout(() => {
      toast.success("Successfully chunked paper");
      setChunkingPaperId(null);
    }, 1000);
  };

  const search = async (): Promise<void> => {
    const query = searchRef.current?.value;
    if (!query) {
      toast.error("Please enter a query");
      return;
    }
    const res = await paperService.searchSimilar(query);
    match(res, {
      onSuccess: (data) => {
        setResults(data);
      },
      onError: (message) => {
        toast.error(message);
      },
    });
  };

  return (
    <div className="w-full flex">
      <div className={cn("w-full h-[calc(100vh)] flex flex-col gap-2 p-4", targetPaper ? "w-1/2" : "w-full")}>
        <div className="w-full px-16 flex flex-col gap-2">
          <div className="w-full pb-4">
            <div className="border-b-1 border-sky-800 text-2xl font-extrabold text-sky-600">
              Let's Retrieve Related Papers!
            </div>
          </div>

          <div className="w-full flex flex-row gap-2">
            <textarea
              ref={searchRef}
              className="w-4/5 h-12 rounded-lg text-left text-sky-800 shadow-sm p-2 focus:outline-1 focus:outline-sky-600 resize-none appearance-none"
            />
            <div className="w-1/5 h-12 rounded-lg text-center text-white shadow-sm bg-sky-500">
              <button
                className="w-full h-full flex items-center justify-center"
                onClick={search}
              >
                Retrieve document!
              </button>
            </div>
          </div>

          <div className="w-full">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-1/4 break-words whitespace-normal">Title & Authors</TableHead>
                  <TableHead className="w-1/4 break-words whitespace-normal">Summary</TableHead>
                  <TableHead className="w-1/4 break-words whitespace-normal">Status</TableHead>
                  <TableHead className="w-1/4 break-words whitespace-normal">Actions</TableHead>
                  <TableHead className="w-1/4 break-words whitespace-normal">Chunks</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {results.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell className="w-1/4 break-words whitespace-normal">
                      <div className="text-sm font-medium text-gray-900">{item.info.title}</div>
                      <div className="text-sm text-gray-500">{item.info.author}</div>
                    </TableCell>
                    <TableCell className="w-1/4 break-words whitespace-normal">
                      <span className="text-sm text-gray-900">{item.summary}</span>
                    </TableCell>
                    <TableCell className="w-1/4 break-words whitespace-normal">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        true 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {true ? 'Chunked' : 'Not Chunked'}
                      </span>
                    </TableCell>
                    <TableCell className="w-1/4 break-words whitespace-normal">
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => setActivePdfEncoded(item.encoded)}
                          className="text-sky-600 hover:text-sky-900"
                        >
                          Preview
                        </button>
                        {!true && (
                          <button
                            onClick={() => handleChunk(item)}
                            disabled={chunkingPaperId === item.metadata.uuid}
                            className={`text-sky-600 hover:text-sky-900 ${chunkingPaperId === item.metadata.uuid ? 'opacity-50 cursor-not-allowed' : ''}`}
                          >
                            {chunkingPaperId === item.metadata.uuid ? 'Chunking...' : 'Chunk'}
                          </button>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="w-1/4 break-words whitespace-normal">
                      <button
                        onClick={() => handleOpenChunks(item)}
                        disabled={!true}
                        className={`text-sky-600 hover:text-sky-900 ${!true ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        Open Chunks
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
      {targetPaper && (
        <SearchWindow targetPaper={targetPaper} />
      )}
    </div>
  );
}
