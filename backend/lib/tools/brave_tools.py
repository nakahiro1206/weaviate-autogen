import requests

print(
    requests.get(
        "https://api.search.brave.com/res/v1/web/search",
        headers={
            "X-Subscription-Token": "<BRAVE_SEARCH_API_KEY>",
        },
        params={
            "q": "greek restaurants in san francisco",
            "count": 20,
            "country": "us",
            "search_lang": "en",
        },
    ).json()
)