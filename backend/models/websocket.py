from pydantic import BaseModel
from datetime import datetime

class WebsocketMessage(BaseModel):
    id: int
    session_id: int
    message: str
    created_at: datetime