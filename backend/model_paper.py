from pydantic import TypeAdapter, BaseModel
from pydantic.dataclasses import dataclass
from typing import Optional

# autoGen cannot understand nested properties so we should flatten them.

class RetrievedPaperEntry(BaseModel):
    # metadata
    uuid: str
    summary: str
    # content
    distance: Optional[float] = None
    comment: Optional[str] = None
    # info
    type: str
    id: str
    abstract: Optional[str] = None
    title: str
    author: str
    journal: Optional[str] = None
    volume: Optional[str] = None
    number: Optional[str] = None
    pages: Optional[str] = None
    year: Optional[str] = None
    publisher: Optional[str] = None

class RetrievedPaperChunk(BaseModel):
    # metadata
    uuid: str
    distance: Optional[float] = None
    # content
    text: str
    paper_id: str
    paper_title: str
    chunk_index: int

paper_entry_adapter = TypeAdapter(RetrievedPaperEntry)
paper_chunk_adapter = TypeAdapter(RetrievedPaperChunk)