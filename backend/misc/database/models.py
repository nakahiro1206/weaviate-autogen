from sqlalchemy import Column, String, Text, Integer, DateTime, ForeignKey, UniqueConstraint, Index
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship, sessionmaker
from sqlalchemy import create_engine
from datetime import datetime
from typing import Optional, Dict, Any, List
import uuid

Base = declarative_base()

class Session(Base):
    __tablename__ = 'sessions'
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255))
    description = Column(Text)
    team_config = Column(JSONB, nullable=False)
    status = Column(String(50), default='active')
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)
    metadata = Column(JSONB, default={})
    
    # Relationships
    agents = relationship("Agent", back_populates="session", cascade="all, delete-orphan")
    messages = relationship("Message", back_populates="session", cascade="all, delete-orphan")
    agent_states = relationship("AgentState", back_populates="session", cascade="all, delete-orphan")
    team_state = relationship("TeamState", back_populates="session", uselist=False, cascade="all, delete-orphan")
    conversation_chunks = relationship("ConversationChunk", back_populates="session", cascade="all, delete-orphan")

class Agent(Base):
    __tablename__ = 'agents'
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    session_id = Column(UUID(as_uuid=True), ForeignKey('sessions.id', ondelete='CASCADE'), nullable=False)
    name = Column(String(100), nullable=False)
    agent_type = Column(String(100), nullable=False)
    system_message = Column(Text)
    model_config = Column(JSONB)
    tools = Column(JSONB)
    description = Column(Text)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    session = relationship("Session", back_populates="agents")
    messages = relationship("Message", back_populates="agent")
    agent_state = relationship("AgentState", back_populates="agent", uselist=False, cascade="all, delete-orphan")

class Message(Base):
    __tablename__ = 'messages'
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    session_id = Column(UUID(as_uuid=True), ForeignKey('sessions.id', ondelete='CASCADE'), nullable=False)
    agent_id = Column(UUID(as_uuid=True), ForeignKey('agents.id', ondelete='SET NULL'))
    source = Column(String(100), nullable=False)
    message_type = Column(String(50), nullable=False)
    content = Column(Text, nullable=False)
    thought = Column(Text)
    models_usage = Column(JSONB)
    metadata = Column(JSONB, default={})
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    sequence_order = Column(Integer, nullable=False)
    
    # Relationships
    session = relationship("Session", back_populates="messages")
    agent = relationship("Agent", back_populates="messages")
    conversation_chunks = relationship("ConversationChunk", back_populates="message", cascade="all, delete-orphan")

class AgentState(Base):
    __tablename__ = 'agent_states'
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    session_id = Column(UUID(as_uuid=True), ForeignKey('sessions.id', ondelete='CASCADE'), nullable=False)
    agent_id = Column(UUID(as_uuid=True), ForeignKey('agents.id', ondelete='CASCADE'), nullable=False)
    state_type = Column(String(100), nullable=False)
    llm_context = Column(JSONB)
    message_buffer = Column(JSONB)
    version = Column(String(20), default='1.0.0')
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    session = relationship("Session", back_populates="agent_states")
    agent = relationship("Agent", back_populates="agent_state")
    
    __table_args__ = (
        UniqueConstraint('session_id', 'agent_id', name='uq_session_agent'),
    )

class TeamState(Base):
    __tablename__ = 'team_states'
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    session_id = Column(UUID(as_uuid=True), ForeignKey('sessions.id', ondelete='CASCADE'), nullable=False)
    team_type = Column(String(100), nullable=False)
    message_thread = Column(JSONB)
    current_turn = Column(Integer, default=0)
    next_speaker_index = Column(Integer, default=0)
    termination_condition = Column(JSONB)
    version = Column(String(20), default='1.0.0')
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    session = relationship("Session", back_populates="team_state")
    
    __table_args__ = (
        UniqueConstraint('session_id', name='uq_session_team_state'),
    )

class ConversationChunk(Base):
    __tablename__ = 'conversation_chunks'
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    session_id = Column(UUID(as_uuid=True), ForeignKey('sessions.id', ondelete='CASCADE'), nullable=False)
    message_id = Column(UUID(as_uuid=True), ForeignKey('messages.id', ondelete='CASCADE'), nullable=False)
    chunk_text = Column(Text, nullable=False)
    chunk_type = Column(String(50), nullable=False)
    embedding_vector = Column(JSONB)  # Store as JSONB for now, can be changed to VECTOR if pgvector is available
    metadata = Column(JSONB, default={})
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    
    # Relationships
    session = relationship("Session", back_populates="conversation_chunks")
    message = relationship("Message", back_populates="conversation_chunks")

# Database connection and session management
class DatabaseManager:
    def __init__(self, database_url: str):
        self.engine = create_engine(database_url)
        self.SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=self.engine)
    
    def create_tables(self):
        """Create all tables"""
        Base.metadata.create_all(bind=self.engine)
    
    def get_session(self):
        """Get database session"""
        return self.SessionLocal()
    
    def close(self):
        """Close database connection"""
        self.engine.dispose()

# Pydantic models for API responses
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from uuid import UUID

class SessionCreate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    team_config: Dict[str, Any]
    metadata: Optional[Dict[str, Any]] = {}

class SessionResponse(BaseModel):
    id: UUID
    name: Optional[str]
    description: Optional[str]
    team_config: Dict[str, Any]
    status: str
    created_at: datetime
    updated_at: datetime
    metadata: Dict[str, Any]
    message_count: int = 0
    agent_count: int = 0
    last_message_at: Optional[datetime] = None

class MessageCreate(BaseModel):
    source: str
    message_type: str
    content: str
    thought: Optional[str] = None
    models_usage: Optional[Dict[str, Any]] = None
    metadata: Optional[Dict[str, Any]] = {}
    sequence_order: int

class MessageResponse(BaseModel):
    id: UUID
    session_id: UUID
    agent_id: Optional[UUID]
    source: str
    message_type: str
    content: str
    thought: Optional[str]
    models_usage: Optional[Dict[str, Any]]
    metadata: Dict[str, Any]
    created_at: datetime
    sequence_order: int

class AgentStateCreate(BaseModel):
    agent_id: UUID
    state_type: str
    llm_context: Optional[Dict[str, Any]] = None
    message_buffer: Optional[Dict[str, Any]] = None
    version: str = "1.0.0"

class TeamStateCreate(BaseModel):
    team_type: str
    message_thread: Optional[List[Dict[str, Any]]] = None
    current_turn: int = 0
    next_speaker_index: int = 0
    termination_condition: Optional[Dict[str, Any]] = None
    version: str = "1.0.0" 