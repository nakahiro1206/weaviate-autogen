import { z } from "zod";
export const  UnknownResultSchema = z.union([
    z.object({
        type: z.literal('success'),
        data: z.unknown(),
    }),
    z.object({
        type: z.literal('error'),
        message: z.string(),
    })])
export type UnknownResult = z.infer<typeof UnknownResultSchema>;

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
 
export const match = <T>(
  result: Result<T>,
  callback: {
    onSuccess: (data: T) => void;
    onError: (message: string) => void;
  }
) => {
  if (result.type === "success") {
    callback.onSuccess(result.data);
  } else {
    callback.onError(result.message);
  }
};


export const maybe = (unknown: unknown): Result<unknown> => {
    const result = UnknownResultSchema.safeParse(unknown);
    if (!result.success) {
        return Err(result.error.message);
    }
    switch (result.data.type) {
        case 'success':
            return Ok(result.data.data);
        case 'error':
            return Err(result.data.message);
    }
}