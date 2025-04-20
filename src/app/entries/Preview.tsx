import { cn } from "@/lib/utils";
import { FC, useState, useEffect } from "react";
import { pdfjs, Document, Page } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

export const DownloadIcon: FC<{ className?: string }> = ({ className }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className={cn("size-6", className)}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3"
      />
    </svg>
  );
};

export const CloseIcon: FC<{ className?: string }> = ({ className }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className={cn("size-6", className)}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6 18 18 6M6 6l12 12"
      />
    </svg>
  );
};

export const PdfPreview: FC<{ encoded: string; close: () => void }> = ({
  encoded,
  close,
}) => {
  const [numPages, setNumPages] = useState<number>(0);
  const [width, setWidth] = useState<number>(0);

  useEffect(() => {
    const handleResize = () => {
      setWidth(window.innerWidth);
    };
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }): void {
    setNumPages(numPages);
  }

  const download = (uri: string, filename: string) => {
    const a = document.createElement("a"); //Create <a>
    a.href = uri; //Image Base64 Goes here
    a.download = filename; //File name Here
    a.click(); //Downloaded file
  };

  // const buffer = Buffer.from(encoded, "base64");
  // const file = new File([buffer], "preview.pdf", { type: "application/pdf" });
  const uri = `data:application/pdf;base64,${encoded}`;
  console.log(uri);
  return (
    <div className="w-full h-full">
      <div className="fixed inset-0 z-[55] w-full h-fit p-4 flex flex-row gap-4 justify-end bg-white">
        <button
          className="hover:bg-gray-100 p-2 h-fit w-fit rounded-lg"
          onClick={() => download(uri, "preview.pdf")}
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
      <Document file={uri} error="ERROR" onLoadSuccess={onDocumentLoadSuccess}>
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
