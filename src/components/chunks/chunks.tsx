'use client';

import { useState, useEffect } from "react";
import { chunkUseCase } from "@/service";
import { PaperChunk } from "@/domain/entities/chunk";
import { match } from "@/lib/result";
import { toast } from "sonner";

export const Chunks = () => {
  const [chunks, setChunks] = useState<PaperChunk[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadChunks = async () => {
      const res = await chunkUseCase.fetchAllChunks();
      match(res, {
        onSuccess: (data) => {
          setChunks(data);
          setLoading(false);
        },
        onError: (msg) => {
          toast.error(msg);
          setLoading(false);
        },
      });
    };
    loadChunks();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-sky-600 mb-8">Paper Chunks Gallery</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {chunks.map((chunk, index) => (
          <div
            key={`${chunk.paperId}-${chunk.chunkIndex}`}
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-gray-800 mb-2">
                {chunk.paperTitle}
              </h2>
              <p className="text-sm text-gray-500">
                Chunk {chunk.chunkIndex + 1}
              </p>
            </div>
            <p className="text-gray-600 line-clamp-4">{chunk.text}</p>
            <button
              onClick={() => {
                navigator.clipboard.writeText(chunk.text);
                toast.success("Chunk copied to clipboard!");
              }}
              className="mt-4 text-sky-600 hover:text-sky-800 text-sm font-medium"
            >
              Copy to clipboard
            </button>
          </div>
        ))}
      </div>
    </div>
  );
} 