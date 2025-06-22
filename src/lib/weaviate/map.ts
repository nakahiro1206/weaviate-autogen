import { dataType } from "weaviate-client";
import { z } from "zod";

// Type for Weaviate property definition
export interface WeaviateProperty {
  name: string;
  dataType: any; // Using any to accommodate all Weaviate data types
  nestedProperties?: WeaviateProperty[];
}

// Recursively scan Zod schema and map to Weaviate properties
export const mapZodSchemaToWeaviateProperties = (
  schema: z.ZodTypeAny,
  propertyName?: string
): WeaviateProperty[] => {
  // Handle different Zod types
  if (schema instanceof z.ZodObject) {
    const shape = schema.shape;
    const objectProperties: WeaviateProperty[] = [];

    // Recursively process each property in the object
    Object.entries(shape).forEach(([key, value]) => {
      const nestedProps = mapZodSchemaToWeaviateProperties(value as z.ZodTypeAny, key);
      objectProperties.push(...nestedProps);
    });

    // If this is a nested object (not the root), return as nested properties
    if (propertyName) {
      return [{
        name: propertyName,
        dataType: dataType.OBJECT,
        nestedProperties: objectProperties
      }];
    } else {
      return objectProperties;
    }
  }

  // Handle primitive types
  if (schema instanceof z.ZodString) {
    return [{
      name: propertyName!,
      dataType: dataType.TEXT
    }];
  }

  if (schema instanceof z.ZodNumber) {
    return [{
      name: propertyName!,
      dataType: dataType.NUMBER
    }];
  }

  if (schema instanceof z.ZodBoolean) {
    return [{
      name: propertyName!,
      dataType: dataType.BOOLEAN
    }];
  }

  if (schema instanceof z.ZodDate) {
    return [{
      name: propertyName!,
      dataType: dataType.DATE
    }];
  }

  // Handle optional types
  if (schema instanceof z.ZodOptional) {
    return mapZodSchemaToWeaviateProperties(schema.unwrap(), propertyName);
  }

  // Handle nullable types
  if (schema instanceof z.ZodNullable) {
    return mapZodSchemaToWeaviateProperties(schema.unwrap(), propertyName);
  }

  // Handle arrays
  if (schema instanceof z.ZodArray) {
    const elementType = schema.element;
    
    // Determine the appropriate array type based on element type
    let arrayDataType: any = dataType.TEXT_ARRAY; // default
    
    if (elementType instanceof z.ZodString) {
      arrayDataType = dataType.TEXT_ARRAY;
    } else if (elementType instanceof z.ZodNumber) {
      arrayDataType = dataType.NUMBER_ARRAY;
    } else if (elementType instanceof z.ZodBoolean) {
      arrayDataType = dataType.BOOLEAN_ARRAY;
    } else if (elementType instanceof z.ZodDate) {
      arrayDataType = dataType.DATE_ARRAY;
    }
    
    return [{
      name: propertyName!,
      dataType: arrayDataType
    }];
  }

  // Handle unions (default to TEXT for simplicity)
  if (schema instanceof z.ZodUnion) {
    return [{
      name: propertyName!,
      dataType: dataType.TEXT
    }];
  }

  // Handle enums
  if (schema instanceof z.ZodEnum) {
    return [{
      name: propertyName!,
      dataType: dataType.TEXT
    }];
  }

  // Handle literals
  if (schema instanceof z.ZodLiteral) {
    const literalType = typeof schema.value;
    let dataTypeValue: any = dataType.TEXT;
    
    if (literalType === 'number') {
      dataTypeValue = dataType.NUMBER;
    } else if (literalType === 'boolean') {
      dataTypeValue = dataType.BOOLEAN;
    }
    
    return [{
      name: propertyName!,
      dataType: dataTypeValue
    }];
  }

  // Default fallback
  return [{
    name: propertyName!,
    dataType: dataType.TEXT
  }];
};

// Utility function to create collection properties from any schema
export const createCollectionProperties = (schema: z.ZodTypeAny): WeaviateProperty[] => {
  return mapZodSchemaToWeaviateProperties(schema);
};

