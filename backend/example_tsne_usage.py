#!/usr/bin/env python3
"""
Example usage of tSNE functionality for paper visualization.
"""

from lib.sklearn.tsne import get_papers_with_tsne, perform_tsne
from result import is_ok, is_err
import json

def main():
    print("=== tSNE Paper Visualization Example ===\n")
    
    # Example 1: Get papers with tSNE coordinates
    print("1. Getting papers with tSNE coordinates...")
    result = get_papers_with_tsne(perplexity=30.0, random_state=42)
    
    if is_ok(result):
        coordinates = result.unwrap()
        print(f"✓ Successfully generated tSNE coordinates for {len(coordinates)} papers")
        print(f"Sample coordinates:")
        for i, coord in enumerate(coordinates[:3]):  # Show first 3
            print(f"  Paper {i+1}: id={coord['id']}, x={coord['x']:.4f}, y={coord['y']:.4f}")
        
        # Save to JSON file for visualization
        with open("tsne_coordinates.json", "w") as f:
            json.dump(coordinates, f, indent=2)
        print(f"\n✓ Coordinates saved to 'tsne_coordinates.json'")
        
    else:
        print(f"✗ Error: {result.unwrap_err()}")
    
    print("\n" + "="*50)
    
    # Example 2: Manual tSNE with custom vectors (for demonstration)
    print("\n2. Example with custom vectors...")
    
    # Sample vectors (3D vectors for demonstration)
    sample_vectors = [
        [1.0, 2.0, 3.0],
        [1.1, 2.1, 3.1],
        [4.0, 5.0, 6.0],
        [4.1, 5.1, 6.1],
        [7.0, 8.0, 9.0],
        [7.1, 8.1, 9.1]
    ]
    sample_ids = ["paper_1", "paper_2", "paper_3", "paper_4", "paper_5", "paper_6"]
    
    manual_result = perform_tsne(sample_vectors, sample_ids, perplexity=2.0)
    
    if is_ok(manual_result):
        manual_coordinates = manual_result.unwrap()
        print(f"✓ Successfully generated tSNE coordinates for {len(manual_coordinates)} sample papers")
        print(f"Sample coordinates:")
        for coord in manual_coordinates:
            print(f"  {coord['id']}: x={coord['x']:.4f}, y={coord['y']:.4f}")
    else:
        print(f"✗ Error: {manual_result.unwrap_err()}")

if __name__ == "__main__":
    main() 