import { PaperRepository } from "@/repository/paper";
import { PdfRepository } from "@/repository/pdf";
import { ChunkRepository } from "@/repository/chunk";

export const paperService = new PaperRepository()
export const pdfService = new PdfRepository()
export const chunkService = new ChunkRepository()
