import React, { FC, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { constructPaperInfo } from "@/lib/parse-bibtex";
import { PaperInfo } from "@/models/paper";
import { Textarea } from "../ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { match } from "@/lib/result";

type Props = {
  trigger: React.JSX.Element;
  submitFunction: (data: PaperInfo, comment?: string) => void;
};
type ParseResult = {
  data?: PaperInfo;
  error?: string;
};
export const SubmitForm: FC<Props> = (props) => {
  const { trigger, submitFunction } = props;
  const [open, setOpen] = useState(false);
  const [parsedData, setParsedData] = useState<ParseResult | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const commentRef = useRef<HTMLTextAreaElement>(null);
  const parse = () => {
    const input = inputRef.current?.value;
    if (!input) return;
    const parsedResult = constructPaperInfo(input);
    match(parsedResult, {
      onSuccess: (data) => {
        setParsedData({ data });
      },
      onError: (msg) => {
        setParsedData({ error: msg });
      },
    });
  };
  const submitAction = () => {
    if (parsedData?.data) {
      submitFunction(parsedData.data, commentRef.current?.value);
    }
    setOpen(false);
  };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Parse Bibtex</DialogTitle>
          <DialogDescription>
            Save the paper info with summary.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Textarea
              id="name"
              ref={inputRef}
              placeholder="Bibtex"
              className="col-span-4"
            />
            <Button onClick={parse}>Parse</Button>
            <div className="col-span-4">
              {parsedData?.error && (
                <p className="text-red-500">{parsedData.error}</p>
              )}
              {parsedData?.data && (
                <div>
                  <div className="text-green-500">Parsed successfully</div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Key</TableHead>
                        <TableHead>Value</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell>Type</TableCell>
                        <TableCell>{parsedData.data.type}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>ID</TableCell>
                        <TableCell>{parsedData.data.id}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Title</TableCell>
                        <TableCell>{parsedData.data.title}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Author</TableCell>
                        <TableCell>{parsedData.data.author}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Year</TableCell>
                        <TableCell>{parsedData.data.year}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Journal</TableCell>
                        <TableCell>{parsedData.data.journal}</TableCell>
                      </TableRow>
                      <TableRow>
                        
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
            <div className="col-span-4">
              <Label htmlFor="comment">Comment</Label>
              <Textarea id="comment" ref={commentRef} placeholder="Comment" className="col-span-4" />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={submitAction}>Upload Document</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
