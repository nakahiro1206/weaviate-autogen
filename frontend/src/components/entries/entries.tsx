import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { match } from "@/lib/result";
import { toast } from "sonner";
import { fetchAllPapers } from "@/lib/api-helper/paper";
import { chunkPaper } from "@/lib/api-helper/chunk";
import { RetrievedPaperEntry } from "@/models/paper";

const PdfPreview = dynamic(() => import("./pdf-preview"), { ssr: false });

export const Entries = () => {
  const history = ["paper 1", "paper 2", "paper 3"];
  const [papers, setPapers] = useState<RetrievedPaperEntry[]>([]);
  const [activePdfFileId, setActivePdfFileId] = useState<string | null>(null);
  const [chunkingPaperId, setChunkingPaperId] = useState<string | null>(null);
  const deactivatePdf = () => {
    setActivePdfFileId(null);
  };

  useEffect(() => {
    // if it has error, no card will be shown
    const getAll = async () => {
      const res = await fetchAllPapers();
      match(res, {
        onSuccess: (data) => {
            setPapers(data);
        },
        onError: (msg) => {
            toast.error(msg);
        },
      })
    };
    getAll();
  }, []);

  const handleChunk = async (paper: RetrievedPaperEntry) => {
    setChunkingPaperId(paper.metadata.uuid);
    const res = await chunkPaper(paper, paper.metadata.uuid);
    match(res, {
      onSuccess: (chunks) => {
        toast.success(`Successfully chunked paper into ${chunks.length} chunks`);
        setChunkingPaperId(null);
      },
      onError: (msg) => {
        toast.error(`Failed to chunk paper: ${msg}`);
        setChunkingPaperId(null);
      },
    });
  };

  return (
    <div className="w-full flex">
      <div className="w-1/4 h-[calc(100vh)] flex flex-col gap-2 p-4 bg-gray-100">
        <div className="w-full h-12 rounded-lg text-center shadow-sm bg-sky-100">
          <div className="w-full h-full flex items-center justify-center">
            New Chat!
          </div>
        </div>
        {history.map((item, index) => {
          return (
            <div
              key={index}
              className="w-full h-12 rounded-lg text-center shadow-sm bg-white"
            >
              <div className="w-full h-full flex items-center justify-center">
                {item}
              </div>
            </div>
          );
        })}
      </div>
      <div className="w-3/4 h-[calc(100vh)] flex flex-col gap-2 p-4">
        <div className="w-full px-16 flex flex-col gap-2">
          <div className="w-full pb-4 flex justify-between items-center">
            <div className="border-b-1 border-sky-800 text-2xl font-extrabold text-sky-600">
              Let's Summarize Academic Paper!
            </div>
            <a
              href="/chunks"
              className="text-sky-600 hover:text-sky-800 font-medium"
            >
              View Chunks Gallery
            </a>
          </div>
        </div>
        <div className="w-full overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Summary</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {papers.map((item, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{item.info.title}</div>
                    <div className="text-sm text-gray-500">{item.info.author}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 line-clamp-2">{item.summary}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      Chunked
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => setActivePdfFileId(item.metadata.uuid)}
                        className="text-sky-600 hover:text-sky-900"
                      >
                        Preview
                      </button>
                      <button
                        onClick={() => handleChunk(item)}
                        disabled={chunkingPaperId === item.metadata.uuid}
                        className={`text-sky-600 hover:text-sky-900 ${chunkingPaperId === item.metadata.uuid ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        {chunkingPaperId === item.metadata.uuid ? 'Chunking...' : 'Chunk'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {activePdfFileId && (
          <div className="fixed inset-0 z-50 max-h-lvh overflow-y-scroll">
            <PdfPreview fileId={activePdfFileId} close={deactivatePdf} />
          </div>
        )}
      </div>
    </div>
  );
}
