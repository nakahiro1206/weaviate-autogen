# Weaviate Schema Mapping

This module provides a recursive schema mapping system that automatically converts Zod schemas to Weaviate collection properties, and adapts runtime objects to the proper format for Weaviate operations.

## Features

- **Recursive Schema Traversal**: Automatically handles nested objects and complex schemas
- **Type Mapping**: Maps Zod types to appropriate Weaviate data types
- **Array Support**: Handles arrays of different types (text, number, boolean, date)
- **Optional/Nullable Support**: Automatically unwraps optional and nullable types
- **Union/Enum Support**: Handles union types and enums
- **Literal Support**: Maps literal types to appropriate data types
- **Object Adaptation**: Converts Zod-inferred objects to Weaviate-compatible format
- **Validation**: Validates objects against schemas before adaptation

## Usage

### Schema to Properties Mapping

```typescript
import { mapZodSchemaToWeaviateProperties } from "./map";
import { PaperEntrySchema } from "@/models/paper";

// Get Weaviate properties from a Zod schema
const properties = mapZodSchemaToWeaviateProperties(PaperEntrySchema);
```

### Object Adaptation

```typescript
import { adaptObjectToWeaviateProperties } from "./map";
import { PaperEntrySchema } from "@/models/paper";

// Adapt a runtime object to Weaviate format
const paperObj: z.infer<typeof PaperEntrySchema> = {
  summary: "Paper summary",
  comment: "Interesting research",
  encoded: "base64content",
  fullText: "Full paper content...",
  info: {
    type: "journal",
    id: "12345",
    title: "Sample Paper",
    author: "John Doe",
    // ... other fields
  },
};

const adaptedObj = adaptObjectToWeaviateProperties(PaperEntrySchema, paperObj);
```

### Creating Collections

```typescript
import { mapZodSchemaToWeaviateProperties } from "./map";
import { PaperEntrySchema } from "@/models/paper";

// Create a collection with automatically mapped properties
const collection = await client.collections.create({
  name: "Paper",
  vectorizers: [
    vectorizer.text2VecOpenAI({
      name: "summaryEmbedding",
      sourceProperties: ["summary"],
    }),
  ],
  properties: mapZodSchemaToWeaviateProperties(PaperEntrySchema), // Automatically mapped from schema
});
```

### Validation and Adaptation

```typescript
import { validateAndAdaptObject } from "./map";

// Validate and adapt an unknown object
const result = validateAndAdaptObject(PaperEntrySchema, someObject);

if (result.success) {
  // Object is valid and adapted
  const adaptedData = result.data;
  // Use adaptedData for Weaviate operations
} else {
  // Handle validation errors
  console.error(result.error);
}
```

### Type-Safe Adapters

```typescript
import { createObjectAdapter } from "./map";

// Create a type-safe adapter for a specific schema
const paperAdapter = createObjectAdapter(PaperEntrySchema);

// Type-safe adaptation (TypeScript will ensure object matches schema)
const adapted = paperAdapter.adapt(paperObj);

// Validation with detailed error messages
const validation = paperAdapter.validateAndAdapt(unknownObject);
```

### Generic Schema Mapping

```typescript
import { createCollectionProperties } from "./map";

// Use with any Zod schema
const MySchema = z.object({
  id: z.string(),
  name: z.string(),
  age: z.number().optional(),
  tags: z.array(z.string()),
  metadata: z.object({
    category: z.string(),
    priority: z.number(),
  }),
});

const properties = createCollectionProperties(MySchema);
```

## Supported Zod Types

| Zod Type               | Weaviate Data Type       | Notes                                           |
| ---------------------- | ------------------------ | ----------------------------------------------- |
| `z.string()`           | `dataType.TEXT`          | Text fields                                     |
| `z.number()`           | `dataType.NUMBER`        | Numeric fields                                  |
| `z.boolean()`          | `dataType.BOOLEAN`       | Boolean fields                                  |
| `z.date()`             | `dataType.DATE`          | Date fields                                     |
| `z.object()`           | `dataType.OBJECT`        | Nested objects with nestedProperties            |
| `z.array(z.string())`  | `dataType.TEXT_ARRAY`    | Arrays of strings                               |
| `z.array(z.number())`  | `dataType.NUMBER_ARRAY`  | Arrays of numbers                               |
| `z.array(z.boolean())` | `dataType.BOOLEAN_ARRAY` | Arrays of booleans                              |
| `z.array(z.date())`    | `dataType.DATE_ARRAY`    | Arrays of dates                                 |
| `z.optional()`         | Unwrapped                | Automatically unwraps optional types            |
| `z.nullable()`         | Unwrapped                | Automatically unwraps nullable types            |
| `z.union()`            | `dataType.TEXT`          | Union types default to text                     |
| `z.enum()`             | `dataType.TEXT`          | Enums default to text                           |
| `z.literal()`          | Based on value           | Maps to appropriate type based on literal value |

## Examples

### Simple Schema

