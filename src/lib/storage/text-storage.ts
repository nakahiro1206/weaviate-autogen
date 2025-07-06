import fs from 'fs/promises';
import path from 'path';
import { Err, Ok, Result } from '@/lib/result';
import { getStoragePath } from '@/config/storage';

export class TextStorage {
  private baseDir: string;

  constructor(baseDir: string) {
    this.baseDir = baseDir;
  }

  async initialize(): Promise<Result<void>> {
    try {
      await fs.mkdir(this.baseDir, { recursive: true });
      return Ok(undefined);
    } catch (err) {
      return Err(`Failed to initialize text storage: ${err}`);
    }
  }

  async saveText(textId: string, content: string): Promise<Result<string>> {
    try {
      const filePath = path.join(this.baseDir, `${textId}.txt`);
      await fs.writeFile(filePath, content, 'utf-8');
      return Ok(filePath);
    } catch (err) {
      return Err(`Failed to save text: ${err}`);
    }
  }

  async readText(textId: string): Promise<Result<string>> {
    try {
      const filePath = path.join(this.baseDir, `${textId}.txt`);
      const content = await fs.readFile(filePath, 'utf-8');
      return Ok(content);
    } catch (err) {
      return Err(`Failed to read text: ${err}`);
    }
  }

  async deleteText(textId: string): Promise<Result<void>> {
    try {
      const filePath = path.join(this.baseDir, `${textId}.txt`);
      await fs.unlink(filePath);
      return Ok(undefined);
    } catch (err) {
      return Err(`Failed to delete text: ${err}`);
    }
  }

  async listTexts(): Promise<Result<string[]>> {
    try {
      const files = await fs.readdir(this.baseDir);
      const textFiles = files.filter(file => file.endsWith('.txt'));
      const textIds = textFiles.map(file => file.replace('.txt', ''));
      return Ok(textIds);
    } catch (err) {
      return Err(`Failed to list texts: ${err}`);
    }
  }

  async textExists(textId: string): Promise<Result<boolean>> {
    try {
      const filePath = path.join(this.baseDir, `${textId}.txt`);
      await fs.access(filePath);
      return Ok(true);
    } catch (err) {
      return Ok(false);
    }
  }
}

export const textStorage = (() => {
  const storage = new TextStorage(path.join(getStoragePath(), 'texts'));
  storage.initialize()
  .then((result) => {
    if (result.type === "error") {
      console.error("Failed to initialize text storage", result.message);
    }
  })
  .catch((err) => {
    console.error("Failed to initialize text storage", err);
  });
  return storage;
})(); 