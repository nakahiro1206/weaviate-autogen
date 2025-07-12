import arxiv
from typing import List, Dict
from os import path

# Construct the default API client.
client = arxiv.Client()

def search_arxiv(query: str) -> str | List[Dict[str, str]]:
    search = arxiv.Search(
        query=query, 
        max_results=10,
        sort_by=arxiv.SortCriterion.SubmittedDate
    )
    results = client.results(search)
    res: List[Dict[str, str]] = []
    for result in results:
        res.append({
            "title": result.title,
            "summary": result.summary,
            "url": result.entry_id
        })
    return res

def download_arxiv(paper_id: str, filename: str, dirpath: str) -> str:
    paper = next(arxiv.Client().results(arxiv.Search(id_list=[paper_id])))
    paper.download_pdf(filename=filename, dirpath=dirpath)
    p = path.join(dirpath, filename)
    return f"Downloaded paper {paper_id} to {p}"

