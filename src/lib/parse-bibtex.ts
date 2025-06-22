import { PaperInfo } from "@/models/paper";

const neverReach = (_: never) => {
  throw new Error("Should not reach here");
};

type ParseSuccess = {
  __typename: "ParseSuccess";
  data: Record<string, string>;
};
type ParseError = {
  __typename: "ParseError";
  message: string;
};

const parseBibTeXEntry = (bibtex: string): ParseSuccess | ParseError => {
  const result: Record<string, string> = {};

  // Match the entry type and ID
  const entryHeader = bibtex.match(/^@\s*(\w+)\s*{\s*([^,]+)\s*,/s);
  if (!entryHeader) {
    return {
      __typename: "ParseError",
      message: "ParseError: Invalid BibTeX entry header",
    };
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

  return {
    __typename: "ParseSuccess",
    data: result,
  };
};

type ConstructSuccess = {
  __typename: "ConstructSuccess";
  data: PaperInfo;
};

type ConstructError = {
  __typename: "ConstructError";
  message: string;
};

export const constructPaperInfo = (
  bibTex: string,
): ConstructSuccess | ConstructError => {
  const rec = parseBibTeXEntry(bibTex);
  switch (rec.__typename) {
    default:
      neverReach(rec);
    case "ParseError":
      return {
        __typename: "ConstructError",
        message: `ParseError: ${rec.message}`,
      };
    case "ParseSuccess":
      const { data } = rec;
      const type = data.type || undefined;
      const id = data.id || undefined;
      const title = data.title || undefined;
      const author = data.author || undefined;
      const year = data.year || undefined;
      const journal = data.journal || undefined;
      const volume = data.volume || undefined;
      const pages = data.pages || undefined;

      if (title === undefined || author === undefined || type === undefined || id === undefined) {
        return {
          __typename: "ConstructError",
          message: "ConstructError: Title and authors are required",
        };
      }

      return {
        __typename: "ConstructSuccess",
        data: {
          type,
          id,
          title,
          author,
          year,
          journal,
          volume,
          pages,
        },
      };
  }
};
