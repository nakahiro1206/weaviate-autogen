// from typing import List

// def word_splitter(source_text: str) -> List[str]:
//     import re
//     source_text = re.sub("\s+", " ", source_text)  # Replace multiple whitespces
//     return re.split("\s", source_text)  # Split by single whitespace

// def get_chunks_fixed_size_with_overlap(text: str, chunk_size: int, overlap_fraction: float) -> List[str]:
//     text_words = word_splitter(text)
//     overlap_int = int(chunk_size * overlap_fraction)
//     chunks = []
//     for i in range(0, len(text_words), chunk_size):
//         chunk = " ".join(text_words[max(i - overlap_int, 0): i + chunk_size])
//         chunks.append(chunk)
//     return chunks

// def get_chunks_by_paragraph(source_text: str) -> List[str]:
//     return source_text.split("\n\n")

// def get_chunks_by_paragraph_and_min_length(source_text: str) -> List[str]:
//     chunks = source_text.split("\n==")

//     # Chunking
//     new_chunks = list()
//     chunk_buffer = ""
//     min_length = 25

//     for chunk in chunks:
//         new_buffer = chunk_buffer + chunk  # Create new buffer
//         new_buffer_words = new_buffer.split(" ")  # Split into words
//         if len(new_buffer_words) < min_length:  # Check whether buffer length too small
//             chunk_buffer = new_buffer  # Carry over to the next chunk
//         else:
//             new_chunks.append(new_buffer)  # Add to chunks
//             chunk_buffer = ""

//     if len(chunk_buffer) > 0:
//         new_chunks.append(chunk_buffer)  # Add last chunk, if necessary
//     return new_chunks

// def build_chunk_objs(book_text_obj, chunks):
//     chunk_objs = list()
//     for i, c in enumerate(chunks):
//         chunk_obj = {
//             "chapter_title": book_text_obj["chapter_title"],
//             "filename": book_text_obj["filename"],
//             "chunk": c,
//             "chunk_index": i
//         }
//         chunk_objs.append(chunk_obj)
//     return chunk_objs

interface BookTextObject {
  chapter_title: string;
  filename: string;
}

interface ChunkObject extends BookTextObject {
  chunk: string;
  chunk_index: number;
}

/**
 * Splits text into words, handling multiple whitespaces
 */
export function wordSplitter(sourceText: string): string[] {
  return sourceText.replace(/\s+/g, ' ').split(' ');
}

/**
 * Creates chunks of fixed size with overlap
 */
export function getChunksFixedSizeWithOverlap(
  text: string,
  chunkSize: number,
  overlapFraction: number
): string[] {
  const textWords = wordSplitter(text);
  const overlapInt = Math.floor(chunkSize * overlapFraction);
  const chunks: string[] = [];

  for (let i = 0; i < textWords.length; i += chunkSize) {
    const start = Math.max(i - overlapInt, 0);
    const end = i + chunkSize;
    const chunk = textWords.slice(start, end).join(' ');
    chunks.push(chunk);
  }

  return chunks;
}

export function getChunksMaxChunkWithOverlap(
  text: string,
  maxChunk: number, // max number of words in a chunk
  overlapFraction: number
): string[] {
  const textWords = wordSplitter(text);
  const estimatedChunkSize = Math.floor(textWords.length / maxChunk);
  const overlapInt = Math.floor(estimatedChunkSize * overlapFraction);
  const chunks: string[] = [];

  for (let i = 0; i < maxChunk; i += maxChunk) {
    const start = Math.max(estimatedChunkSize * i - overlapInt, 0);
    const end = Math.min(estimatedChunkSize * (i + 1), textWords.length);
    const chunk = textWords.slice(start, end).join(' ');
    chunks.push(chunk);
  }

  return chunks;
}

/**
 * Splits text into chunks by paragraphs
 */
export function getChunksByParagraph(sourceText: string): string[] {
  return sourceText.split('\n\n');
}

/**
 * Splits text into chunks by paragraphs with minimum length requirement
 */
export function getChunksByParagraphAndMinLength(sourceText: string): string[] {
  const chunks = sourceText.split('\n==');
  const newChunks: string[] = [];
  let chunkBuffer = '';
  const minLength = 25;

  for (const chunk of chunks) {
    const newBuffer = chunkBuffer + chunk;
    const newBufferWords = newBuffer.split(' ');

    if (newBufferWords.length < minLength) {
      chunkBuffer = newBuffer;
    } else {
      newChunks.push(newBuffer);
      chunkBuffer = '';
    }
  }

  if (chunkBuffer.length > 0) {
    newChunks.push(chunkBuffer);
  }

  return newChunks;
}

/**
 * Builds chunk objects from book text object and chunks
 */
export function buildChunkObjs(
  bookTextObj: BookTextObject,
  chunks: string[]
): ChunkObject[] {
  return chunks.map((chunk, index) => ({
    ...bookTextObj,
    chunk,
    chunk_index: index,
  }));
}