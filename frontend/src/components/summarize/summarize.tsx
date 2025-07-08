import {
  FC,
  Suspense,
} from "react";
import { Sidebar, SidebarSkeleton } from "../sidebar/sidebar";
import { PaperDescription } from "./paper";
import { Upload } from "./upload";
import { RetrievedPaperEntry } from "@/models/paper";
import { useState } from "react";

export const Summarize: FC = () => {
  const [selectedPaper, setSelectedPaper] = useState<RetrievedPaperEntry | null>(null);
  const handlePaperSelect = (paper: RetrievedPaperEntry | null) => {
    setSelectedPaper(paper);
    // if (paper === null) {
    //   reset();
    //   setText(null);
    //   setEncoded(null);
    //   setFile(null);
    // }
  };
  return (
    <div className="w-full flex">
      <Suspense fallback={<SidebarSkeleton />}>
        <Sidebar onPaperSelect={handlePaperSelect} selectedPaperId={selectedPaper?.metadata.uuid} />
      </Suspense>
      <div className="w-3/4 h-[calc(100vh)] flex flex-col gap-2 p-4">
        <div className="w-full px-16 flex flex-col gap-2 flex-1 overflow-hidden">          
          {/* Selected Paper Info */}
          {selectedPaper && (
            <PaperDescription paper={selectedPaper} />
          )}

          {selectedPaper === null && (
            <Upload />
          )}
          
          {/* Display selected paper's text content */}
          {/* {selectedPaperText && (
            <div className="w-full flex flex-row gap-2 p-2 line-clamp-3">
              <div className="text-sm text-gray-600">Paper Content:</div>
              <div className="flex-1">{selectedPaperText.content}</div>
            </div>
          )} */}
        </div>
      </div>
    </div>
  );
}
