import { 
  adaptObjectToWeaviateProperties, 
  validateAndAdaptObject, 
  createObjectAdapter 
} from './map';
import { PaperEntrySchema, PaperInfoSchema } from '@/models/paper';
import { PaperChunkSchema } from '@/models/chunk';
import { z } from 'zod';

// Test the object adaptation functionality
console.log('Testing object adaptation...\n');

// Test with PaperInfo schema
console.log('=== PaperInfo Object Adaptation ===');
const paperInfoObj = {
  type: "journal",
  id: "12345",
  abstract: "This is an abstract",
  title: "Sample Paper Title",
  author: "John Doe",
  journal: "Science Journal",
  volume: "42",
  number: "3",
  pages: "123-145",
  year: "2023",
  publisher: "Academic Press"
};

const adaptedPaperInfo = adaptObjectToWeaviateProperties(PaperInfoSchema, paperInfoObj);
console.log('Original object:', JSON.stringify(paperInfoObj, null, 2));
console.log('Adapted object:', JSON.stringify(adaptedPaperInfo, null, 2));
console.log('\n');

// Test with PaperEntry schema (nested object)
console.log('=== PaperEntry Object Adaptation ===');
const paperEntryObj = {
  summary: "This is a summary of the paper",
  comment: "Interesting research",
  encoded: "base64encodedcontent",
  fullText: "Full text content of the paper...",
  info: {
    type: "journal",
    id: "12345",
    abstract: "This is an abstract",
    title: "Sample Paper Title",
    author: "John Doe",
    journal: "Science Journal",
    volume: "42",
    number: "3",
    pages: "123-145",
    year: "2023",
    publisher: "Academic Press"
  }
};

const adaptedPaperEntry = adaptObjectToWeaviateProperties(PaperEntrySchema, paperEntryObj);
console.log('Original object:', JSON.stringify(paperEntryObj, null, 2));
console.log('Adapted object:', JSON.stringify(adaptedPaperEntry, null, 2));
console.log('\n');

// Test with PaperChunk schema
console.log('=== PaperChunk Object Adaptation ===');
const paperChunkObj = {
  text: "This is a chunk of text from the paper",
  paperId: "12345",
  paperTitle: "Sample Paper Title",
  chunkIndex: 1
};

const adaptedPaperChunk = adaptObjectToWeaviateProperties(PaperChunkSchema, paperChunkObj);
console.log('Original object:', JSON.stringify(paperChunkObj, null, 2));
console.log('Adapted object:', JSON.stringify(adaptedPaperChunk, null, 2));
console.log('\n');

// Test with complex schema including arrays and optional fields
console.log('=== Complex Schema Object Adaptation ===');
const ComplexSchema = z.object({
  id: z.string(),
  name: z.string(),
  age: z.number().optional(),
  isActive: z.boolean(),
  tags: z.array(z.string()),
  scores: z.array(z.number()),
  metadata: z.object({
    category: z.string(),
    priority: z.number(),
    settings: z.object({
      theme: z.string(),
      notifications: z.boolean()
    })
  }),
  status: z.union([z.literal('active'), z.literal('inactive')])
});

const complexObj = {
  id: "user123",
  name: "John Doe",
  age: 30,
  isActive: true,
  tags: ["developer", "typescript", "weaviate"],
  scores: [95, 87, 92],
  metadata: {
    category: "premium",
    priority: 1,
    settings: {
      theme: "dark",
      notifications: true
    }
  },
  status: "active" as const
};

const adaptedComplex = adaptObjectToWeaviateProperties(ComplexSchema, complexObj);
console.log('Original object:', JSON.stringify(complexObj, null, 2));
console.log('Adapted object:', JSON.stringify(adaptedComplex, null, 2));
console.log('\n');

// Test validation and adaptation
console.log('=== Validation and Adaptation ===');
const invalidObj = {
  id: "user123",
  name: "John Doe",
  age: "not a number", // Invalid: should be number
  isActive: true,
  tags: ["developer"],
  scores: [95, 87],
  metadata: {
    category: "premium",
    priority: 1,
    settings: {
      theme: "dark",
      notifications: true
    }
  },
  status: "invalid_status" // Invalid: should be 'active' or 'inactive'
};

const validationResult = validateAndAdaptObject(ComplexSchema, invalidObj);
console.log('Validation result:', validationResult);
console.log('\n');

// Test with valid object
const validObj = {
  id: "user123",
  name: "John Doe",
  age: 30,
  isActive: true,
  tags: ["developer"],
  scores: [95, 87],
  metadata: {
    category: "premium",
    priority: 1,
    settings: {
      theme: "dark",
      notifications: true
    }
  },
  status: "active" as const
};

const validResult = validateAndAdaptObject(ComplexSchema, validObj);
console.log('Valid object result:', validResult);
console.log('\n');

// Test type-safe adapter
console.log('=== Type-Safe Adapter ===');
const paperAdapter = createObjectAdapter(PaperEntrySchema);

// This is type-safe - TypeScript will ensure the object matches the schema
const adaptedWithAdapter = paperAdapter.adapt(paperEntryObj);
console.log('Adapted with type-safe adapter:', JSON.stringify(adaptedWithAdapter, null, 2));

// Test validation with adapter
const validationWithAdapter = paperAdapter.validateAndAdapt({
  summary: "Invalid object",
  // Missing required fields
});

console.log('Validation with adapter:', validationWithAdapter); 