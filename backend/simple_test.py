#!/usr/bin/env python3
"""
Simple test script for database connection
"""
import psycopg2
import json
from datetime import datetime

def test_direct_connection():
    """Test direct database connection"""
    try:
        # Connect directly to the database
        conn = psycopg2.connect(
            host="localhost",
            port=5432,
            database="weaviate_driver",
            user="postgres",
            password="postgres"
        )
        
        print("✅ Database connection successful!")
        
        # Test creating a session
        cursor = conn.cursor()
        
        # Insert a test session
        session_id = "test-session-direct"
        cursor.execute("""
            INSERT INTO websocket_sessions (session_id, llm_state) 
            VALUES (%s, %s)
        """, (session_id, json.dumps({})))
        
        # Insert a test message
        cursor.execute("""
            INSERT INTO websocket_messages (session_id, message) 
            VALUES ((SELECT id FROM websocket_sessions WHERE session_id = %s), %s)
        """, (session_id, "Test message from direct connection"))
        
        conn.commit()
        print("✅ Session and message created successfully!")
        
        # Query the data
        cursor.execute("""
            SELECT ws.session_id, wm.message 
            FROM websocket_sessions ws 
            LEFT JOIN websocket_messages wm ON ws.id = wm.session_id 
            WHERE ws.session_id = %s
        """, (session_id,))
        
        results = cursor.fetchall()
        print(f"✅ Query results: {results}")
        
        cursor.close()
        conn.close()
        
        print("✅ All tests passed!")
        
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    test_direct_connection() 