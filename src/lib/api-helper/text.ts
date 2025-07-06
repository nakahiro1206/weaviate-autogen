import { TextInfo, TextList, SaveTextInput } from "@/app/api/text/schema";

const API_BASE = "/api/text";

export class TextApiHelper {
  static async listTexts(): Promise<TextList> {
    const response = await fetch(API_BASE);
    if (!response.ok) {
      throw new Error(`Failed to list texts: ${response.statusText}`);
    }
    return response.json();
  }

  static async getText(textId: string): Promise<TextInfo> {
    const response = await fetch(`${API_BASE}?textId=${encodeURIComponent(textId)}`);
    if (!response.ok) {
      throw new Error(`Failed to get text: ${response.statusText}`);
    }
    return response.json();
  }

  static async saveText(textId: string, content: string): Promise<{ message: string; textId: string; filePath: string }> {
    const input: SaveTextInput = { textId, content };
    const response = await fetch(API_BASE, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
    });
    if (!response.ok) {
      throw new Error(`Failed to save text: ${response.statusText}`);
    }
    return response.json();
  }

  static async deleteText(textId: string): Promise<{ message: string; textId: string }> {
    const response = await fetch(API_BASE, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ textId }),
    });
    if (!response.ok) {
      throw new Error(`Failed to delete text: ${response.statusText}`);
    }
    return response.json();
  }
} 