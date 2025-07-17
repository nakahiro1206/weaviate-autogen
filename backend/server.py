import logging
# for streaming response
# https://microsoft.github.io/autogen/stable/user-guide/agentchat-user-guide/tutorial/agents.html#streaming-tokens

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import websocket, history

logger = logging.getLogger(__name__)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(websocket.router)
app.include_router(history.router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8002)