// Utility function to validate schema before mapping
export const validateSchemaForMapping = (schema: z.ZodTypeAny): boolean => {
  try {
    // Try to map the schema to see if it's valid
    mapZodSchemaToWeaviateProperties(schema);
    return true;
  } catch (error) {
    console.error('Schema validation failed:', error);
    return false;
  }
};

// Generic function to get properties from any Zod schema
export const getPropertiesFromSchema = (schema: z.ZodTypeAny): WeaviateProperty[] => {
  return mapZodSchemaToWeaviateProperties(schema);
};

// Adapt Zod-inferred object to Weaviate properties format
export const adaptObjectToWeaviateProperties = <T extends z.ZodTypeAny>(
  schema: T,
  obj: z.infer<T>
): Record<string, any> => {
  const result: Record<string, any> = {};
  
  // Handle different Zod types recursively
  const adaptValue = (value: any, schemaType: z.ZodTypeAny, key: string): any => {
    // Handle objects
    if (schemaType instanceof z.ZodObject) {
      const shape = schemaType.shape;
      const nestedObj: Record<string, any> = {};
      
      Object.entries(shape).forEach(([propKey, propSchema]) => {
        if (value && typeof value === 'object' && propKey in value) {
          nestedObj[propKey] = adaptValue(value[propKey], propSchema as z.ZodTypeAny, propKey);
        }
      });
      
      return nestedObj;
    }
    
    // Handle arrays
    if (schemaType instanceof z.ZodArray) {
      if (Array.isArray(value)) {
        return value.map((item, index) => 
          adaptValue(item, schemaType.element, `${key}[${index}]`)
        );
      }
      return [];
    }
    
    // Handle optional types
    if (schemaType instanceof z.ZodOptional) {
      if (value === undefined || value === null) {
        return undefined;
      }
      return adaptValue(value, schemaType.unwrap(), key);
    }
    
    // Handle nullable types
    if (schemaType instanceof z.ZodNullable) {
      if (value === null) {
        return null;
      }
      return adaptValue(value, schemaType.unwrap(), key);
    }
    
    // Handle unions
    if (schemaType instanceof z.ZodUnion) {
      // For unions, we just return the value as-is since Weaviate will handle it
      return value;
    }
    
    // Handle enums
    if (schemaType instanceof z.ZodEnum) {
      return value;
    }
    
    // Handle literals
    if (schemaType instanceof z.ZodLiteral) {
      return value;
    }
    
    // Handle primitive types - return as-is
    if (schemaType instanceof z.ZodString || 
        schemaType instanceof z.ZodNumber || 
        schemaType instanceof z.ZodBoolean || 
        schemaType instanceof z.ZodDate) {
      return value;
    }
    
    // Default fallback
    return value;
  };
  
  // Process the root object
  if (schema instanceof z.ZodObject) {
    const shape = schema.shape;
    
    Object.entries(shape).forEach(([key, propSchema]) => {
      if (obj && typeof obj === 'object' && key in obj) {
        result[key] = adaptValue(obj[key], propSchema as z.ZodTypeAny, key);
      }
    });
  }
  
  return result;
};

// Utility function to validate and adapt object
export const validateAndAdaptObject = <T extends z.ZodTypeAny>(
  schema: T,
  obj: unknown
): { success: true; data: Record<string, any> } | { success: false; error: string } => {
  try {
    const validated = schema.parse(obj);
    const adapted = adaptObjectToWeaviateProperties(schema, validated);
    return { success: true, data: adapted };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { 
        success: false, 
        error: `Validation failed: ${error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')}` 
      };
    }
    return { success: false, error: 'Unknown error occurred' };
  }
};

// Type-safe adapter for specific schemas
export const createObjectAdapter = <T extends z.ZodTypeAny>(schema: T) => {
  return {
    adapt: (obj: z.infer<T>): Record<string, any> => adaptObjectToWeaviateProperties(schema, obj),
    validateAndAdapt: (obj: unknown): { success: true; data: Record<string, any> } | { success: false; error: string } => 
      validateAndAdaptObject(schema, obj)
  };
};