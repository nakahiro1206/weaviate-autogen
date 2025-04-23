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
        <div className="w-full grid grid-cols-2 gap-2">
          {papers.map((item, index) => {
            return (
              <div
                key={index}
                className="w-full h-60 rounded-lg text-center shadow-sm bg-white"
              >
                <div
                  className="w-full h-full flex flex-col gap-1 items-center justify-center"
                  onClick={() => {
                    setActivePdfEncoded(item.encoded);
                  }}
                >
                  <div>TITLE</div>
                  <div>{item.title}</div>
                  <div>AUTHORS</div>
                  <div>{item.authors}</div>
                  <div>ABSTRACT</div>
                  <div className="w-full line-clamp-3">{item.abstract}</div>
                  {/* <div>{item.encoded}</div> */}
                </div>
              </div>
            );
          })}
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
