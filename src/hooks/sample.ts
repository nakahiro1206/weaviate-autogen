import { trpc } from "@/lib/trpc/client";
import { useRef, useState } from "react";

type User = {
  name: string;
  age: number;
};

export const useSample = () => {
    const inputRef = useRef<HTMLInputElement>(null);
    const [query, setQueryInternal] = useState("");
    const setQuery = () => {
        if (inputRef.current === null) {
            return;
        }
        setQueryInternal(inputRef.current.value);
    };
    const { data, isLoading, error } = trpc.hello.useQuery({ text: query },
        {
            // enabled: query.length > 0,
        }
    );

    return {
        inputRef,
        setQuery,
        data,
        isLoading,
        error,
    };
};