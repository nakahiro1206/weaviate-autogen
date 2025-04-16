"use client";
import { testConnection } from "@/postgres/client";
import { addPaper } from "@/weaviate/store";
import { PaperEntry } from "@/weaviate/types";

export default function Home() {
  const history = ["paper 1", "paper 2", "paper 3"];

  const entry: PaperEntry = {
    title: "How to cook sunny side up",
    abstract: "Instruction: 1. aaa. 2. bbb",
    authors: "Master. Egg",
    comments: "This is really impressive literacture",
  };

  const add = async (): Promise<void> => {
    try {
      const r = await testConnection();
      alert(r);
    } catch (error) {
      alert(error);
    }
    const res = await addPaper(entry);
    switch (res.__typename) {
      case "AddPaperResponse":
        alert(res.id);
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
              Let's Summarize Academic Paper!
            </div>
          </div>
          <div className="w-full rounded-xl text-center shadow-sm px-8 flex flex-col gap-2">
            <div>TITLE</div>
            <div>{entry.title}</div>
            <div>AUTHORS</div>
            <div>{entry.authors}</div>
            <div>ABSTRACT</div>
            <div>{entry.abstract}</div>
          </div>

          <div className="w-full flex flex-row justify-end">
            <div className="w-1/5 h-12 rounded-lg text-center text-white shadow-sm bg-sky-500">
              <button
                className="w-full h-full flex items-center justify-center"
                onClick={add}
              >
                Save document!
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
