import { cn } from "@/lib/utils";
import { FC, useState, useEffect } from "react";
import { pdfjs, Document, Page } from "react-pdf";
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { DownloadIcon } from "@/components/icons/download";
import { CloseIcon } from "@/components/icons/close";

export const PdfPreview: FC<{ fileId: string; close: () => void }> = ({
  fileId,
  close,
}) => {
  const [numPages, setNumPages] = useState<number>(0);
  const [width, setWidth] = useState<number>(0);
  const [pdfData, setPdfData] = useState<string | null>(null);

  useEffect(() => {
    const handleResize = () => {
      setWidth(window.innerWidth);
    };
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    // need to fix!
    const fetchPdf = async () => {
      try {
        const response = await fetch(`/api/papers/${fileId}/pdf`);
        if (!response.ok) throw new Error('Failed to fetch PDF');
        const blob = await response.blob();
        const reader = new FileReader();
        reader.onloadend = () => {
          setPdfData(reader.result as string);
        };
        reader.readAsDataURL(blob);
      } catch (error) {
        console.error('Error fetching PDF:', error);
      }
    };
    fetchPdf();
  }, [fileId]);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }): void {
    setNumPages(numPages);
  }

  const download = (uri: string, filename: string) => {
    const a = document.createElement("a");
    a.href = uri;
    a.download = filename;
    a.click();
  };

  if (!pdfData) {
    return <div>Loading PDF...</div>;
  }

  return (
    <div className="w-full h-full">
      <div className="fixed inset-0 z-[55] w-full h-fit p-4 flex flex-row gap-4 justify-end bg-white">
        <button
          className="hover:bg-gray-100 p-2 h-fit w-fit rounded-lg"
          onClick={() => download(pdfData, "preview.pdf")}
        >
          <DownloadIcon className="text-sky-500 size-8 rounded-lg hover:text-sky-600 hover:bg-gray-100" />
        </button>
        <button
          className="hover:bg-gray-100 p-2 h-fit w-fit rounded-lg"
          onClick={close}
        >
          <CloseIcon className="text-sky-500 size-8 hover:text-sky-600" />
        </button>
      </div>
      <Document file={pdfData} error="ERROR" onLoadSuccess={onDocumentLoadSuccess}>
        {numPages &&
          Array.from({ length: numPages }, (_, index) => index + 1).map(
            (pageNumber) => (
              <Page width={width} pageNumber={pageNumber} key={pageNumber} />
            ),
          )}
      </Document>
    </div>
  );
};

export default PdfPreview;
