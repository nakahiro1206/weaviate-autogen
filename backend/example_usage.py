#!/usr/bin/env python3
"""
Example usage of the SQLAlchemy models
"""
from lib.sqlalchemy.db import SessionLocal
from backend.lib.sqlalchemy.sqlalchemy_models import User, Paper, PaperChunk
from sqlalchemy import func

def main():
    """Demonstrate basic database operations"""
    db = SessionLocal()
    
    try:
        print("=== Database Query Examples ===\n")
        
        # Get all users
        print("1. All Users:")
        users = db.query(User).all()
        for user in users:
            print(f"   - {user.name} ({user.email})")
        
        print("\n2. All Papers with Authors:")
        papers = db.query(Paper).join(User).all()
        for paper in papers:
            print(f"   - '{paper.title}' by {paper.author.name}")
            print(f"     Journal: {paper.journal}, Year: {paper.year}")
        
        print("\n3. Paper Chunks for First Paper:")
        first_paper = db.query(Paper).first()
        if first_paper:
            chunks = db.query(PaperChunk).filter(PaperChunk.paper_id == first_paper.id).order_by(PaperChunk.chunk_index).all()
            for chunk in chunks:
                print(f"   - Chunk {chunk.chunk_index}: {chunk.text[:60]}...")
        
        print("\n4. User with Most Papers:")
        user_with_most_papers = db.query(User).join(Paper).group_by(User.id).order_by(func.count(Paper.id).desc()).first()
        if user_with_most_papers:
            paper_count = db.query(Paper).filter(Paper.author_id == user_with_most_papers.id).count()
            print(f"   - {user_with_most_papers.name} has {paper_count} paper(s)")
        
        print("\n5. Search Papers by Title:")
        search_term = "Machine Learning"
        matching_papers = db.query(Paper).filter(Paper.title.ilike(f"%{search_term}%")).all()
        for paper in matching_papers:
            print(f"   - {paper.title}")
        
    except Exception as e:
        print(f"Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    main() 