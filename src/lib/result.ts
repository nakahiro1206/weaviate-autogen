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
