# Database Setup and Models

This document describes the database setup, SQLAlchemy models, and how to use them.

## Overview

We've set up a PostgreSQL database with SQLAlchemy ORM and Alembic for migrations. The database includes three main models:

1. **User** - Represents users/authors
2. **Paper** - Represents academic papers
3. **PaperChunk** - Represents text chunks from papers (for search/retrieval)

## Database Configuration

The database is configured using environment variables:

- `POSTGRES_USER=postgres`
- `POSTGRES_PASSWORD=postgres`
- `POSTGRES_HOST=localhost`
- `POSTGRES_PORT=5432`
- `POSTGRES_DB=weaviate_driver`

## Models

### User Model

```python
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    name = Column(String(255), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationship
    papers = relationship("Paper", back_populates="author")
```

### Paper Model

```python
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

    # Relationships
    author = relationship("User", back_populates="papers")
    chunks = relationship("PaperChunk", back_populates="paper")
```

### PaperChunk Model

```python
class PaperChunk(Base):
    __tablename__ = "paper_chunks"

    id = Column(Integer, primary_key=True, index=True)
    paper_id = Column(Integer, ForeignKey("papers.id"), nullable=False)
    text = Column(Text, nullable=False)
    chunk_index = Column(Integer, nullable=False)
    embedding_vector = Column(Text)  # Store as JSON string
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationship
    paper = relationship("Paper", back_populates="chunks")
```

## Setup Instructions

### 1. Start the Database

```bash
docker-compose up postgres -d
```

### 2. Run Migrations

```bash
cd backend
source .venv/bin/activate
alembic upgrade head
```

### 3. Seed the Database

```bash
python -m lib.sqlalchemy.seed
```

### 4. Verify Setup

```bash
python example_usage.py
```

## Database Operations

### Basic Queries

```python
from lib.sqlalchemy.db import SessionLocal
from models.sqlalchemy_models import User, Paper, PaperChunk

db = SessionLocal()

# Get all users
users = db.query(User).all()

# Get papers with authors
papers = db.query(Paper).join(User).all()

# Get chunks for a paper
chunks = db.query(PaperChunk).filter(PaperChunk.paper_id == paper_id).all()

db.close()
```

### Creating New Records

```python
# Create a new user
new_user = User(
    email="newuser@example.com",
    name="New User"
)
db.add(new_user)
db.commit()

# Create a new paper
new_paper = Paper(
    title="New Research Paper",
    abstract="This is a new research paper...",
    author_id=new_user.id,
    journal="Journal of Research",
    year="2024"
)
db.add(new_paper)
db.commit()
```

## Migration Commands

### Create a new migration

```bash
alembic revision --autogenerate -m "Description of changes"
```

### Apply migrations

```bash
alembic upgrade head
```

### Check migration status

```bash
alembic current
```

### Rollback migration

```bash
alembic downgrade -1
```

## Example Data

The seeding script creates:

- 2 users (John Doe and Jane Smith)
- 2 papers (Machine Learning and NLP papers)
- 4 paper chunks (2 chunks per paper)

You can verify the data by running:

```bash
docker exec weaviate-driver-postgres-1 psql -U postgres -d weaviate_driver -c "SELECT * FROM users;"
docker exec weaviate-driver-postgres-1 psql -U postgres -d weaviate_driver -c "SELECT * FROM papers;"
docker exec weaviate-driver-postgres-1 psql -U postgres -d weaviate_driver -c "SELECT * FROM paper_chunks;"
```

## Integration with Existing Code

The SQLAlchemy models complement the existing Pydantic models:

- `models/paper.py` - Pydantic models for API validation
- `models/chunk.py` - Pydantic models for chunk validation
- `models/sqlalchemy_models.py` - SQLAlchemy models for database operations

This allows you to:

1. Use Pydantic models for API input/output validation
2. Use SQLAlchemy models for database operations
3. Convert between them as needed
