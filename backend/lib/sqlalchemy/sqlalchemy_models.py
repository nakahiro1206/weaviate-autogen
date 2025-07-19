from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Float, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from lib.sqlalchemy.db import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    name = Column(String(255), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationship
    papers = relationship("Paper", back_populates="author")

class Paper(Base):
    __tablename__ = "papers"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(500), nullable=False)
    abstract = Column(Text)
    author_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    journal = Column(String(255))
    volume = Column(String(50))
    number = Column(String(50))
    pages = Column(String(100))
    year = Column(String(4))
    publisher = Column(String(255))
    doi = Column(String(255), unique=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationship
    author = relationship("User", back_populates="papers")
    chunks = relationship("PaperChunk", back_populates="paper")

class PaperChunk(Base):
    __tablename__ = "paper_chunks"
    
    id = Column(Integer, primary_key=True, index=True)
    paper_id = Column(Integer, ForeignKey("papers.id"), nullable=False)
    text = Column(Text, nullable=False)
    chunk_index = Column(Integer, nullable=False)
    embedding_vector = Column(Text)  # Store as JSON string for now
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationship
    paper = relationship("Paper", back_populates="chunks") 

class WebsocketSession(Base):
    __tablename__ = "websocket_sessions"
    
    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String(255), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    llm_state = Column(JSON, nullable=False) # Stringified JSON
    
    # Relationship
    messages = relationship("WebsocketMessage", back_populates="session")

class WebsocketMessage(Base):
    __tablename__ = "websocket_messages"
    
    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("websocket_sessions.id"), nullable=False)
    message = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationship
    session = relationship("WebsocketSession", back_populates="messages")