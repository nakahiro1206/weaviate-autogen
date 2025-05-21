import {
  FC,
  MouseEventHandler,
  ChangeEventHandler,
  useRef,
  useState,
} from "react";
import { addPaper } from "@/lib/weaviate-client/insert";
import { summarizeDocument } from "@/openai/summary";
import { parsePDF } from "@/service/parse-pdf";
import { Button } from "@/components/ui/button";
import { SubmitForm } from "@/components/summarize/custom-dialog";
import { PlusIcon } from "@/components/icons/plus";
import { SubmitIcon } from "@/components/icons/submit";
import { PaperInfo } from "@/types/paper";
import { match } from "@/lib/result";

export const Summarize: FC = () => {
  const history = ["paper 1", "paper 2", "paper 3"];

  const [text, setText] = useState<string | null>(null);
  const [summary, setSummary] = useState<string | null>(null);
  const [encoded, setEncoded] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const isValidFile = (file: File) => {
    return file.type === "application/pdf"; //  && file.size <= 10 * 1024 * 1024;
  };

  const handleFileChange: ChangeEventHandler<HTMLInputElement> = async (
    event,
  ) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      setFile(file);
    }
  };

  const handleClick: MouseEventHandler<HTMLButtonElement> = () => {
    inputRef.current?.click();
  };

  const summarize = async () => {
    if (!file) return;
    // body size, PDF validation
    // Please use the Buffer.alloc(), Buffer.allocUnsafe(), or Buffer.from() methods instead.
    const encoded = Buffer.from(await file.arrayBuffer()).toString("base64");
    setEncoded(encoded);
    const res = await parsePDF({ file });
    switch (res.__typename) {
      case "ParsePdfOutput":
        setText(res.text);
        const summary = await summarizeDocument(res.text);
        setSummary(summary);
        break;
      case "Err":
        alert("Error parsing PDF");
        break;
    }
  };

  const add = async (data: PaperInfo): Promise<void> => {
    if (encoded === null || summary === null) {
      return;
    }
    const res = await addPaper({
      summary: summary,
      comment: "This is really impressive literacture",
      encoded: encoded,
      info: data,
    });
    match(res, {
      onSuccess: (data) => {
        alert(data);
      },
      onError: (message) => {
        alert(message);
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
        <div className="w-full px-16  flex flex-col gap-2">
          <div className="w-full pb-4">
            <div className="border-b-1 border-sky-800 text-2xl font-extrabold text-sky-600">
              Let's Summarize Academic Paper!
            </div>
          </div>
          <div className="w-full flex flex-row gap-2 p-2">
            <input
              type="file"
              accept="application/pdf"
              multiple={false}
              ref={inputRef}
              onChange={handleFileChange}
              className="hidden"
            />
            <button
              className="w-10 h-10 flex flex-col justify-center items-center rounded-lg p-1 bg-sky-500 hover:border-2 hover:border-solid hover:border-sky-600"
              onClick={handleClick}
            >
              <PlusIcon className="text-white" />
            </button>
            {file && (
              <div className="h-10 flex flex-col justify-center gap-1">
                <div>{file.name}</div>
                <div>{file.size}</div>
              </div>
            )}
            {file && isValidFile(file) && (
              <button
                className="w-10 h-10 flex flex-col justify-center items-center rounded-lg p-1 bg-sky-500 hover:border-2 hover:border-solid hover:border-sky-600"
                onClick={summarize}
              >
                <SubmitIcon className="text-white" />
              </button>
            )}
          </div>
          <div className="w-full rounded-xl text-center shadow-sm px-8 flex flex-col gap-2">
            {summary ? (
              <div>{summary}</div>
            ) : (
              <div>Let's upload a paper first!</div>
            )}
          </div>

          {summary && (
            <div className="w-full flex flex-row justify-end">
              <SubmitForm
                trigger={<Button>Save document!</Button>}
                submitFunction={add}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
