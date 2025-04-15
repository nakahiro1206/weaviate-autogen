"use client";
import { useState } from "react";
import { searchSimilar } from "@/weaviate/retrieve";
import { PaperEntry, RetrieveResult } from "@/weaviate/types";

export default function Home() {
  const history = ["paper 1", "paper 2", "paper 3"];
  const [results, setResults] = useState<RetrieveResult[]>([]);

  const entry: PaperEntry = {
    title: "How to cook sunny side up",
    abstract: "Instruction: 1. aaa. 2. bbb",
    authors: "Master. Egg",
    comments: "This is really impressive literacture",
  };

  const search = async (): Promise<void> => {
    const res = await searchSimilar({ query: "aaaa" });
    switch (res.__typename) {
      case "SearchSimilarResponse":
        setResults(res.results);
        return;
      case "Err":
        alert(res.message);
        return;
    }
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
        <div className="w-full px-16  flex flex-col gap-2">
          <div className="w-full pb-4">
            <div className="border-b-1 border-sky-800 text-2xl font-extrabold text-sky-600">
              Let's Retrieve Related Papers!
            </div>
          </div>

          <div className="w-full flex flex-row gap-2">
            <textarea className="w-4/5 h-12 rounded-lg text-left text-sky-800 shadow-sm p-2 focus:outline-1 focus:outline-sky-600 resize-none appearance-none" />
            <div className="w-1/5 h-12 rounded-lg text-center text-white shadow-sm bg-sky-500">
              <button
                className="w-full h-full flex items-center justify-center"
                onClick={search}
              >
                Retrieve document!
              </button>
            </div>
          </div>

          <div className="w-full flex flex-col gap-2">
            {results.map((item, index) => {
              return (
                <div
                  key={index}
                  className="w-full h-12 rounded-lg text-center shadow-sm bg-white"
                >
                  <div className="w-full h-full flex items-center justify-center">
                    <div>TITLE</div>
                    <div>{item.title}</div>
                    <div>AUTHORS</div>
                    <div>{item.authors}</div>
                    <div>ABSTRACT</div>
                    <div>{item.abstract}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