```typescript
const SimpleSchema = z.object({
  id: z.string(),
  name: z.string(),
  age: z.number(),
  isActive: z.boolean(),
});

// Results in:
[
  { name: "id", dataType: "text" },
  { name: "name", dataType: "text" },
  { name: "age", dataType: "number" },
  { name: "isActive", dataType: "boolean" },
];
```

### Nested Schema

```typescript
const NestedSchema = z.object({
  id: z.string(),
  user: z.object({
    name: z.string(),
    email: z.string(),
    preferences: z.object({
      theme: z.string(),
      notifications: z.boolean(),
    }),
  }),
});

// Results in:
[
  { name: "id", dataType: "text" },
  {
    name: "user",
    dataType: "object",
    nestedProperties: [
      { name: "name", dataType: "text" },
      { name: "email", dataType: "text" },
      {
        name: "preferences",
        dataType: "object",
        nestedProperties: [
          { name: "theme", dataType: "text" },
          { name: "notifications", dataType: "boolean" },
        ],
      },
    ],
  },
];
```

### Schema with Arrays

```typescript
const ArraySchema = z.object({
  id: z.string(),
  tags: z.array(z.string()),
  scores: z.array(z.number()),
  flags: z.array(z.boolean()),
});

// Results in:
[
  { name: "id", dataType: "text" },
  { name: "tags", dataType: "text[]" },
  { name: "scores", dataType: "number[]" },
  { name: "flags", dataType: "boolean[]" },
];
```

### Object Adaptation Examples

```typescript
// Simple object adaptation
const userObj = {
  id: "user123",
  name: "John Doe",
  age: 30,
  tags: ["developer", "typescript"],
};

const adaptedUser = adaptObjectToWeaviateProperties(UserSchema, userObj);
// Result: { id: "user123", name: "John Doe", age: 30, tags: ["developer", "typescript"] }

// Nested object adaptation
const paperObj = {
  summary: "Research summary",
  info: {
    title: "Sample Paper",
    author: "John Doe",
    year: "2023",
  },
};

const adaptedPaper = adaptObjectToWeaviateProperties(PaperSchema, paperObj);
// Result: { summary: "Research summary", info: { title: "Sample Paper", author: "John Doe", year: "2023" } }
```

## Utility Functions

### `validateSchemaForMapping(schema: z.ZodTypeAny): boolean`

Validates if a schema can be successfully mapped to Weaviate properties.

```typescript
import { validateSchemaForMapping } from "./map";

const isValid = validateSchemaForMapping(MySchema);
if (isValid) {
  const properties = mapZodSchemaToWeaviateProperties(MySchema);
}
```

### `getPropertiesFromSchema(schema: z.ZodTypeAny): WeaviateProperty[]`

Generic function to get properties from any Zod schema.

```typescript
import { getPropertiesFromSchema } from "./map";

const properties = getPropertiesFromSchema(MySchema);
```

### `adaptObjectToWeaviateProperties<T>(schema: T, obj: z.infer<T>): Record<string, any>`

Adapts a Zod-inferred object to Weaviate properties format.

```typescript
import { adaptObjectToWeaviateProperties } from "./map";

const adapted = adaptObjectToWeaviateProperties(MySchema, myObject);
```

### `validateAndAdaptObject<T>(schema: T, obj: unknown): { success: true; data: Record<string, any> } | { success: false; error: string }`

Validates and adapts an unknown object against a schema.

```typescript
import { validateAndAdaptObject } from "./map";

const result = validateAndAdaptObject(MySchema, unknownObject);
if (result.success) {
  // Use result.data
} else {
  // Handle result.error
}
```

### `createObjectAdapter<T>(schema: T)`

Creates a type-safe adapter for a specific schema.

```typescript
import { createObjectAdapter } from "./map";

const adapter = createObjectAdapter(MySchema);
const adapted = adapter.adapt(myObject); // Type-safe
const validation = adapter.validateAndAdapt(unknownObject);
```

## Integration with Existing Code

The mapping system is already integrated with the existing Weaviate client:

- Uses `mapZodSchemaToWeaviateProperties()` for collection creation
- Automatically generates collection properties from schemas
- Supports both PaperEntry and PaperChunk schemas

## Benefits

1. **Type Safety**: Leverages Zod's type system for compile-time safety
2. **Automatic Updates**: Schema changes automatically reflect in Weaviate collections
3. **Consistency**: Ensures schema and database structure stay in sync
4. **Maintainability**: Reduces manual property definition and maintenance
5. **Flexibility**: Works with any Zod schema structure
6. **Runtime Validation**: Validates objects before Weaviate operations
7. **Object Adaptation**: Converts runtime objects to proper Weaviate format

## Best Practices

1. **Use Descriptive Field Names**: Schema field names become Weaviate property names
2. **Handle Optional Fields**: Use `z.optional()` for nullable fields
3. **Validate Schemas**: Use `validateSchemaForMapping()` before creating collections
4. **Validate Objects**: Use `validateAndAdaptObject()` before inserting data
5. **Test Complex Schemas**: Always test complex nested schemas before production use
6. **Use Type-Safe Adapters**: Use `createObjectAdapter()` for better TypeScript support
7. **Document Custom Types**: Document any custom Zod types that might not map as expected
