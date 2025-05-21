import { PaperEntry } from "@/types/paper";

import { WeaviateNonGenericObject } from "weaviate-client";

import { Properties } from "weaviate-client";

import { PaperEntrySchema } from "@/types/paper";
import { WeaviateGenericObject } from "weaviate-client";
import { Result, Ok, Err } from "@/lib/result";

export const parseWeaviateObject = (item: WeaviateGenericObject<Properties> | WeaviateNonGenericObject): Result<PaperEntry> => {
    const obj = {
        summary: item.properties["summary"],
        comment: item.properties["comment"],
        encoded: item.properties["encoded"],
        info: item.properties["info"],
    }
    const parsed = PaperEntrySchema.safeParse(obj);
    if (!parsed.success) {
        console.error(parsed.error);
        return Err(JSON.stringify(parsed.error));
    }
    return Ok(parsed.data);
}