from pydantic import BaseModel, ValidationError
from typing import Optional, Dict
from result import Result, Ok, Err
from .paper import Metadata

class PaperChunk(BaseModel):
    text: str
    paperId: str
    paperTitle: str
    chunkIndex: int

class RetrievedPaperChunk(BaseModel):
    text: str
    paperId: str
    paperTitle: str
    chunkIndex: int
    metadata: Metadata

    def to_ai_readable(self) -> Dict[str, str | float | None]:
        return {
            "distance": self.metadata.distance,
            "text": self.text,
            "distance": self.metadata.distance,
        }
    
def validate_paper_chunk(paper_chunk: dict) -> Result[RetrievedPaperChunk, str]:
    try:
        return Ok(RetrievedPaperChunk.model_validate(paper_chunk))
    except ValidationError as e:
        return Err(f"Invalid paper chunk: {e}")