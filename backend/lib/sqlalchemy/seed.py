from lib.sqlalchemy.db import SessionLocal, engine
from backend.lib.sqlalchemy.sqlalchemy_models import User, Paper, PaperChunk
from sqlalchemy.orm import sessionmaker
import json

def seed_database():
    """Seed the database with example data"""
    db = SessionLocal()
    
    try:
        # Check if data already exists
        existing_users = db.query(User).count()
        if existing_users > 0:
            print("Database already seeded. Skipping...")
            return
        
        # Create example users
        user1 = User(
            email="john.doe@example.com",
            name="John Doe"
        )
        user2 = User(
            email="jane.smith@example.com", 
            name="Jane Smith"
        )
        
        db.add(user1)
        db.add(user2)
        db.flush()  # Flush to get IDs
        
        # Create example papers
        paper1 = Paper(
            title="Introduction to Machine Learning",
            abstract="This paper provides a comprehensive introduction to machine learning concepts and algorithms.",
            author_id=user1.id,
            journal="Journal of Computer Science",
            volume="15",
            number="3",
            pages="1-25",
            year="2023",
            publisher="ACM",
            doi="10.1145/123456789"
        )
        
        paper2 = Paper(
            title="Deep Learning Applications in Natural Language Processing",
            abstract="An exploration of deep learning techniques applied to natural language processing tasks.",
            author_id=user2.id,
            journal="Computational Linguistics",
            volume="48",
            number="2",
            pages="45-78",
            year="2023",
            publisher="MIT Press",
            doi="10.1162/123456789"
        )
        
        db.add(paper1)
        db.add(paper2)
        db.flush()
        
        # Create example paper chunks
        chunk1 = PaperChunk(
            paper_id=paper1.id,
            text="Machine learning is a subset of artificial intelligence that focuses on algorithms and statistical models.",
            chunk_index=0,
            embedding_vector=json.dumps([0.1, 0.2, 0.3, 0.4, 0.5])
        )
        
        chunk2 = PaperChunk(
            paper_id=paper1.id,
            text="These algorithms enable computers to improve their performance on a specific task through experience.",
            chunk_index=1,
            embedding_vector=json.dumps([0.2, 0.3, 0.4, 0.5, 0.6])
        )
        
        chunk3 = PaperChunk(
            paper_id=paper2.id,
            text="Deep learning has revolutionized natural language processing by introducing neural network architectures.",
            chunk_index=0,
            embedding_vector=json.dumps([0.3, 0.4, 0.5, 0.6, 0.7])
        )
        
        chunk4 = PaperChunk(
            paper_id=paper2.id,
            text="Transformers and attention mechanisms have become the foundation of modern NLP systems.",
            chunk_index=1,
            embedding_vector=json.dumps([0.4, 0.5, 0.6, 0.7, 0.8])
        )
        
        db.add(chunk1)
        db.add(chunk2)
        db.add(chunk3)
        db.add(chunk4)
        
        # Commit all changes
        db.commit()
        print("Database seeded successfully!")
        print(f"Created {db.query(User).count()} users")
        print(f"Created {db.query(Paper).count()} papers")
        print(f"Created {db.query(PaperChunk).count()} paper chunks")
        
    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
