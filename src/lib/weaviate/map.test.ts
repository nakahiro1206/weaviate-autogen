import { mapZodSchemaToWeaviateProperties } from './map';
import { PaperEntrySchema, PaperInfoSchema } from '@/models/paper';
import { PaperChunkSchema } from '@/models/chunk';
import { z } from 'zod';

// Test the recursive schema mapping
console.log('Testing recursive schema mapping...\n');

// Test with PaperInfo schema
console.log('PaperInfo schema properties:');
const paperInfoProperties = mapZodSchemaToWeaviateProperties(PaperInfoSchema);
console.log(JSON.stringify(paperInfoProperties, null, 2));
console.log('\n');

// Test with PaperEntry schema
console.log('PaperEntry schema properties:');
const paperEntryProperties = mapZodSchemaToWeaviateProperties(PaperEntrySchema);
console.log(JSON.stringify(paperEntryProperties, null, 2));
console.log('\n');

// Test with PaperChunk schema
console.log('PaperChunk schema properties:');
const paperChunkProperties = mapZodSchemaToWeaviateProperties(PaperChunkSchema);
console.log(JSON.stringify(paperChunkProperties, null, 2));
console.log('\n');

// Test with a complex nested schema including arrays and literals
const ComplexSchema = z.object({
  id: z.string(),
  name: z.string(),
  age: z.number().optional(),
  isActive: z.boolean(),
  createdAt: z.date(),
  tags: z.array(z.string()),
  scores: z.array(z.number()),
  flags: z.array(z.boolean()),
  status: z.union([z.literal('active'), z.literal('inactive')]),
  priority: z.literal(1).or(z.literal(2)).or(z.literal(3)),
  metadata: z.object({
    category: z.string(),
    priority: z.number(),
    settings: z.object({
      theme: z.string(),
      notifications: z.boolean()
    })
  })
});

console.log('Complex nested schema properties (with arrays and literals):');
const complexProperties = mapZodSchemaToWeaviateProperties(ComplexSchema);
console.log(JSON.stringify(complexProperties, null, 2)); 