# tSNE Implementation for Paper Visualization

This module provides t-distributed Stochastic Neighbor Embedding (tSNE) functionality for visualizing paper embeddings in 2D space.

## Overview

tSNE is a dimensionality reduction technique that is particularly well-suited for embedding high-dimensional data in a low-dimensional space for visualization. It preserves local structure and clusters similar papers together.

## Features

- **Paper Visualization**: Generate 2D coordinates for all papers in the database
- **Custom Vector Support**: Apply tSNE to custom embedding vectors
- **Configurable Parameters**: Adjust perplexity and random seed for different results
- **API Endpoints**: RESTful API for easy integration
- **Error Handling**: Robust error handling with Result types

## Usage

### Python API

```python
from lib.sklearn.tsne import get_papers_with_tsne, perform_tsne

# Get tSNE coordinates for all papers
result = get_papers_with_tsne(perplexity=30.0, random_state=42)
if result.is_ok():
    coordinates = result.unwrap()
    # coordinates is a list of dicts: [{"id": "uuid", "x": 1.23, "y": 4.56}, ...]
```

### Custom Vectors

```python
# Apply tSNE to custom vectors
vectors = [[1.0, 2.0, 3.0], [4.0, 5.0, 6.0], ...]
ids = ["paper_1", "paper_2", ...]
result = perform_tsne(vectors, ids, perplexity=30.0)
```

### REST API

#### Get Papers with tSNE Coordinates

```bash
GET /api/v1/tsne/papers?perplexity=30.0&random_state=42
```

Response:

```json
[
  {"id": "uuid1", "x": 1.234, "y": 5.678},
  {"id": "uuid2", "x": 2.345, "y": 6.789},
  ...
]
```

#### Apply tSNE to Custom Vectors

```bash
POST /api/v1/tsne/vectors
Content-Type: application/json

{
  "vectors": [[1.0, 2.0, 3.0], [4.0, 5.0, 6.0]],
  "ids": ["paper_1", "paper_2"],
  "perplexity": 30.0,
  "random_state": 42
}
```

## Parameters

- **perplexity** (float, default: 30.0): Controls the balance between local and global structure. Lower values focus on local structure, higher values on global structure.
- **random_state** (int, default: 42): Random seed for reproducible results.
- **n_components** (int, default: 2): Number of output dimensions (typically 2 for visualization).

## Example Script

Run the example script to see tSNE in action:

```bash
cd backend
python example_tsne_usage.py
```

This will:

1. Generate tSNE coordinates for all papers in the database
2. Save coordinates to `tsne_coordinates.json`
3. Demonstrate custom vector tSNE

## Integration with Frontend

The tSNE coordinates can be easily integrated with frontend visualization libraries:

- **D3.js**: For interactive scatter plots
- **Plotly**: For scientific plotting
- **Chart.js**: For simple charts
- **Three.js**: For 3D visualizations

Example frontend usage:

```javascript
fetch("/api/v1/tsne/papers")
  .then((response) => response.json())
  .then((coordinates) => {
    // Use coordinates for visualization
    coordinates.forEach((point) => {
      // point.id, point.x, point.y
    });
  });
```

## Dependencies

- `scikit-learn`: For tSNE implementation
- `numpy`: For numerical operations
- `fastapi`: For API endpoints
- `result`: For error handling

## Notes

- tSNE is computationally intensive for large datasets
- Results may vary with different random seeds
- Perplexity should be adjusted based on dataset size (typically 5-50)
- The algorithm preserves local structure better than global structure
