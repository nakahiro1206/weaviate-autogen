export type ParsePdfInput = {
  file: File;
};

export type ParsePdfOutput = {
  __typename: "ParsePdfOutput";
  text: string;
};

export type Err = {
  __typename: "Err";
  message: string;
};

export const parsePDF = async (
  input: ParsePdfInput,
): Promise<ParsePdfOutput | Err> => {
  const { file } = input;

  const formData = new FormData();
  formData.append("file", file);

  try {
    const res = await fetch("/api/parse-pdf", {
      method: "POST",
      body: formData,
    });
    if (!res.ok) {
      throw new Error("Network response was not ok");
    }
    const data = (await res.json()) as ParsePdfOutput;
    return data;
  } catch (error) {
    console.error(error);
    return {
      __typename: "Err",
      message: "Failed to parse PDF",
    };
  }
};
