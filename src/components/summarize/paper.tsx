import { RetrievedPaperEntry } from "@/models/paper";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ReactMarkdown from "react-markdown";

export const PaperDescription = ({ paper }: { paper: RetrievedPaperEntry }) => {
    return (
        <>
        <div className="w-full pb-4">
            <div className="border-b-1 border-sky-800 text-2xl font-extrabold text-sky-600">
                Paper Description
            </div>
        </div>
        <Card className="w-full p-4 bg-sky-50 rounded-lg border border-sky-200 h-fit overflow-y-auto">
            <CardHeader>
                <CardTitle className="text-lg font-semibold text-sky-800 mb-2">{paper.info.title}</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-gray-600 mb-2">Author: {paper.info.author}</p>
                {paper.info.journal && (
                <p className="text-sm text-gray-600 mb-2">Journal: {paper.info.journal}</p>
                )}
                {paper.info.year && (
                <p className="text-sm text-gray-600 mb-2">Year: {paper.info.year}</p>
                )}
                <div className="text-sm text-gray-700">
                    <strong>Summary:</strong>
                    <ReactMarkdown>{paper.summary}</ReactMarkdown>
                </div>
            </CardContent>
        </Card>
        </>
    )
}