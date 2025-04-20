import { client } from "./client";

// Helper: Create class schema for academic papers
export const createSchema = async () => {
  const classObj = {
    class: "Paper",
    vectorizer: "none", // we handle vectors externally
    properties: [
      { name: "title", dataType: ["text"] },
      { name: "abstract", dataType: ["text"] },
      { name: "authors", dataType: ["text"] },
      { name: "comments", dataType: ["text"] },
      { name: "encoded", dataType: ["text"] },
    ],
  };

  try {
    await client.schema.classCreator().withClass(classObj).do();
    console.log("Schema created.");
  } catch (e: any) {
    console.error("Schema error:", e.message);
  }
};
