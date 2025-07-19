# Weaviate Driver

A comprehensive application for managing and searching through academic papers, text documents, and conversations using Weaviate vector database.

## 🏗️ Architecture

The application consists of three main components:

- **Frontend**: Next.js application with TypeScript
- **Backend**: FastAPI Python server with MySQL database
- **Weaviate**: Vector database for semantic search

## 🚀 Quick Start

### Prerequisites

- Docker and Docker Compose
- Python 3.12+ (for local development)
- Node.js 18+ (for local development)

### Running with Docker Compose

1. **Clone the repository**:

```bash
git clone <repository-url>
cd weaviate-driver
```

2. **Start all services**:

```bash
docker-compose up -d
```

3. **Verify the setup**:

```bash
python test_setup.py
```

4. **Access the application**:

- Frontend: http://localhost:3000
- Backend API: http://localhost:8002
- Weaviate: http://localhost:8080

## 📁 Project Structure

```
weaviate-driver/
├── frontend/                 # Next.js frontend application
│   ├── src/
│   │   ├── app/             # Next.js app router
│   │   ├── components/      # React components
│   │   ├── lib/            # Utility libraries
│   │   └── hooks/          # Custom React hooks
│   └── Dockerfile
├── backend/                 # FastAPI Python backend
│   ├── routers/            # API route handlers
│   ├── misc/
│   │   ├── database/       # Database models and services
│   │   └── di/            # Dependency injection
│   ├── lib/               # Core libraries
│   ├── models/            # Data models
│   ├── server.py          # Main server file
│   └── Dockerfile
├── storage/               # Shared storage volume
├── docker-compose.yml     # Docker Compose configuration
└── test_setup.py         # Setup verification script
```

## 🔧 Services

### Frontend (Port 3000)

- **Framework**: Next.js with TypeScript
- **Features**:
  - Paper upload and management
  - Text storage and search
  - Chat interface
  - PDF preview
  - Real-time streaming

### Backend (Port 8002)

- **Framework**: FastAPI with Python
- **Database**: PostgreSQL with SQLAlchemy
- **Features**:
  - REST API endpoints
  - WebSocket support
  - Database management
  - File processing

### Weaviate (Port 8080)

- **Purpose**: Vector database for semantic search
- **Features**:
  - Document embeddings
  - Similarity search
  - Text2Vec OpenAI integration

### PostgreSQL (Port 5432)

- **Purpose**: Relational database for application data
- **Features**:
  - Session management
  - Conversation history
  - Agent states
  - User data

## 🛠️ Development

### Local Development Setup

#### Backend Development

1. **Install dependencies**:

```bash
cd backend
uv sync
```

2. **Set up environment variables**:
   Create a `.env` file in the backend directory:

```bash
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/weaviate_driver
STORAGE_PATH=./storage
HOST=0.0.0.0
PORT=8002
WEAVIATE_URL=http://localhost:8080
```

3. **Start PostgreSQL** (if not using Docker):

```bash
docker run -d --name postgres \
  -e POSTGRES_DB=weaviate_driver \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -p 5432:5432 \
  postgres:15
```

4. **Initialize database**:

```bash
python init_db.py
```

5. **Run the server**:

```bash
uv run python server.py
```

#### Frontend Development

1. **Install dependencies**:

```bash
cd frontend
npm install
```

2. **Run development server**:

```bash
npm run dev
```

### Database Management

The backend uses SQLAlchemy with the following main tables:

- **sessions**: Conversation sessions
- **agents**: AI agents in conversations
- **messages**: Conversation messages
- **agent_states**: State management for agents
- **team_states**: Team conversation state
- **conversation_chunks**: Chunks for semantic search

## 📚 API Documentation

### Backend API Endpoints

- `GET /` - API status
- `GET /health` - Health check
- `WS /ws` - WebSocket connection
- `GET /history/*` - Conversation history

### Weaviate API

- `GET /v1/.well-known/ready` - Health check
- `POST /v1/objects` - Create objects
- `GET /v1/objects` - Search objects

## 🔍 Testing

Run the test script to verify your setup:

```bash
python test_setup.py
```

This will test:

- Backend server health
- Weaviate connectivity
- Frontend accessibility

## 🐛 Troubleshooting

### Common Issues

1. **Port conflicts**: Ensure ports 3000, 8002, 5432, and 8080 are available
2. **Database connection**: Check PostgreSQL is running and accessible
3. **Dependencies**: Run `uv sync` in backend and `npm install` in frontend

### Logs

View service logs:

```bash
# All services
docker-compose logs

# Specific service
docker-compose logs backend
docker-compose logs frontend
docker-compose logs weaviate
docker-compose logs postgres
```

### Reset Everything

To start fresh:

```bash
docker-compose down -v
docker-compose up -d
```

## 📝 License

[Add your license information here]

## 🤝 Contributing

[Add contribution guidelines here]
