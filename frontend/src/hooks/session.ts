import type { paths } from "@/openapi";
import createFetchClient from "openapi-fetch";
import createClient from "openapi-react-query";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { z } from "zod";

const sessionSchema = z.object({
    session_id: z.string(),
    created_at: z.string(),
    message_count: z.number(),
    last_activity: z.string(),
});
export type Session = z.infer<typeof sessionSchema>;

const fetchClient = createFetchClient<paths>({
    baseUrl: "http://localhost:8002",
});

const $api = createClient(fetchClient);

type SessionsReturnType = {
    sessions: Session[];
    isLoading: boolean;
    error: Error | null;
    refetch: () => void;
}
export const useSessions = (): SessionsReturnType => {
    const [sessions, setSessions] = useState<Session[]>([]);
    const { data, isError, error, isLoading, refetch } = $api.useQuery("get", "/api/v1/sessions", {});

    useEffect(() => {
        if (isError) {
            toast.error(`Failed to fetch session history: ${error}`);
        }
    }, [isError, error]);

    useEffect(() => {
        const parsed = sessionSchema.array().safeParse(data);
        if (parsed.success) {
            setSessions(parsed.data);
        } else {
            toast.error(`Failed to parse session history: ${parsed.error}`);
        }
    }, [data]);

    return {
        sessions,
        isLoading,
        error,
        refetch,
    }
}

type CreateSessionReturnType = {
    mutate: (input: {
        body: {
            user_id: string;
            metadata: Record<string, unknown>;
        }
    }, callbacks?: {
        onSuccess?: (data: {
            session_id: string;
        }) => void;
        onError?: (error: Error) => void;
    }) => void;
    isPending: boolean;
    error: Error | null;
}
export const useCreateSession = (): CreateSessionReturnType => {
    const [err, setErr] = useState<Error | null>(null);
    const { mutate, isPending, error, isError } = $api.useMutation("post", "/api/v1/sessions", {});

    const m = (input: {
        body: {
            user_id: string;
            metadata: Record<string, unknown>;
        }
    }, callbacks?: {
        onSuccess?: (data: {
            session_id: string;
        }) => void;
        onError?: (error: Error) => void;
    }) => {
        mutate(input, {
            onSuccess: (data) => {
                toast.success(`Session created: ${data.session_id}`);
                callbacks?.onSuccess?.(data);
            },
            onError: (error) => {
                toast.error(`Failed to create session: ${error}`);
                setErr(new Error(`Failed to create session: ${error}`));
                callbacks?.onError?.(new Error(`Failed to create session: ${error}`));
            }
        });
    }

    useEffect(() => {
        if (isError) {
            toast.error(`Failed to create session: ${error}`); 
            setErr(new Error(`Failed to create session: ${error}`));
        }
    }, [isError, error]);

    return { mutate: m, isPending, error: err };
}
type DeleteSessionReturnType = {
    mutate: (input: {
        params: {
            path: {
                session_id: string;
            }
        }
    }, callbacks?: {
        onSuccess?: () => void;
        onError?: (error: Error) => void;
    }) => void;
    isPending: boolean;
    error: Error | null;
}
export const useDeleteSession = (): DeleteSessionReturnType => {
    const [err, setErr] = useState<Error | null>(null);
    const { mutate, isPending, error, isError } = $api.useMutation("delete", "/api/v1/sessions/{session_id}", {});

    const m = (input: {
        params: {
            path: {
                session_id: string;
            }
        }
    }, callbacks?: {
        onSuccess?: () => void;
        onError?: (error: Error) => void;
    }) => {
        mutate(input, {
            onSuccess: () => {
                toast.success(`Session deleted: ${input.params.path.session_id}`);
                callbacks?.onSuccess?.();
            },
            onError: (error) => {
                toast.error(`Failed to delete session: ${error}`);
                setErr(new Error(`Failed to delete session: ${error}`));
                callbacks?.onError?.(new Error(`Failed to delete session: ${error}`));
            }
        });
    }

    useEffect(() => {
        if (isError) {
            toast.error(`Failed to delete session: ${error}`);
            setErr(new Error(`Failed to delete session: ${error}`));
        }
    }, [isError, error]);

    return { mutate: m, isPending, error: err };
}

type SessionHistoryReturnType = {
    messages: {content: string, source: string}[];
    isLoading: boolean;
    error: Error | null;
    refetch: () => void;
}
export const useSessionHistory = (sessionId: string): SessionHistoryReturnType => {
    const [err, setErr] = useState<Error | null>(null);
    const [messages, setMessages] = useState<{content: string, source: string}[]>([]);
    const { data, isError, error, isLoading, refetch } = $api.useQuery("get", "/history", {
        params: {
            query: {
                session_id: sessionId,
            }
        }
    });

    useEffect(() => {
        if (isError) {
            toast.error(`Failed to fetch session history: ${error}`);
            setErr(new Error(`Failed to fetch session history: ${error}`));
        }
    }, [isError, error]);

    useEffect(() => {
        // cannot apply zod validation.
        if (data) {
            setMessages([])
            // TODO: fix this
            // setMessages(data.map((message: any) => JSON.stringify(message.content)));
        }
    }, [data]);

    return { messages, isLoading, error: err, refetch };
}