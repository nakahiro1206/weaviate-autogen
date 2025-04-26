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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { constructPaperInfo } from "@/lib/parse-bibtex";
import { PaperInfo } from "@/types/paper";

type Props = {
  trigger: React.JSX.Element;
  submitFunction: () => void;
};
type ParseResult = {
  data?: PaperInfo;
  error?: string;
};
export const SubmitForm: FC<Props> = (props) => {
  const { trigger, submitFunction } = props;
  const [open, setOpen] = useState(false);
  const [parsedData, setParsedData] = useState<ParseResult | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const parse = () => {
    const input = inputRef.current?.value;
    if (!input) return;
    const parsed = constructPaperInfo(input);
    switch (parsed.__typename) {
      case "ConstructSuccess":
        setParsedData({ data: parsed.data });
        break;
      case "ConstructError":
        setParsedData({ error: parsed.message });
        break;
    }
  };
  const submitAction = () => {
    setOpen(false);
    submitFunction();
  };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit profile</DialogTitle>
          <DialogDescription>
            Make changes to your profile here. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input ref={inputRef} id="name" className="col-span-3" />
            <Button onClick={parse}>Parse</Button>
            <div className="col-span-4">
              {parsedData?.error && (
                <p className="text-red-500">{parsedData.error}</p>
              )}
              {parsedData?.data && (
                <div className="text-green-500">
                  <div>Parsed successfully</div>
                  <ul>
                    <li>{parsedData.data.title}</li>
                    <li>{parsedData.data.authors}</li>
                    {parsedData.data.year && <li>{parsedData.data.year}</li>}
                    {parsedData.data.publisher && (
                      <li>{parsedData.data.publisher}</li>
                    )}
                    {parsedData.data.journal && (
                      <li>{parsedData.data.journal}</li>
                    )}
                    {parsedData.data.volume && (
                      <li>{parsedData.data.volume}</li>
                    )}
                    {parsedData.data.number && (
                      <li>{parsedData.data.number}</li>
                    )}
                    {parsedData.data.pages && <li>{parsedData.data.pages}</li>}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={submitAction}>Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
