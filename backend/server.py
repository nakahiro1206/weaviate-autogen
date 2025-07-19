import logging
import os
from dotenv import load_dotenv

# for streaming response
# https://microsoft.github.io/autogen/stable/user-guide/agentchat-user-guide/tutorial/agents.html#streaming-tokens

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import websocket, history, session

load_dotenv()

logger = logging.getLogger(__name__)

app = FastAPI(title="Weaviate Driver Backend", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(websocket.router)
app.include_router(history.router)
app.include_router(session.router, prefix="/api/v1")

@app.get("/")
async def root():
    return {"message": "Weaviate Driver Backend API", "status": "running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "database": "connected"}

if __name__ == "__main__":
    import uvicorn
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", "8002"))
    uvicorn.run(app, host=host, port=port)