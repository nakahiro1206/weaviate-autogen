from pydantic import BaseModel, ValidationError
from typing import Optional, Dict
from result import Result, Ok, Err

class PaperInfo(BaseModel):
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

class Metadata(BaseModel):
    uuid: str
    distance: Optional[float] = None

class RetrievedPaperEntry(BaseModel):
    metadata: Metadata
    info: PaperInfo
    summary: str
    comment: Optional[str] = None

    def to_ai_readable(self) -> Dict[str, str | float | None]:
        return {
            "uuid": self.metadata.uuid,
            "distance": self.metadata.distance,
            "summary": self.summary,
            "title": self.info.title,
        }

def validate_paper_entry(paper_entry: dict) -> Result[RetrievedPaperEntry, str]:
    try:
        return Ok(RetrievedPaperEntry.model_validate(paper_entry))
    except ValidationError as e:
        return Err(f"Invalid paper entry: {e}")