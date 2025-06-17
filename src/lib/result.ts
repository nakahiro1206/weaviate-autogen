import { z, ZodTypeAny } from "zod";

const MessageSchema = z.object({
    message: z.string(),
})

export type Result<T> = {
    type: 'success'
     data: T;
 } | {
     type: 'error'
     message: string;
 }
 
 export const Ok = <T>(data: T): Result<T> => ({
     type: 'success',
     data
 })
 
 export const Err = <T>(message: string): Result<T> => ({
     type: 'error',
     message
 })
 
export const match = <T, K>(
  result: Result<T>,
  callback: {
    onSuccess: (data: T) => K;
    onError: (message: string) => K;
  }
): K => {
    switch (result.type) {
        case "success":
            return callback.onSuccess(result.data);
        case "error":
            return callback.onError(result.message);
    }
};

export const transform = <T, K>(result: Result<T>, callback: {
    onSuccess: (data: T) => Result<K>;
    onError: (message: string) => Result<K>;
}) => {
    if (result.type === "success") {
        return callback.onSuccess(result.data);
    } else {
        return callback.onError(result.message);
    }
}

export const tryCatch = <T>(fn: () => T): Result<T> => {
    try {
        return Ok(fn());
    } catch (err) {
        const parsed = MessageSchema.safeParse(err);
        if (!parsed.success) {
            return Err(`Unknown error: ${err}`);
        }
        return Err(parsed.data.message);
    }
}
type s = Omit<RequestInit, "body" | "method">;
export const safeFetch = async<Schema extends ZodTypeAny>(
    target: string, 
    zodSchema: Schema,
    url: string | URL | globalThis.Request, init?: RequestInit
): Promise<Result<z.infer<Schema>>> => {
    try {
        const res = await fetch(url, init)
        if (!res.ok) {
            return Err(`Failed to fetch ${target}: ${res.statusText}`);
        }
        const data = await res.json();
        const parsed = zodSchema.safeParse(data);
        if (!parsed.success) {
            return Err(`Failed to parse ${target}: ${parsed.error}`);
        }
        return Ok(parsed.data);
    } catch (err) {
        const parsed = MessageSchema.safeParse(err);
        if (!parsed.success) {
            return Err(`Network error when fetching ${target}: unknown error`);
        }
        return Err(`Network error when fetching ${target}: ${parsed.data.message}`);
    }
}