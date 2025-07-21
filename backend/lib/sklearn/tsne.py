import numpy as np
from sklearn.manifold import TSNE
from typing import List, Dict, Tuple
from result import Result, Ok, Err
from lib.weaviate.get_all import get_all_papers

def perform_tsne(vectors: List[List[float]], ids: List[str], 
                 n_components: int = 2, perplexity: float = 30.0, 
                 random_state: int = 42) -> Result[List[Dict[str, float | str]], str]:
    """
    Perform tSNE dimensionality reduction on embedding vectors.
    
    Args:
        vectors: List of embedding vectors (expected shape: (N, 1536))
        ids: List of corresponding IDs
        n_components: Number of dimensions for output (default: 2)
        perplexity: tSNE perplexity parameter (default: 30.0)
        random_state: Random seed for reproducibility (default: 42)
    
    Returns:
        Result containing list of dictionaries with id, x, y coordinates
    """
    try:
        if not vectors or not ids:
            return Err("No vectors or IDs provided")
        
        if len(vectors) != len(ids):
            return Err("Number of vectors and IDs must match")
        
        # Convert to numpy array
        vectors_array = np.array(vectors)
        
        # Perform tSNE
        tsne = TSNE(
            n_components=n_components,
            perplexity=min(perplexity, len(vectors) - 1),  # Ensure perplexity is valid
            random_state=random_state,
            n_jobs=-1  # Use all available cores
        )
        
        # Fit and transform the vectors
        coordinates = tsne.fit_transform(vectors_array)
        
        # Convert to list of dictionaries
        result = []
        for i, (id_val, coord) in enumerate(zip(ids, coordinates)):
            result.append({
                "id": id_val,
                "x": float(coord[0]),
                "y": float(coord[1])
            })
        
        return Ok(result)
        
    except Exception as e:
        return Err(f"tSNE computation failed: {str(e)}")

def get_papers_with_tsne(perplexity: float = 30.0, 
                        random_state: int = 42) -> Result[List[Dict[str, float | str]], str]:
    """
    Get all papers with their embedding vectors and perform tSNE to get 2D coordinates.
    
    Args:
        perplexity: tSNE perplexity parameter (default: 30.0)
        random_state: Random seed for reproducibility (default: 42)
    
    Returns:
        Result containing list of dictionaries with id, x, y coordinates
    """
    try:
        # Get all papers with their vectors
        papers_data = get_all_papers(include_vectors=True)
        
        if not papers_data:
            return Err("No papers found")
        
        # Extract vectors and IDs
        vectors = []
        ids = []
        
        for paper in papers_data:
            # Check if the paper has a vector
            if "vector" in paper and paper["vector"] is not None:
                vectors.append(paper["vector"])
                ids.append(paper["uuid"])
        
        if not vectors:
            return Err("No embedding vectors found in papers data")
        
        # Perform tSNE
        return perform_tsne(vectors, ids, perplexity=perplexity, random_state=random_state)
        
    except Exception as e:
        return Err(f"Failed to get papers with tSNE: {str(e)}")

def get_tsne_coordinates_from_vectors(vectors: List[List[float]], 
                                    ids: List[str],
                                    perplexity: float = 30.0,
                                    random_state: int = 42) -> Result[List[Dict[str, float | str]], str]:
    """
    Convenience function to get tSNE coordinates from vectors and IDs.
    
    Args:
        vectors: List of embedding vectors
        ids: List of corresponding IDs
        perplexity: tSNE perplexity parameter (default: 30.0)
        random_state: Random seed for reproducibility (default: 42)
    
    Returns:
        Result containing list of dictionaries with id, x, y coordinates
    """
    return perform_tsne(vectors, ids, perplexity=perplexity, random_state=random_state)
