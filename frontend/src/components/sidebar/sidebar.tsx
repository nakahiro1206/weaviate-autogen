import { useGetPapersNearTextSuspense } from "@/hooks/paper";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "../ui/button";
import { RetrievedPaperEntry } from "@/models/paper";
import { cn } from "@/lib/utils";
import { Input } from "../ui/input";
import { SearchIcon } from "lucide-react";
import { FC, Suspense, useRef, useState } from "react";
import { Badge } from "../ui/badge";

export const SidebarSkeleton = () => {
    return (
        <div className="w-full h-[calc(100vh)] flex flex-col gap-2 p-4 bg-gray-100">
            {Array.from({ length: 5 }).map((_, index) => (
                <Skeleton key={index} className="w-full h-12 rounded-lg text-center shadow-sm bg-white" />
            ))}
        </div>
    )
}

interface SidebarProps {
    onPaperSelect: (paper: RetrievedPaperEntry | null) => void;
    selectedPaperId: string | null;
    isNewChat: boolean;
    onNewChatClick: () => void;
}

type SearchResultProps = {
    searchQuery: string;
    selectedPaperId: string | null;
    onPaperSelect: (paper: RetrievedPaperEntry | null) => void;
}

const SearchResult: FC<SearchResultProps> = ({ searchQuery, selectedPaperId, onPaperSelect }) => {
    const { papers, refetch, isError, error } = useGetPapersNearTextSuspense(searchQuery);  
    return (
        <>
        {papers.map((item, index) => {
          const isSelected = selectedPaperId === item.metadata.uuid;
          if (item.metadata.distance) {
            return (
                <div key={index} className="w-full h-12 space-x-2">
                    <Badge variant="outline" className="w-12 h-12 rounded-lg text-center shadow-sm bg-sky-100">
                        {item.metadata.distance.toFixed(2)}
                    </Badge>
                    <Button
                    variant="outline"
                    className={cn(
                        'w-[calc(100%-3.5rem)] h-12 rounded-lg shadow-sm hover:cursor-pointer',
                        isSelected ? 'bg-sky-200 border-2 border-sky-400' : ''
                    )}
                    onClick={() => onPaperSelect(item)}
                    >
                        <p className="w-full truncate whitespace-nowrap overflow-hidden text-blue-500">
                        {item.info.title}
                        </p>
                    </Button>
                </div>
              );
          }
          return (
            <Button
              key={index}
              variant="outline"
              className={cn(
                'w-full h-12 rounded-lg text-left shadow-sm justify-start truncate hover:cursor-pointer',
                isSelected ? 'bg-sky-200 border-2 border-sky-400' : ''
              )}
              onClick={() => onPaperSelect(item)}
            >
                <p className="w-full truncate whitespace-nowrap overflow-hidden text-blue-500">
                {item.info.title}
                </p>
            </Button>
          );
        })}
        </>
    )
}

export const Sidebar = ({ onPaperSelect, selectedPaperId, isNewChat, onNewChatClick }: SidebarProps) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const onClickSearchButton = () => {
        setSearchQuery(inputRef.current?.value || "");
    }
    const handlePaperClick = (paper: RetrievedPaperEntry | null) => {
        onPaperSelect(paper);
    };


    return (
        <div className={cn(selectedPaperId || isNewChat ? "w-1/4" : "w-full", "h-[calc(100vh)] flex flex-col gap-2 p-4 bg-gray-100 items-center")}>
        <Button onClick={onNewChatClick} variant="outline" className={cn(selectedPaperId || isNewChat ? "w-full" : "w-1/4", "h-12 rounded-lg text-center shadow-sm bg-sky-100")}>
            Upload New Paper
        </Button>
        <div className="w-full p-4 h-12 text-center gap-4 flex items-center justify-center">
          <Input type="text" placeholder="Search" ref={inputRef} />
          <Button variant="outline" className="w-12 h-12 rounded-lg text-center shadow-sm bg-sky-100"
          onClick={onClickSearchButton}>
            <SearchIcon className="w-4 h-4" />
          </Button>
        </div>
        <Suspense fallback={<SidebarSkeleton />}>
            <SearchResult searchQuery={searchQuery} selectedPaperId={selectedPaperId} onPaperSelect={handlePaperClick} />
        </Suspense>
      </div>
    );
};