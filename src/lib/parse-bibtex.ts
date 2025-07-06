import { PaperInfo } from "@/models/paper";
import {Ok, Err, Result, match} from "@/lib/result";

const parseBibTeXEntry = (bibtex: string): Result<Record<string, string>> => {
  const result: Record<string, string> = {};

  // Match the entry type and ID
  const entryHeader = bibtex.match(/^@\s*(\w+)\s*{\s*([^,]+)\s*,/s);
  if (!entryHeader) {
    return Err("ParseError: Invalid BibTeX entry header");
  }

  result.type = entryHeader[1];
  result.id = entryHeader[2];

  // Remove header and trailing brace
  const body = bibtex
    .replace(/^@\w+\s*{[^,]+,\s*/s, "")
    .replace(/\s*}\s*$/, "");

  // Match field=value pairs
  const fieldRegex = /(\w+)\s*=\s*[{"]([^"}]+)[}"]/g;
  let match: RegExpExecArray | null;

  while ((match = fieldRegex.exec(body))) {
    const key = match[1].trim();
    const value = match[2].trim();
    result[key] = value;
  }

  return Ok(result);
};

export const constructPaperInfo = (
  bibTex: string,
): Result<PaperInfo> => {
  const rec = parseBibTeXEntry(bibTex);
  return match(rec, {
    onSuccess: (data) => {
      console.log("data", data);
      const type = data.type || undefined;
      const id = data.id || undefined;
      const title = data.title || undefined;
      const author = data.author || undefined;
      const year = data.year || undefined;
      const journal = data.journal || undefined;
      const volume = data.volume || undefined;
      const pages = data.pages || undefined;
      if (title === undefined || author === undefined || type === undefined || id === undefined) {
        return Err("ConstructError: Title and authors are required");
      }
      return Ok({
        type,
        id,
        title,
        author,
        year,
        journal,
        volume,
        pages,
      });
    },
    onError: (msg) => {
      return Err(msg);
    },
  });
};
