import { trpc } from "@/lib/trpc/client";
import { useEffect, useState } from "react";
import { RetrievedPaperEntry } from "@/models/paper";
import { toast } from "sonner";
import { getPaperText } from "@/lib/api-helper/paper";
import { TextInfo } from "@/app/papers/[id]/text/schema";

export const useGetPapersWithLimitSuspense = (limit: number = 20) => {
    const [papers, setPapers] = useState<RetrievedPaperEntry[]>([]);
    const [result, {refetch, isError, error}] = trpc.paper.getPapersWithLimit.useSuspenseQuery({ limit });

    useEffect(() => {
        if (! result) {
            return;
        }
        if (result.type === "success") {
            setPapers(result.data);
        } else {
            setPapers([]);
            toast.error(result.message);
        }
    }, [result]);

    useEffect(() => {
        if (isError) {
            toast.error(error.message);
        }
    }, [error]);

    return { papers, refetch, isError, error };
};

export const useGetPapersNearTextSuspense = (searchQuery: string) => {
    const [papers, setPapers] = useState<RetrievedPaperEntry[]>([]);
    const [result, {refetch, isError, error}] = trpc.paper.getPapersNearText.useSuspenseQuery({ text: searchQuery });

    useEffect(() => {
        if (! result) {
            return;
        }
        if (result.type === "success") {
            console.log(result.data.map((item) => item.metadata.distance));
            setPapers(result.data);
        } else {
            setPapers([]);
            toast.error(result.message);
        }
    }, [result]);

    useEffect(() => {
        if (isError) {
            toast.error(error.message);
        }
    }, [error]);

    return { papers, refetch, isError, error };
};

export const useGetPaperById = (id: string | null) => {
    const { data: result, isLoading, error, refetch } = trpc.paper.getPaperById.useQuery(
        { id: id! },
        { 
            enabled: !!id,
            retry: false 
        }
    );

    useEffect(() => {
        if (error) {
            toast.error(error.message);
        }
    }, [error]);

    return { 
        paper: result?.type === "success" ? result.data : null, 
        isLoading, 
        error, 
        refetch 
    };
};

export const useGetPaperText = (id: string | null) => {
    const [textInfo, setTextInfo] = useState<TextInfo | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!id) {
            setTextInfo(null);
            setError(null);
            return;
        }

        setIsLoading(true);
        setError(null);

        getPaperText(id).then(result => {
            if (result.type === "success") {
                setTextInfo(result.data);
            } else {
                setError(result.message);
                toast.error(result.message);
            }
            setIsLoading(false);
        });
    }, [id]);

    return { textInfo, isLoading, error };
};