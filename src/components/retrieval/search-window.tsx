import { useRef } from "react";
import { RetrieveResult } from "@/domain/entities/paper";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Props = {
    targetPaper: RetrieveResult;
}
export const SearchWindow: React.FC<Props> = ({ targetPaper }) => {
    const searchRef = useRef<HTMLTextAreaElement>(null);

    const handleSearch = () => {
        const query = searchRef.current?.value;
        console.log(query);
    }
    return (
        <div className="w-1/2 h-[calc(100vh)] flex flex-col gap-2 p-4 bg-gray-100">
            <Card>
                <CardHeader>
                    <CardTitle>
                        Search for {targetPaper.info.title}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-sky-600">
                        Search for {targetPaper.info.title}
                    </div>
                </CardContent>
            </Card>
                <div className="w-full flex flex-row gap-2">
                    <textarea
                        ref={searchRef}
                        className="w-4/5 h-12 rounded-lg text-left text-sky-800 shadow-sm p-2 focus:outline-1 focus:outline-sky-600 resize-none appearance-none"
                    />
                    <div className="w-1/5 h-12 rounded-lg text-center text-white shadow-sm bg-sky-500">
                        <button
                            className="w-full h-full flex items-center justify-center"
                            onClick={handleSearch}
                        >
                            Search!
                        </button>
                    </div>
                </div>
            </div>
  );
};