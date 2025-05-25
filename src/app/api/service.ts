import { ApiPdfRepository } from "@/repository/api/pdf";
import { ApiPaperRepository } from "@/repository/api/paper";
import { ApiChunkRepository } from "@/repository/api/chunk";

export const apiPdfService = new ApiPdfRepository()
export const apiPaperService = new ApiPaperRepository()
export const apiChunkService = new ApiChunkRepository()
