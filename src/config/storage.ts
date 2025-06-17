import path from 'path';

// Use environment variable for storage path, default to ./storage in the project root
export const STORAGE_PATH = process.env.STORAGE_PATH || path.join(process.cwd(), 'storage');

// Ensure the path is absolute
export const getStoragePath = () => {
  return path.isAbsolute(STORAGE_PATH) ? STORAGE_PATH : path.resolve(process.cwd(), STORAGE_PATH);
}; 