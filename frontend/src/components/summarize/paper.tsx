import { RetrievedPaperEntry } from "@/models/paper";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ReactMarkdown from "react-markdown";
import { FileTextIcon, XIcon } from "lucide-react";
import { Button } from "../ui/button";
import { useGetPaperChunksByPaperIdWithLimitSuspense } from "@/hooks/chunk";
import { Suspense } from "react";
import { useCreateChunkMutation } from "@/hooks/chunk";
import { toast } from "sonner";
import { Spinner } from "../ui/spinner";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../ui/accordion";

type PaperDescriptionProps = {
    paper: RetrievedPaperEntry;
    closePaperDescription: () => void;
}

type ChunkSectionProps = {
    paper: RetrievedPaperEntry;
    paperId: string;
}
const ChunkSection = ({ paper, paperId }: ChunkSectionProps) => {
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
            {chunks.map((chunk) => (
                <div key={chunk.metadata.uuid}>
                    <p className="text-sm text-gray-600 mb-2">{chunk.text}</p>
                </div>
            ))}
        </div>
    )
}

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
                <Suspense fallback={<div>Loading...</div>}>
                    <ChunkSection paper={paper} paperId={paper.metadata.uuid} />
                </Suspense>
            </CardContent>
        </Card>
    )
}