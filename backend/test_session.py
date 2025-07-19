#!/usr/bin/env python3
"""
Test script for session functionality
"""
import os
import asyncio
from adapter.storage import StorageRepositoryImpl

# Override environment variables for testing
os.environ["POSTGRES_USER"] = "postgres"
os.environ["POSTGRES_PASSWORD"] = "postgres"
os.environ["POSTGRES_HOST"] = "localhost"
os.environ["POSTGRES_PORT"] = "5432"
os.environ["POSTGRES_DB"] = "weaviate_driver"

# Also set the DATABASE_URL for compatibility
os.environ["DATABASE_URL"] = "postgresql://postgres:postgres@localhost:5432/weaviate_driver"

async def test_session_functionality():
    """Test the session functionality"""
    storage = StorageRepositoryImpl()
    
    # Test creating a session
    session_id = "test-session-123"
    print(f"Creating session: {session_id}")
    await storage.init_session(session_id)
    
    # Test getting session info
    print("Getting session info...")
    session_info = await storage.get_session_info(session_id)
    print(f"Session info: {session_info}")
    
    # Test saving a message
    print("Saving a test message...")
    await storage.save_message(session_id, "Hello, this is a test message!")
    
    # Test loading history
    print("Loading history...")
    from models.websocket import WebsocketMessage
    history = await storage.load_history(session_id)
    print(f"History: {history}")
    
    # Test saving LLM state
    print("Saving LLM state...")
    test_state = {"conversation": "test", "agents": ["agent1", "agent2"]}
    await storage.save_llm_state(session_id, test_state)
    
    # Test loading LLM state
    print("Loading LLM state...")
    loaded_state = await storage.load_llm_state(session_id)
    print(f"Loaded state: {loaded_state}")
    
    # Test listing sessions
    print("Listing sessions...")
    sessions = await storage.list_sessions()
    print(f"Sessions: {sessions}")
    
    print("All tests passed!")

if __name__ == "__main__":
    asyncio.run(test_session_functionality()) 