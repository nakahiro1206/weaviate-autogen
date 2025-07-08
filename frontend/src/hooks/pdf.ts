import { Result } from "@/lib/result";
import { trpc } from "@/lib/trpc/client";
import { useState } from "react";
import { match } from "@/lib/result";

type UseParsePdfMutationProps = {
    onSuccess?: (data: string) => void;
    onError?: (error: {
        code: string;
        message: string;
    }) => void;
}

export const useParsePdfMutation = ({
    onSuccess: s,
    onError: e,
}: UseParsePdfMutationProps) => {
    const [text, setText] = useState<string | null>(null);
    const { mutate: m, isPending } = trpc.pdf.extractText.useMutation({
        onSuccess: (result) => {
            match(result, {
                onSuccess: (text) => {
                    setText(text);
                    s?.(text);
                },
                onError: (error) => {
                    e?.({
                        code: "RESULT_ERROR",
                        message: error,
                    });
                },
            });
        },
        onError: (error) => {
            e?.({
                code: error.data?.code || "UNKNOWN",
                message: error.message,
            });
        },
    });
    const mutate = (file: File) => {
        setText(null);
        const formData = new FormData();
        formData.append("file", file);
        m(formData);
    }
    return {
        mutate,
        text,
        setText,
        isPending,
    }
}