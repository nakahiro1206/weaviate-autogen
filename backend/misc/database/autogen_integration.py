from typing import Dict, Any, List, Optional
import uuid
import json
from datetime import datetime
from autogen_agentchat.teams import RoundRobinGroupChat, SelectorGroupChat
from autogen_agentchat.agents import AssistantAgent, UserProxyAgent
from autogen_agentchat.messages import TextMessage, AgentMessage
from autogen_agentchat.base import TaskResult
from .service import ConversationService
from .models import SessionCreate, MessageCreate, AgentStateCreate, TeamStateCreate

class AutoGenDatabaseIntegration:
    def __init__(self, conversation_service: ConversationService):
        self.service = conversation_service
    
    def create_session_from_team(self, team: RoundRobinGroupChat | SelectorGroupChat, 
                                name: Optional[str] = None, description: Optional[str] = None) -> uuid.UUID:
        """Create a database session from an AutoGen team"""
        
        # Extract team configuration
        team_config = {
            'team_type': type(team).__name__,
            'participants': [],
            'termination_condition': None
        }
        
        # Extract agent configurations
        for agent in team.agents:
            agent_config = {
                'name': agent.name,
                'agent_type': type(agent).__name__,
                'system_message': getattr(agent, 'system_message', None),
                'description': getattr(agent, 'description', None)
            }
            team_config['participants'].append(agent_config)
        
        # Create session
        session_data = SessionCreate(
            name=name or f"AutoGen Session {datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')}",
            description=description,
            team_config=team_config
        )
        
        session = self.service.create_session(session_data)
        
        # Create agents in database
        for agent in team.agents:
            agent_data = {
                'name': agent.name,
                'agent_type': type(agent).__name__,
                'system_message': getattr(agent, 'system_message', None),
                'description': getattr(agent, 'description', None)
            }
            self.service.create_agent(session.id, agent_data)
        
        return session.id
    
    def save_team_state(self, session_id: uuid.UUID, team: RoundRobinGroupChat | SelectorGroupChat) -> bool:
        """Save current team state to database"""
        try:
            # Get current state from team
            team_state = team.save_state()
            
            # Extract message thread
            message_thread = []
            if hasattr(team, 'message_thread'):
                for msg in team.message_thread:
                    message_data = {
                        'id': str(msg.get('id', uuid.uuid4())),
                        'source': msg.get('source', 'unknown'),
                        'content': msg.get('content', ''),
                        'type': msg.get('type', 'TextMessage'),
                        'created_at': msg.get('created_at', datetime.utcnow().isoformat()),
                        'models_usage': msg.get('models_usage'),
                        'metadata': msg.get('metadata', {})
                    }
                    message_thread.append(message_data)
            
            # Create team state data
            team_state_data = TeamStateCreate(
                team_type=type(team).__name__,
                message_thread=message_thread,
                current_turn=getattr(team, 'current_turn', 0),
                next_speaker_index=getattr(team, 'next_speaker_index', 0),
                termination_condition=team_state.get('termination_condition'),
                version=team_state.get('version', '1.0.0')
            )
            
            self.service.save_team_state(session_id, team_state_data)
            
            # Save individual agent states
            if 'agent_states' in team_state:
                for agent_name, agent_state_data in team_state['agent_states'].items():
                    # Find agent in database
                    agents = self.service.get_session_agents(session_id)
                    agent = next((a for a in agents if a.name == agent_name), None)
                    
                    if agent:
                        state_data = AgentStateCreate(
                            agent_id=agent.id,
                            state_type=agent_state_data.get('type', 'AssistantAgentState'),
                            llm_context=agent_state_data.get('llm_context'),
                            message_buffer=agent_state_data.get('message_buffer'),
                            version=agent_state_data.get('version', '1.0.0')
                        )
                        self.service.save_agent_state(session_id, agent.id, state_data)
            
            return True
            
        except Exception as e:
            print(f"Failed to save team state: {e}")
            return False
    
    def load_team_state(self, session_id: uuid.UUID, team: RoundRobinGroupChat | SelectorGroupChat) -> bool:
        """Load team state from database"""
        try:
            # Get team state from database
            team_state_db = self.service.get_team_state(session_id)
            if not team_state_db:
                return False
            
            # Reconstruct team state object
            team_state = {
                'type': 'TeamState',
                'version': team_state_db.version,
                'agent_states': {}
            }
            
            # Load agent states
            agent_states = self.service.get_session_agent_states(session_id)
            for agent_state in agent_states:
                agent = self.service.db.query(self.service.db.query().filter(
                    self.service.db.query().filter.id == agent_state.agent_id
                ).first()
                
                if agent:
                    team_state['agent_states'][agent.name] = {
                        'type': agent_state.state_type,
                        'version': agent_state.version,
                        'llm_context': agent_state.llm_context,
                        'message_buffer': agent_state.message_buffer
                    }
            
            # Load message thread
            if team_state_db.message_thread:
                team_state['message_thread'] = team_state_db.message_thread
            
            # Load team-specific state
            if isinstance(team, RoundRobinGroupChat):
                team_state['current_turn'] = team_state_db.current_turn
                team_state['next_speaker_index'] = team_state_db.next_speaker_index
            
            # Load state into team
            await team.load_state(team_state)
            return True
            
        except Exception as e:
            print(f"Failed to load team state: {e}")
            return False
    
    def save_message(self, session_id: uuid.UUID, message: AgentMessage | TextMessage, 
                    agent_id: Optional[uuid.UUID] = None) -> bool:
        """Save a message to the database"""
        try:
            # Get next sequence order
            sequence_order = self.service.get_next_sequence_order(session_id)
            
            # Create message data
            message_data = MessageCreate(
                source=message.source,
                message_type=type(message).__name__,
                content=message.content,
                thought=getattr(message, 'thought', None),
                models_usage=getattr(message, 'models_usage', None),
                metadata=getattr(message, 'metadata', {}),
                sequence_order=sequence_order
            )
            
            # Save message
            saved_message = self.service.add_message(session_id, message_data, agent_id)
            
            # Create conversation chunks for semantic search
            if message.content:
                self._create_conversation_chunks(session_id, saved_message.id, message.content)
            
            return True
            
        except Exception as e:
            print(f"Failed to save message: {e}")
            return False
    
    def _create_conversation_chunks(self, session_id: uuid.UUID, message_id: uuid.UUID, content: str):
        """Create conversation chunks for semantic search"""
        try:
            # Simple chunking - split by sentences or paragraphs
            # In a real implementation, you might want more sophisticated chunking
            chunks = self._split_into_chunks(content)
            
            for i, chunk in enumerate(chunks):
                if chunk.strip():
                    self.service.add_conversation_chunk(
                        session_id=session_id,
                        message_id=message_id,
                        chunk_text=chunk.strip(),
                        chunk_type='message_content',
                        metadata={'chunk_index': i}
                    )
        except Exception as e:
            print(f"Failed to create conversation chunks: {e}")
    
    def _split_into_chunks(self, text: str, max_length: int = 500) -> List[str]:
        """Split text into chunks for semantic search"""
        # Simple sentence-based splitting
        sentences = text.split('. ')
        chunks = []
        current_chunk = ""
        
        for sentence in sentences:
            if len(current_chunk) + len(sentence) < max_length:
                current_chunk += sentence + ". "
            else:
                if current_chunk:
                    chunks.append(current_chunk.strip())
                current_chunk = sentence + ". "
        
        if current_chunk:
            chunks.append(current_chunk.strip())
        
        return chunks
    
    def get_conversation_history(self, session_id: uuid.UUID, limit: Optional[int] = None) -> List[Dict[str, Any]]:
        """Get conversation history from database"""
        messages = self.service.get_conversation_history(session_id, limit)
        
        history = []
        for message in messages:
            history.append({
                'id': str(message.id),
                'source': message.source,
                'type': message.message_type,
                'content': message.content,
                'thought': message.thought,
                'models_usage': message.models_usage,
                'metadata': message.metadata,
                'created_at': message.created_at.isoformat(),
                'sequence_order': message.sequence_order
            })
        
        return history
    
    def search_conversations(self, session_id: uuid.UUID, query: str, 
                           chunk_type: Optional[str] = None, limit: int = 10) -> List[Dict[str, Any]]:
        """Search conversations by content"""
        chunks = self.service.search_conversation_chunks(session_id, query, chunk_type, limit)
        
        results = []
        for chunk in chunks:
            results.append({
                'id': str(chunk.id),
                'chunk_text': chunk.chunk_text,
                'chunk_type': chunk.chunk_type,
                'message_id': str(chunk.message_id),
                'metadata': chunk.metadata,
                'created_at': chunk.created_at.isoformat()
            })
        
        return results
    
    def migrate_from_json_files(self, session_id: uuid.UUID, 
                              team_history_path: str, team_state_path: str) -> bool:
        """Migrate data from JSON files to database"""
        try:
            # Load JSON files
            with open(team_history_path, 'r') as f:
                team_history = json.load(f)
            
            with open(team_state_path, 'r') as f:
                team_state = json.load(f)
            
            # Use the migration method from service
            return self.service.migrate_from_json(session_id, team_history, team_state)
            
        except Exception as e:
            print(f"Failed to migrate from JSON files: {e}")
            return False 