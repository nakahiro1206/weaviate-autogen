import { 
  mapZodSchemaToWeaviateProperties, 
  adaptObjectToWeaviateProperties, 
  validateAndAdaptObject,
  createObjectAdapter 
} from './map';
import { PaperEntrySchema, PaperInfoSchema } from '@/models/paper';
import { PaperChunkSchema } from '@/models/chunk';
import { z } from 'zod';

// Example: Inserting a paper into Weaviate
export const insertPaperExample = async (client: any) => {
  // 1. Get the collection
  const collection = client.collections.get("Paper");
  
  // 2. Create a paper object (this would come from your application)
  const paperData: z.infer<typeof PaperEntrySchema> = {
    summary: "This paper discusses the application of machine learning in natural language processing.",
    comment: "Very relevant to our research",
    encoded: "base64encodedpdfcontent",
    fullText: "Full text content of the research paper...",
    info: {
      type: "journal",
      id: "doi:10.1234/example.2023.001",
      abstract: "Abstract of the research paper...",
      title: "Machine Learning Applications in NLP",
      author: "Jane Smith",
      journal: "Computational Linguistics",
      volume: "45",
      number: "2",
      pages: "123-145",
      year: "2023",
      publisher: "MIT Press"
    }
  };
  
  // 3. Adapt the object to Weaviate format
  const adaptedPaper = adaptObjectToWeaviateProperties(PaperEntrySchema, paperData);
  
  // 4. Insert into Weaviate
  const result = await collection.data.insert(adaptedPaper);
  console.log("Paper inserted:", result);
  
  return result;
};

// Example: Inserting with validation
export const insertPaperWithValidation = async (client: any, rawData: unknown) => {
  const collection = client.collections.get("Paper");
  
  // Validate and adapt the raw data
  const validation = validateAndAdaptObject(PaperEntrySchema, rawData);
  
  if (validation.success) {
    // Data is valid, insert it
    const result = await collection.data.insert(validation.data);
    console.log("Paper inserted successfully:", result);
    return result;
  } else {
    // Handle validation errors
    console.error("Validation failed:", validation.error);
    throw new Error(`Invalid paper data: ${validation.error}`);
  }
};

// Example: Using type-safe adapter
export const insertPaperWithAdapter = async (client: any) => {
  const collection = client.collections.get("Paper");
  
  // Create a type-safe adapter
  const paperAdapter = createObjectAdapter(PaperEntrySchema);
  
  // Type-safe paper object (TypeScript will ensure it matches the schema)
  const paperData: z.infer<typeof PaperEntrySchema> = {
    summary: "Another research paper",
    comment: "Interesting findings",
    encoded: "base64content",
    fullText: "Full content...",
    info: {
      type: "conference",
      id: "conf-2023-001",
      title: "Conference Paper Title",
      author: "John Doe",
      year: "2023"
    }
  };
  
  // Adapt using the type-safe adapter
  const adapted = paperAdapter.adapt(paperData);
  
  // Insert into Weaviate
  const result = await collection.data.insert(adapted);
  console.log("Paper inserted with adapter:", result);
  
  return result;
};

// Example: Inserting chunks with adaptation
export const insertChunksExample = async (client: any) => {
  const collection = client.collections.get("PaperChunk");
  
  // Create chunk data
  const chunks: z.infer<typeof PaperChunkSchema>[] = [
    {
      text: "This is the first chunk of the paper discussing introduction.",
      paperId: "doi:10.1234/example.2023.001",
      paperTitle: "Machine Learning Applications in NLP",
      chunkIndex: 0
    },
    {
      text: "This is the second chunk discussing methodology.",
      paperId: "doi:10.1234/example.2023.001",
      paperTitle: "Machine Learning Applications in NLP",
      chunkIndex: 1
    }
  ];
  
  // Adapt each chunk
  const adaptedChunks = chunks.map(chunk => 
    adaptObjectToWeaviateProperties(PaperChunkSchema, chunk)
  );
  
  // Insert chunks
  const results = await Promise.all(
    adaptedChunks.map(chunk => collection.data.insert(chunk))
  );
  
  console.log("Chunks inserted:", results);
  return results;
};

// Example: Batch insertion with validation
export const batchInsertPapers = async (client: any, rawPapers: unknown[]) => {
  const collection = client.collections.get("Paper");
  
  const validPapers = [];
  const errors = [];
  
  // Validate and adapt each paper
  for (let i = 0; i < rawPapers.length; i++) {
    const validation = validateAndAdaptObject(PaperEntrySchema, rawPapers[i]);
    
    if (validation.success) {
      validPapers.push(validation.data);
    } else {
      errors.push(`Paper ${i}: ${validation.error}`);
    }
  }
  
  // Insert valid papers
  if (validPapers.length > 0) {
    const results = await Promise.all(
      validPapers.map(paper => collection.data.insert(paper))
    );
    console.log(`Inserted ${validPapers.length} papers successfully`);
    return { results, errors };
  } else {
    console.error("No valid papers to insert");
    return { results: [], errors };
  }
};

// Example: Creating a collection with dynamic properties
export const createDynamicCollection = async (client: any, schema: z.ZodTypeAny, name: string) => {
  // Generate properties from schema
  const properties = mapZodSchemaToWeaviateProperties(schema);
  
  // Create collection
  const collection = await client.collections.create({
    name,
    vectorizers: [
      {
        name: "textEmbedding",
        sourceProperties: ["text", "content", "summary"], // Common text fields
      },
    ],
    properties,
  });
  
  console.log(`Collection '${name}' created with properties:`, properties);
  return collection;
};

// Example: Generic data insertion function
export const insertData = async <T extends z.ZodTypeAny>(
  client: any,
  collectionName: string,
  schema: T,
  data: z.infer<T>
) => {
  const collection = client.collections.get(collectionName);
  
  // Adapt the data
  const adaptedData = adaptObjectToWeaviateProperties(schema, data);
  
  // Insert
  const result = await collection.data.insert(adaptedData);
  console.log(`Data inserted into ${collectionName}:`, result);
  
  return result;
}; 