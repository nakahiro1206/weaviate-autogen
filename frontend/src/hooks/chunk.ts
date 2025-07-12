import { trpc } from "@/lib/trpc/client";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { RetrievedPaperChunk } from "@/models/chunk";

export const useIsChunkIndexedSuspense = (paperId: string) => {
    const [isIndexed, setIsIndexed] = useState(false);
    const [result, {refetch, isError, error}] = trpc.chunk.isChunkIndexed.useSuspenseQuery({
        paperId: paperId,
    });

    useEffect(() => {
        if (isError) {
            toast.error(error.message);
        }
    }, [isError, error]);

    useEffect(() => {
        if (! result) {
            return;
        }
        if (result.type === "success") {
            setIsIndexed(result.data);
        }
    }, [result]);

    return {
        isIndexed,
        refetch,
        isError,
        error,
    };
}

export const useGetPaperChunksByPaperIdWithLimitSuspense = (paperId: string, limit: number = 20) => {
    const [chunks, setChunks] = useState<RetrievedPaperChunk[]>([]);
    const [result, {refetch, isError, error}] = trpc.chunk.getPaperChunksByPaperIdWithLimit.useSuspenseQuery({
        paperId: paperId,
        limit: limit,
    });

    useEffect(() => {
        if (isError) {
            toast.error(error.message);
        }
    }, [isError, error]);

    useEffect(() => {
        if (! result) {
            return;
        }
        if (result.type === "success") {
            setChunks(result.data);
        }
    }, [result]);

    return {
        chunks,
        refetch,
        isError,
        error,
    };
}

export const useCreateChunkMutation = () => {
    const {mutate, isError, error, isPending} = trpc.chunk.createChunk.useMutation();
    useEffect(() => {
        if (isError) {
            toast.error(error.message);
        }
    }, [isError, error]);

    return {
        mutate,
        isPending,
    }
}

export const useSearchChunkSimilarSuspense = (uuid: string, query: string, limit: number = 20) => {
    const [chunks, setChunks] = useState<RetrievedPaperChunk[]>([]);
    const [result, {refetch, isError, error}] = trpc.chunk.searchChunkSimilar.useSuspenseQuery({
        uuid: uuid,
        query: query,
        limit: limit,
    });

    useEffect(() => {
        if (isError) {
            toast.error(error.message);
        }
    }, [isError, error]);
    
    useEffect(() => {
        if (! result) {
            return;
        }
        if (result.type === "success") {
            setChunks(result.data);
        }
    }, [result]);

    return {
        chunks,
        refetch,
        isError,
        error,
    };
}