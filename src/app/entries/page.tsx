"use client";
import { useState, useEffect } from "react";
import { getAllPapers } from "@/weaviate/similarity-search";
import { GetAllResult } from "@/weaviate/types";
import dynamic from "next/dynamic";

const PdfPreview = dynamic(() => import("./Preview"), { ssr: false });

export default function Home() {
  const history = ["paper 1", "paper 2", "paper 3"];
  const [papers, setPapers] = useState<GetAllResult[]>([]);
  const [activePdfEncoded, setActivePdfEncoded] = useState<string | null>(null);
  const deactivatePdf = () => {
    setActivePdfEncoded(null);
  };

  useEffect(() => {
    // if it has error, no card will be shown
    const getAll = async () => {
      const res = await getAllPapers();
      switch (res.__typename) {
        case "GetAllResponse":
          setPapers(res.results);
          break;
        case "Err":
          alert(res.message);
          break;
      }
    };
    getAll();
  }, []);

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
        <div className="w-full px-16  flex flex-col gap-2">
          <div className="w-full pb-4">
            <div className="border-b-1 border-sky-800 text-2xl font-extrabold text-sky-600">
              Let's Summarize Academic Paper!
            </div>
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
                    <button
                      onClick={() => setActivePdfEncoded(item.encoded)}
                      className="text-sky-600 hover:text-sky-900"
                    >
                      Preview
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {activePdfEncoded && (
          <div className="fixed inset-0 z-50 max-h-lvh overflow-y-scroll">
            <PdfPreview encoded={activePdfEncoded} close={deactivatePdf} />
          </div>
        )}
      </div>
    </div>
  );
}
