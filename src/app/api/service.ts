import { ApiPdfRepositoryImpl } from "@/domain/repository/api/pdf";
import { ApiPaperRepositoryImpl } from "@/domain/repository/api/paper";
import { ApiChunkRepositoryImpl } from "@/domain/repository/api/chunk";
import { ApiChunkUseCase, ApiPaperUseCase, ApiPdfUseCase } from "@/service/server";

const apiPdfRepository = new ApiPdfRepositoryImpl()
const apiPaperRepository = new ApiPaperRepositoryImpl()
const apiChunkRepository = new ApiChunkRepositoryImpl()

export const apiPdfUseCase = new ApiPdfUseCase(apiPdfRepository)
export const apiPaperUseCase = new ApiPaperUseCase(apiPaperRepository)
export const apiChunkUseCase = new ApiChunkUseCase(apiChunkRepository)
