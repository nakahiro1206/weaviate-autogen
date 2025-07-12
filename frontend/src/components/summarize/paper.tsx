import { RetrievedPaperEntry } from "@/models/paper";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ReactMarkdown from "react-markdown";
import { FileTextIcon, XIcon, SearchIcon } from "lucide-react";
import { Button } from "../ui/button";
import { useGetPaperChunksByPaperIdWithLimitSuspense, useSearchChunkSimilarSuspense } from "@/hooks/chunk";
import { Suspense, useRef, useState } from "react";
import { useCreateChunkMutation } from "@/hooks/chunk";
import { toast } from "sonner";
import { Spinner } from "../ui/spinner";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../ui/accordion";
import { Input } from "../ui/input";

type PaperDescriptionProps = {
    paper: RetrievedPaperEntry;
    closePaperDescription: () => void;
}

type ChunkSectionProps = {
    paper: RetrievedPaperEntry;
    paperId: string;
}

type SimilarChunksSectionProps = {
    paper: RetrievedPaperEntry;
    paperId: string;
}

const SimilarChunksSection = ({ paper, paperId }: SimilarChunksSectionProps) => {
    const searchQueryRef = useRef<HTMLInputElement>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const { chunks: similarChunks, refetch: refetchSimilarChunks } = useSearchChunkSimilarSuspense(paperId, searchQuery, 10);

    const handleSearch = () => {
        if (! searchQueryRef.current) {
            return;
        }
        const query = searchQueryRef.current.value.trim();
        if (query === '') {
            return;
        }
        setSearchQuery(query);
    };

    const { chunks, refetch} = useGetPaperChunksByPaperIdWithLimitSuspense(paperId);
    const { mutate, isPending } = useCreateChunkMutation();

    const handleCreateChunk = () => {
        mutate({
            paperEntry: paper,
            paperEntryUuid: paperId,
        },{
            onSuccess: (result) => {
                if (result.type === "success") {
                    toast.success(`${result.data.length} chunks created successfully`);
                    refetch();
                } else {
                    toast.error(result.message);
                }
            },
        });
    }

    if (chunks.length === 0) {
        return (
            <div>
                <div>No chunks found</div>
                <Button disabled={isPending} variant="outline" className="w-full" onClick={handleCreateChunk}>
                    {isPending ? <Spinner /> : <FileTextIcon className="w-4 h-4 mr-2" />}
                    Create Chunks
                </Button>
            </div>
        )
    }

    return (
        <div className="w-full pb-4">
            <div className="border-b-1 border-sky-800 text-xl font-bold text-sky-600 mb-4">
                Similar Chunks Search
            </div>
            <div className="flex gap-2 mb-4">
                <Input
                    ref={searchQueryRef}
                    placeholder="Enter search query..."
                    className="flex-1"
                />
                <Button onClick={handleSearch} variant="outline" size="icon">
                    <SearchIcon className="w-4 h-4" />
                </Button>
            </div>
            <div className="space-y-3">
                {similarChunks.length === 0 ? (
                    <p className="text-sm text-gray-500">No similar chunks found</p>
                ) : (
                    similarChunks.map((chunk, index) => (
                        <Card key={chunk.metadata.uuid} className="p-3">
                            <CardContent className="p-0">
                                <div className="flex justify-between items-start mb-2">
                                    <span className="text-xs text-gray-500">Chunk {index + 1}</span>
                                    <span className="text-xs text-gray-500">Distance: {chunk.metadata.distance?.toFixed(3)}</span>
                                </div>
                                <p className="text-sm text-gray-700">{chunk.text}</p>
                                {chunk.paperTitle && (
                                    <p className="text-xs text-gray-500 mt-2">
                                        From: {chunk.paperTitle}
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
};

export const PaperDescription = ({ paper, closePaperDescription }: PaperDescriptionProps) => {
    return (
        <Card className="w-full space-y-6 h-full overflow-y-auto">
            <CardHeader>
                <Button variant="ghost" className="rounded-lg" size="icon" onClick={closePaperDescription}>
                    <XIcon className="w-4 h-4" />
                </Button>
            </CardHeader>
            <CardContent>
                <div className="w-full pb-4">
                    <div className="border-b-1 border-sky-800 text-2xl font-extrabold text-sky-600">
                        Paper Description
                    </div>
                </div>
                <Accordion type="single" collapsible>
                    <AccordionItem value="paper" className="border-b-0">
                        <AccordionTrigger>
                            <CardTitle className="text-lg font-semibold text-sky-800 mb-2">{paper.info.title}</CardTitle>
                        </AccordionTrigger>
                        <AccordionContent>
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
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
                <Button variant="outline" className="w-full"
                onClick={() => {
                    window.open(`/papers/${paper.metadata.uuid}/pdf`, '_blank');
                }}>
                    <FileTextIcon className="w-4 h-4 mr-2" />
                    View Paper
                </Button>
                <Suspense fallback={<div>Loading similar chunks...</div>}>
                    <SimilarChunksSection paper={paper} paperId={paper.metadata.uuid} />
                </Suspense>
            </CardContent>
        </Card>
    )
}