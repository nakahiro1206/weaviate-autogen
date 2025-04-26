export type PaperInfo = {
  title: string;
  authors: string;
  journal?: string;
  volume?: string;
  number?: string;
  pages?: string;
  year?: string;
  publisher?: string;
};

export type PaperEntry = {
  summary: string;
  comment?: string;
  metadata: {
    base64encoded: string;
  };
  citation: {
    shorthand: string; // APA format expected
    bibtex: string;
  };
  info: PaperInfo;
};
