import {
  FC,
  Suspense,
} from "react";
import { Sidebar, SidebarSkeleton } from "../sidebar/sidebar";
import { PaperDescription } from "./paper";
import { Upload } from "./upload";
import { RetrievedPaperEntry } from "@/models/paper";
import { useState } from "react";
import { cn } from "@/lib/utils";

export const Summarize: FC = () => {
  const [selectedPaper, setSelectedPaper] = useState<RetrievedPaperEntry | null>(null);
  const [isNewChat, setIsNewChat] = useState(false);
  const handlePaperSelect = (paper: RetrievedPaperEntry | null) => {
    setSelectedPaper(paper);
    setIsNewChat(false);
  };

  const handleNewChatClick = () => {
    setIsNewChat(true);
    setSelectedPaper(null);
  }

  const closeNewChat = () => {
    setIsNewChat(false);
  }

  const closePaperDescription = () => {
    setSelectedPaper(null);
  }

  return (
    <div className="w-full flex">
      <Sidebar 
        onPaperSelect={handlePaperSelect} 
        selectedPaperId={selectedPaper?.metadata.uuid || null}
        isNewChat={isNewChat}
        onNewChatClick={handleNewChatClick}
      />
      {
        isNewChat && (
          <div className="w-3/4 h-[calc(100vh)] flex flex-col gap-2 p-4">
            <div className="w-full px-16 flex flex-col gap-2 flex-1 overflow-hidden">
              <Upload closeNewChat={closeNewChat}/>
            </div>
          </div>
        )
      }
      {
        selectedPaper && (
          <div className="w-3/4 h-[calc(100vh)] flex flex-col gap-2 p-4">
            <div className="w-full px-16 flex flex-col gap-2 flex-1 overflow-hidden">
              <PaperDescription paper={selectedPaper} closePaperDescription={closePaperDescription}/>
            </div>
          </div>
        )
      }
    </div>
  );
}
