import { PaperRepositoryImpl } from "@/domain/repository/paper";
import { PdfRepositoryImpl } from "@/domain/repository/pdf";
import { ChunkRepositoryImpl } from "@/domain/repository/chunk";
import { ChunkUseCase, PaperUseCase, PdfUseCase } from "./client";

const paperRepository = new PaperRepositoryImpl()
const pdfRepository = new PdfRepositoryImpl()
const chunkRepository = new ChunkRepositoryImpl()

const paperUseCase = new PaperUseCase(paperRepository)
const pdfUseCase = new PdfUseCase(pdfRepository)
const chunkUseCase = new ChunkUseCase(chunkRepository)

export {
    paperUseCase,
    pdfUseCase,
    chunkUseCase,
}
