from elasticsearch import Elasticsearch


# Create Elasticsearch instance with HTTPS and SSL context
es = Elasticsearch(
        hosts=["https://localhost:9200"],
        basic_auth=('elastic', 'dQMAl-uWyi+lAi2+dfDi'),  # Use basic_auth for HTTP authentication
        verify_certs=False  # Disables certificate verification
    )

# Check if the connection is successful
if es.ping():
    print("Connected to Elasticsearch")
else:
    print("Could not connect to Elasticsearch")

# Define some sample data
data = {
    "title": "Sample Document",
    "content": "This is a test document for Elasticsearch indexing.",
    "tags": ["test", "elasticsearch", "python"]
}

# Index the document
index_name = "search_index"  # Choose an appropriate index name
response = es.index(index=index_name, body=data)
print(response)

# Search for data
search_query = {
    "query": {
        "match": {
            "content": "test"
        }
    }
}

# Perform the search
search_results = es.search(index=index_name, body=search_query)
print(search_results)
