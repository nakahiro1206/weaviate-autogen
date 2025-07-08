import fs from 'fs/promises';
import path from 'path';
import { Err, Ok, Result } from '@/lib/result';
import { getStoragePath } from '@/config/storage';

// this functionality involves initialize() operation, so it would be better
// to be declared as a class rather than a exported function
export class FileStorage {
  private baseDir: string;

  constructor(baseDir: string) {
    this.baseDir = baseDir;
  }

  async initialize(): Promise<Result<void>> {
    try {
      await fs.mkdir(this.baseDir, { recursive: true });
      return Ok(undefined);
    } catch (err) {
      return Err(`Failed to initialize file storage: ${err}`);
    }
  }

  async saveFile(fileId: string, base64Encoded: string): Promise<Result<string>> {
    try {
      const filePath = path.join(this.baseDir, `${fileId}.pdf`);
      const data = Buffer.from(base64Encoded, 'base64');
      await fs.writeFile(filePath, data);
      return Ok(filePath);
    } catch (err) {
      return Err(`Failed to save file: ${err}`);
    }
  }

  async readFile(fileId: string): Promise<Result<Buffer>> {
    try {
      const filePath = path.join(this.baseDir, `${fileId}.pdf`);
      const data = await fs.readFile(filePath);
      return Ok(data);
    } catch (err) {
      return Err(`Failed to read file: ${err}`);
    }
  }

  async deleteFile(fileId: string): Promise<Result<void>> {
    try {
      const filePath = path.join(this.baseDir, `${fileId}.pdf`);
      await fs.unlink(filePath);
      return Ok(undefined);
    } catch (err) {
      return Err(`Failed to delete file: ${err}`);
    }
  }
} 

export const fileStorage = (() => {
  const storage = new FileStorage(getStoragePath());
  storage.initialize()
  .then((result) => {
    if (result.type === "error") {
      console.error("Failed to initialize file storage", result.message);
    }
  })
  .catch((err) => {
    console.error("Failed to initialize file storage", err);
  });
  return storage;
})();