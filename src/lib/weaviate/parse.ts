import { PaperEntry, PaperEntrySchema } from "@/domain/entities/paper";

import { WeaviateNonGenericObject } from "weaviate-client";

import { Properties } from "weaviate-client";

import { WeaviateGenericObject } from "weaviate-client";
import { Result, Ok, Err } from "@/lib/result";

export const parseWeaviateObject = (item: WeaviateGenericObject<Properties> | WeaviateNonGenericObject): Result<PaperEntry> => {
    console.log(item);
    const obj = {
        summary: item.properties["summary"],
        comment: item.properties["comment"],
        encoded: item.properties["encoded"],
        fullText: item.properties["fullText"],
        info: item.properties["info"],
    }
    const parsed = PaperEntrySchema.safeParse(obj);
    if (!parsed.success) {
        console.error(parsed.error);
        return Err(JSON.stringify(parsed.error));
    }
    return Ok(parsed.data);
}