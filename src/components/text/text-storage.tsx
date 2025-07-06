"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { TextApiHelper } from "@/lib/api-helper/text";
import { TextInfo, TextList } from "@/app/api/text/schema";

export function TextStorage() {
  const [texts, setTexts] = useState<string[]>([]);
  const [selectedText, setSelectedText] = useState<TextInfo | null>(null);
  const [textId, setTextId] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTexts();
  }, []);

  const loadTexts = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await TextApiHelper.listTexts();
      setTexts(result.texts);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load texts");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveText = async () => {
    if (!textId.trim() || !content.trim()) {
      setError("Text ID and content are required");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await TextApiHelper.saveText(textId, content);
      setTextId("");
      setContent("");
      await loadTexts();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save text");
    } finally {
      setLoading(false);
    }
  };

  const handleGetText = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      const textInfo = await TextApiHelper.getText(id);
      setSelectedText(textInfo);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to get text");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteText = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      await TextApiHelper.deleteText(id);
      if (selectedText?.textId === id) {
        setSelectedText(null);
      }
      await loadTexts();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete text");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Text Storage</CardTitle>
          <CardDescription>
            Save, retrieve, and manage text content
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="textId" className="block text-sm font-medium mb-2">
                Text ID
              </label>
              <Input
                id="textId"
                value={textId}
                onChange={(e) => setTextId(e.target.value)}
                placeholder="Enter a unique text ID"
              />
            </div>
            <div>
              <label htmlFor="content" className="block text-sm font-medium mb-2">
                Content
              </label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Enter your text content"
                rows={4}
              />
            </div>
            <Button 
              onClick={handleSaveText} 
              disabled={loading || !textId.trim() || !content.trim()}
            >
              {loading ? "Saving..." : "Save Text"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Saved Texts</CardTitle>
            <CardDescription>
              Click on a text to view its details
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-4">Loading...</div>
            ) : texts.length === 0 ? (
              <div className="text-center py-4 text-gray-500">
                No texts saved yet
              </div>
            ) : (
              <div className="space-y-2">
                {texts.map((id) => (
                  <div
                    key={id}
                    className="flex items-center justify-between p-3 border rounded hover:bg-gray-50"
                  >
                    <button
                      onClick={() => handleGetText(id)}
                      className="flex-1 text-left hover:text-blue-600"
                    >
                      {id}
                    </button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteText(id)}
                      disabled={loading}
                    >
                      Delete
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {selectedText && (
          <Card>
            <CardHeader>
              <CardTitle>Text Details</CardTitle>
              <CardDescription>
                Information about the selected text
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Text ID</label>
                <p className="text-sm text-gray-600">{selectedText.textId}</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Size</label>
                <p className="text-sm text-gray-600">{selectedText.size} bytes</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Created</label>
                <p className="text-sm text-gray-600">
                  {new Date(selectedText.createdAt).toLocaleString()}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Updated</label>
                <p className="text-sm text-gray-600">
                  {new Date(selectedText.updatedAt).toLocaleString()}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Content</label>
                <div className="p-3 bg-gray-50 rounded border text-sm max-h-40 overflow-y-auto">
                  {selectedText.content}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
} 