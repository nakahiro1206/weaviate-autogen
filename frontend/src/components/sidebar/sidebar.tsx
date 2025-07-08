import { useGetPapersWithLimitSuspense } from "@/hooks/paper";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "../ui/button";
import { RetrievedPaperEntry } from "@/models/paper";

export const SidebarSkeleton = () => {
    return (
        <div className="w-1/4 h-[calc(100vh)] flex flex-col gap-2 p-4 bg-gray-100">
            <div className="w-full h-12 rounded-lg text-center shadow-sm bg-sky-100">
                <div className="w-full h-full flex items-center justify-center">
                    New Chat!
                </div>
            </div>
            {Array.from({ length: 20 }).map((_, index) => (
                <Skeleton key={index} className="w-full h-12 rounded-lg text-center shadow-sm bg-white" />
            ))}
        </div>
    )
}

interface SidebarProps {
    onPaperSelect?: (paper: RetrievedPaperEntry | null) => void;
    selectedPaperId?: string | null;
}

export const Sidebar = ({ onPaperSelect, selectedPaperId }: SidebarProps) => {
    const { papers, refetch, isError, error } = useGetPapersWithLimitSuspense();  

    const handlePaperClick = (paper: RetrievedPaperEntry | null) => {
        onPaperSelect?.(paper);
    };

    return (
        <div className="w-1/4 h-[calc(100vh)] flex flex-col gap-2 p-4 bg-gray-100">
        <Button onClick={() => handlePaperClick(null)} variant="outline" className="w-full h-12 rounded-lg text-center shadow-sm bg-sky-100">
            New Chat!
        </Button>
        {papers.map((item, index) => {
          const isSelected = selectedPaperId === item.metadata.uuid;
          return (
            <Button
              key={index}
              variant="outline"
              className={`w-full h-12 rounded-lg text-left shadow-sm justify-start truncate hover:cursor-pointer ${
                isSelected ? 'bg-sky-200 border-2 border-sky-400' : ''
              }`}
              onClick={() => handlePaperClick(item)}
            >
                {item.info.title}
            </Button>
          );
        })}
      </div>
    );
};