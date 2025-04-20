"use client";
import { FC, useState } from "react";
import { pdfjs, Document, Page } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

export const PdfPreview: FC<{ encoded: string }> = ({ encoded }) => {
  const [numPages, setNumPages] = useState<number>();
  const [pageNumber, setPageNumber] = useState<number>(1);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }): void {
    setNumPages(numPages);
  }

  // const buffer = Buffer.from(encoded, "base64");
  // const file = new File([buffer], "preview.pdf", { type: "application/pdf" });
  const uri = `data:application/pdf;base64,${encoded}`;
  console.log(uri);
  return (
    <Document file={uri} error="ERROR" onLoadSuccess={onDocumentLoadSuccess}>
      <Page pageNumber={pageNumber} />
    </Document>
  );
};

export default PdfPreview;
