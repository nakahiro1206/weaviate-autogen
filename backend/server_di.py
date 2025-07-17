# import logging
# from fastapi import FastAPI, HTTPException, WebSocket
# from fastapi.middleware.cors import CORSMiddleware
# from fastapi.responses import FileResponse
# from fastapi.staticfiles import StaticFiles

# from di.setup import setup_dependencies, get_container
# from di.interfaces import IHistoryRepository, ITeamRepository
# from di.chat_service import ChatService

# logger = logging.getLogger(__name__)

# # Setup dependency injection
# setup_dependencies()

# app = FastAPI()

# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"],
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# app.mount("/static", StaticFiles(directory="."), name="static")

# @app.get("/")
# async def root():
#     return FileResponse("ws_example/app_team.html")

# @app.get("/history")
# async def history():
#     """Get conversation history"""
#     try:
#         container = get_container()
#         history_repo = container.resolve(IHistoryRepository)
#         return await history_repo.load_history()
#     except Exception as e:
#         logger.error(f"Error getting history: {e}")
#         raise HTTPException(status_code=500, detail=str(e)) from e

# @app.websocket("/ws/chat")
# async def chat(websocket: WebSocket):
#     """Handle WebSocket chat connection"""
#     try:
#         container = get_container()
#         team_repo = container.resolve(ITeamRepository)
#         history_repo = container.resolve(IHistoryRepository)
        
#         chat_service = ChatService(team_repo, history_repo)
#         await chat_service.handle_chat_session(websocket)
#     except Exception as e:
#         logger.error(f"Error in chat WebSocket: {e}")
#         # The WebSocket handler will handle sending error messages to the client

# # Example usage
# if __name__ == "__main__":
#     import uvicorn
#     uvicorn.run(app, host="0.0.0.0", port=8002) 