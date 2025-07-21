from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any
from result import is_ok, is_err
from lib.sklearn.tsne import get_papers_with_tsne, perform_tsne

router = APIRouter(prefix="/tsne", tags=["tSNE"])

@router.get("/papers", response_model=List[Dict[str, float | str]])
async def get_papers_tsne_coordinates(
    perplexity: float = 30.0,
    random_state: int = 42
) -> List[Dict[str, float | str]]:
    """
    Get tSNE coordinates for all papers in the database.
    
    Args:
        perplexity: tSNE perplexity parameter (default: 30.0)
        random_state: Random seed for reproducibility (default: 42)
    
    Returns:
        List of dictionaries with id, x, y coordinates for each paper
    """
    result = get_papers_with_tsne(perplexity=perplexity, random_state=random_state)
    
    if is_err(result):
        raise HTTPException(status_code=500, detail=result.unwrap_err())
    
    return result.unwrap()

@router.post("/vectors", response_model=List[Dict[str, float | str]])
async def get_tsne_coordinates_from_vectors(
    vectors: List[List[float]],
    ids: List[str],
    perplexity: float = 30.0,
    random_state: int = 42
) -> List[Dict[str, float | str]]:
    """
    Get tSNE coordinates from custom vectors.
    
    Args:
        vectors: List of embedding vectors
        ids: List of corresponding IDs
        perplexity: tSNE perplexity parameter (default: 30.0)
        random_state: Random seed for reproducibility (default: 42)
    
    Returns:
        List of dictionaries with id, x, y coordinates
    """
    result = perform_tsne(vectors, ids, perplexity=perplexity, random_state=random_state)
    
    if is_err(result):
        raise HTTPException(status_code=500, detail=result.unwrap_err())
    
    return result.unwrap() 