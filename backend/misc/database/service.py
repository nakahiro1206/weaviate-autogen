from typing import List, Optional, Dict, Any, Tuple
from sqlalchemy.orm import Session as DBSession
from sqlalchemy import and_, desc, func
from datetime import datetime
import uuid
import json
from .models import (
    Session, Agent, Message, AgentState, TeamState, ConversationChunk,
    SessionCreate, MessageCreate, AgentStateCreate, TeamStateCreate
)

class ConversationService:
    def __init__(self, db_session: DBSession):
        self.db = db_session
    
    # Session Management
    def create_session(self, session_data: SessionCreate) -> Session:
        """Create a new conversation session"""
        session = Session(
            name=session_data.name,
            description=session_data.description,
            team_config=session_data.team_config,
            metadata=session_data.metadata
        )
        self.db.add(session)
        self.db.commit()
        self.db.refresh(session)
        return session
    
    def get_session(self, session_id: uuid.UUID) -> Optional[Session]:
        """Get session by ID"""
        return self.db.query(Session).filter(Session.id == session_id).first()
    
    def get_sessions(self, limit: int = 50, offset: int = 0) -> List[Session]:
        """Get paginated list of sessions"""
        return self.db.query(Session).order_by(desc(Session.updated_at)).offset(offset).limit(limit).all()
    
    def update_session_status(self, session_id: uuid.UUID, status: str) -> Optional[Session]:
        """Update session status"""
        session = self.get_session(session_id)
        if session:
            session.status = status
            session.updated_at = datetime.utcnow()
            self.db.commit()
            self.db.refresh(session)
        return session
    
    # Agent Management
    def create_agent(self, session_id: uuid.UUID, agent_data: Dict[str, Any]) -> Agent:
        """Create an agent for a session"""
        agent = Agent(
            session_id=session_id,
            name=agent_data['name'],
            agent_type=agent_data['agent_type'],
            system_message=agent_data.get('system_message'),
            model_config=agent_data.get('model_config'),
            tools=agent_data.get('tools'),
            description=agent_data.get('description')
        )
        self.db.add(agent)
        self.db.commit()
        self.db.refresh(agent)
        return agent
    
    def get_session_agents(self, session_id: uuid.UUID) -> List[Agent]:
        """Get all agents for a session"""
        return self.db.query(Agent).filter(Agent.session_id == session_id).all()
    
    # Message Management
    def add_message(self, session_id: uuid.UUID, message_data: MessageCreate, agent_id: Optional[uuid.UUID] = None) -> Message:
        """Add a message to the conversation"""
        message = Message(
            session_id=session_id,
            agent_id=agent_id,
            source=message_data.source,
            message_type=message_data.message_type,
            content=message_data.content,
            thought=message_data.thought,
            models_usage=message_data.models_usage,
            metadata=message_data.metadata,
            sequence_order=message_data.sequence_order
        )
        self.db.add(message)
        self.db.commit()
        self.db.refresh(message)
        return message
    
    def get_conversation_history(self, session_id: uuid.UUID, limit: Optional[int] = None) -> List[Message]:
        """Get conversation history for a session"""
        query = self.db.query(Message).filter(Message.session_id == session_id).order_by(Message.sequence_order)
        if limit:
            query = query.limit(limit)
        return query.all()
    
    def get_next_sequence_order(self, session_id: uuid.UUID) -> int:
        """Get the next sequence order for a session"""
        result = self.db.query(func.max(Message.sequence_order)).filter(Message.session_id == session_id).scalar()
        return (result or 0) + 1
    
    # Agent State Management
    def save_agent_state(self, session_id: uuid.UUID, agent_id: uuid.UUID, state_data: AgentStateCreate) -> AgentState:
        """Save or update agent state"""
        existing_state = self.db.query(AgentState).filter(
            and_(AgentState.session_id == session_id, AgentState.agent_id == agent_id)
        ).first()
        
        if existing_state:
            existing_state.state_type = state_data.state_type
            existing_state.llm_context = state_data.llm_context
            existing_state.message_buffer = state_data.message_buffer
            existing_state.version = state_data.version
            existing_state.updated_at = datetime.utcnow()
            self.db.commit()
            self.db.refresh(existing_state)
            return existing_state
        else:
            new_state = AgentState(
                session_id=session_id,
                agent_id=agent_id,
                state_type=state_data.state_type,
                llm_context=state_data.llm_context,
                message_buffer=state_data.message_buffer,
                version=state_data.version
            )
            self.db.add(new_state)
            self.db.commit()
            self.db.refresh(new_state)
            return new_state
    
    def get_agent_state(self, session_id: uuid.UUID, agent_id: uuid.UUID) -> Optional[AgentState]:
        """Get agent state"""
        return self.db.query(AgentState).filter(
            and_(AgentState.session_id == session_id, AgentState.agent_id == agent_id)
        ).first()
    
    def get_session_agent_states(self, session_id: uuid.UUID) -> List[AgentState]:
        """Get all agent states for a session"""
        return self.db.query(AgentState).filter(AgentState.session_id == session_id).all()
    
    # Team State Management
    def save_team_state(self, session_id: uuid.UUID, team_data: TeamStateCreate) -> TeamState:
        """Save or update team state"""
        existing_state = self.db.query(TeamState).filter(TeamState.session_id == session_id).first()
        
        if existing_state:
            existing_state.team_type = team_data.team_type
            existing_state.message_thread = team_data.message_thread
            existing_state.current_turn = team_data.current_turn
            existing_state.next_speaker_index = team_data.next_speaker_index
            existing_state.termination_condition = team_data.termination_condition
            existing_state.version = team_data.version
            existing_state.updated_at = datetime.utcnow()
            self.db.commit()
            self.db.refresh(existing_state)
            return existing_state
        else:
            new_state = TeamState(
                session_id=session_id,
                team_type=team_data.team_type,
                message_thread=team_data.message_thread,
                current_turn=team_data.current_turn,
                next_speaker_index=team_data.next_speaker_index,
                termination_condition=team_data.termination_condition,
                version=team_data.version
            )
            self.db.add(new_state)
            self.db.commit()
            self.db.refresh(new_state)
            return new_state
    
    def get_team_state(self, session_id: uuid.UUID) -> Optional[TeamState]:
        """Get team state"""
        return self.db.query(TeamState).filter(TeamState.session_id == session_id).first()
    
    # Conversation Chunks for Semantic Search
    def add_conversation_chunk(self, session_id: uuid.UUID, message_id: uuid.UUID, 
                             chunk_text: str, chunk_type: str, 
                             embedding_vector: Optional[List[float]] = None,
                             metadata: Optional[Dict[str, Any]] = None) -> ConversationChunk:
        """Add a conversation chunk for semantic search"""
        chunk = ConversationChunk(
            session_id=session_id,
            message_id=message_id,
            chunk_text=chunk_text,
            chunk_type=chunk_type,
            embedding_vector=embedding_vector,
            metadata=metadata or {}
        )
        self.db.add(chunk)
        self.db.commit()
        self.db.refresh(chunk)
        return chunk
    
    def search_conversation_chunks(self, session_id: uuid.UUID, query: str, 
                                 chunk_type: Optional[str] = None, limit: int = 10) -> List[ConversationChunk]:
        """Search conversation chunks by text content"""
        query_filter = ConversationChunk.session_id == session_id
        if chunk_type:
            query_filter = and_(query_filter, ConversationChunk.chunk_type == chunk_type)
        
        return self.db.query(ConversationChunk).filter(query_filter).limit(limit).all()
    
    # Utility Methods
    def get_session_summary(self, session_id: uuid.UUID) -> Dict[str, Any]:
        """Get session summary with message and agent counts"""
        session = self.get_session(session_id)
        if not session:
            return None
        
        message_count = self.db.query(func.count(Message.id)).filter(Message.session_id == session_id).scalar()
        agent_count = self.db.query(func.count(Agent.id)).filter(Agent.session_id == session_id).scalar()
        last_message = self.db.query(Message).filter(Message.session_id == session_id).order_by(desc(Message.created_at)).first()
        
        return {
            'id': session.id,
            'name': session.name,
            'description': session.description,
            'status': session.status,
            'created_at': session.created_at,
            'updated_at': session.updated_at,
            'message_count': message_count,
            'agent_count': agent_count,
            'last_message_at': last_message.created_at if last_message else None
        }
    
    def migrate_from_json(self, session_id: uuid.UUID, team_history: List[Dict], team_state: Dict) -> bool:
        """Migrate data from JSON files to database"""
        try:
            # Create session if it doesn't exist
            session = self.get_session(session_id)
            if not session:
                session = Session(
                    id=session_id,
                    name="Migrated Session",
                    team_config=team_state.get('team_config', {}),
                    status='active'
                )
                self.db.add(session)
                self.db.commit()
                self.db.refresh(session)
            
            # Migrate messages
            for i, msg_data in enumerate(team_history):
                message = Message(
                    session_id=session_id,
                    source=msg_data.get('source', 'unknown'),
                    message_type=msg_data.get('type', 'TextMessage'),
                    content=msg_data.get('content', ''),
                    models_usage=msg_data.get('models_usage'),
                    metadata=msg_data.get('metadata', {}),
                    sequence_order=i + 1,
                    created_at=datetime.fromisoformat(msg_data.get('created_at', datetime.utcnow().isoformat()))
                )
                self.db.add(message)
            
            # Migrate team state
            if 'agent_states' in team_state:
                for agent_name, agent_state_data in team_state['agent_states'].items():
                    # Create agent if needed
                    agent = self.db.query(Agent).filter(
                        and_(Agent.session_id == session_id, Agent.name == agent_name)
                    ).first()
                    
                    if not agent:
                        agent = Agent(
                            session_id=session_id,
                            name=agent_name,
                            agent_type=agent_state_data.get('type', 'AssistantAgent'),
                            system_message=agent_state_data.get('system_message')
                        )
                        self.db.add(agent)
                        self.db.commit()
                        self.db.refresh(agent)
                    
                    # Save agent state
                    self.save_agent_state(
                        session_id=session_id,
                        agent_id=agent.id,
                        state_data=AgentStateCreate(
                            agent_id=agent.id,
                            state_type=agent_state_data.get('type', 'AssistantAgentState'),
                            llm_context=agent_state_data.get('llm_context'),
                            message_buffer=agent_state_data.get('message_buffer')
                        )
                    )
            
            self.db.commit()
            return True
            
        except Exception as e:
            self.db.rollback()
            print(f"Migration failed: {e}")
            return False 