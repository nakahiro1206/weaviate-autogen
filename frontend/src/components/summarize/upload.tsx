import { useSummarizeStream } from "@/hooks/use-summarize-stream";
import { addPaper } from "@/lib/api-helper/paper";
import { match } from "@/lib/result";
import { PaperInfo } from "@/models/paper";
import { PlusIcon, UploadIcon, FileTextIcon, XIcon, CheckCircleIcon, MoveRightIcon } from "lucide-react"
import { ChangeEventHandler, MouseEventHandler, useRef, useState, DragEvent } from "react";
import { toast } from "sonner";
import { useParsePdfMutation } from "@/hooks/pdf";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import ReactMarkdown from "react-markdown";
import { Spinner } from "../ui/spinner";
import { SubmitForm } from "./custom-dialog";

export const Upload = () => {
    const [encoded, setEncoded] = useState<string | null>(null);
    const [isDragOver, setIsDragOver] = useState(false);
    const { mutate, isPending, text, setText } = useParsePdfMutation({
        onSuccess: (text) => {
            toast.success("PDF parsed successfully");
        },
        onError: (error) => {
            toast.error(`${error.code}: ${error.message}`);
        },
    });
    const { summary: summaryStream, isStreaming, error, startStream, reset } = useSummarizeStream();
//   const { textInfo: selectedPaperText, isLoading: textLoading } = useGetPaperText(selectedPaper?.metadata.uuid || null);

  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const isValidFile = (file: File) => {
    return file.type === "application/pdf"; //  && file.size <= 10 * 1024 * 1024;
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleFileChange: ChangeEventHandler<HTMLInputElement> = async (
    event,
  ) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (isValidFile(file)) {
        setFile(file);
        mutate(file);
      } else {
        toast.error("Please select a valid PDF file");
      }
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (isValidFile(file)) {
        setFile(file);
        mutate(file);
      } else {
        toast.error("Please drop a valid PDF file");
      }
    }
  };

  const handleClick: MouseEventHandler<HTMLButtonElement> = () => {
    inputRef.current?.click();
  };

  const removeFile = () => {
    setFile(null);
    setText(null);
    setEncoded(null);
    reset();
    inputRef.current && (inputRef.current.value = '');
  };

  const add = async (data: PaperInfo, comment?: string): Promise<void> => {
    if (file === null || summaryStream === null || text === null ) {
      return;
    }
    const encoded = Buffer.from(await file.arrayBuffer()).toString("base64");
    const res = await addPaper({
      summary: summaryStream,
      comment: comment,
      encoded: encoded,
      fullText: text,
      info: data,
    });
    match(res, {
      onSuccess: (data) => {
        toast.success(`Paper added. id: ${data.id}`);
      },
      onError: (message) => {
        toast.error(message);
      },
    });
  };
    return (
        <div className="w-full space-y-6 h-full overflow-y-auto">
            {file === null && (
                <>
                <div className="text-center space-y-2">
                    <h2 className="text-3xl font-bold text-sky-800">Upload Paper</h2>
                    <p className="text-gray-600">Upload your PDF research paper to get started</p>
                </div>

                <div className="w-full">
                    <div
                        className={`relative border-2 border-dashed rounded-xl p-8 transition-all duration-200 ${
                            isDragOver 
                                ? 'border-sky-400 bg-sky-50 scale-105' 
                                : 'border-gray-300 hover:border-sky-300 hover:bg-gray-50'
                        }`}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                    >
                        <input
                            type="file"
                            accept="application/pdf"
                            multiple={false}
                            ref={inputRef}
                            onChange={handleFileChange}
                            className="hidden"
                        />
                        
                        <div className="text-center space-y-4">
                            <div className="flex justify-center">
                                <div className={`p-4 rounded-full transition-colors duration-200 ${
                                    isDragOver ? 'bg-sky-100' : 'bg-gray-100'
                                }`}>
                                    <UploadIcon className={`w-8 h-8 ${
                                        isDragOver ? 'text-sky-600' : 'text-gray-500'
                                    }`} />
                                </div>
                            </div>
                            
                            <div className="space-y-2">
                                <h3 className="text-lg font-semibold text-gray-900">
                                    {isDragOver ? 'Drop your PDF here' : 'Upload your PDF file'}
                                </h3>
                                <p className="text-sm text-gray-500">
                                    Drag and drop your PDF file here, or click the button below
                                </p>
                            </div>
                            
                            <Button
                                onClick={handleClick}
                                className="bg-sky-600 hover:bg-sky-700 text-white px-6 py-2 rounded-lg transition-colors duration-200"
                            >
                                <PlusIcon className="w-4 h-4 mr-2" />
                                Choose File
                            </Button>
                        </div>
                    </div>
                </div>
                </>
            )}

            {file && (
                <Card className="w-full border-sky-200 bg-sky-50">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <div className="p-2 bg-sky-100 rounded-lg">
                                    <FileTextIcon className="w-6 h-6 text-sky-600" />
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-medium text-gray-900 truncate">{file.name}</h4>
                                    <p className="text-sm text-gray-500">{formatFileSize(file.size)}</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-2">
                                {isPending ? (
                                    <div className="flex items-center space-x-2">
                                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-sky-600 border-t-transparent"></div>
                                        <span className="text-sm text-sky-600">Processing...</span>
                                    </div>
                                ) : (
                                    <CheckCircleIcon className="w-5 h-5 text-green-500" />
                                )}
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={removeFile}
                                    className="text-gray-400 hover:text-red-500 hover:bg-red-50"
                                >
                                    <XIcon className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {isPending && (
                <Card className="w-full">
                    <CardContent className="p-6">
                        <div className="space-y-4">
                            <div className="flex items-center space-x-3">
                                <div className="animate-spin rounded-full h-6 w-6 border-2 border-sky-600 border-t-transparent"></div>
                                <span className="font-medium text-gray-900">Processing PDF...</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div className="bg-sky-600 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
                            </div>
                            <p className="text-sm text-gray-500">Extracting text content from your PDF</p>
                        </div>
                    </CardContent>
                </Card>
            )}

            {text && (
                <Card className="w-full border-sky-200">
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold text-sky-800 flex items-center space-x-2">
                            <FileTextIcon className="w-5 h-5" />
                            <span>Paper Content Preview</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-gray-700 bg-white rounded-lg border border-gray-200 p-4 max-h-64 overflow-y-auto">
                        <div className="space-y-2">
                            <p className="text-gray-600 font-medium">First 500 characters:</p>
                            <p className="leading-relaxed">{text.slice(0, 500)}...</p>
                        </div>
                    </CardContent>
                </Card>
            )}

            {text && file && (
                // <Button onClick={() => summarize(text)}>Summarize</Button>
                <Card className="w-full border-sky-200">
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold text-sky-800 flex items-center space-x-2">
                            <FileTextIcon className="w-5 h-5" />
                            <span>Summarize</span>
                            <Button variant="outline" size="sm" onClick={() => startStream(text)}>
                                {isStreaming ? 
                                <Spinner size="small" /> : 
                                <>
                                <span>Start</span>
                                <MoveRightIcon className="w-5 h-5" />
                                </>
                                }
                            </Button>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-gray-700 bg-white rounded-lg border border-gray-200 p-4 max-h-64 overflow-y-auto">
                        <ReactMarkdown>{summaryStream}</ReactMarkdown>
                    </CardContent>
                </Card>
            )}

            {text && summaryStream && file && !isPending && (
                <div className="w-full flex flex-row justify-end">
                <SubmitForm
                  trigger={<Button>Save document!</Button>}
                  submitFunction={add}
                />
                </div>
            )}
        </div>
    )
}