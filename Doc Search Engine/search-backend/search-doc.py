from flask import Flask, request, jsonify
from elasticsearch import Elasticsearch

app = Flask(__name__)

# Elasticsearch connection setup
es = Elasticsearch(
    hosts=["https://localhost:9200"],
    http_auth=('elastic', 'dQMAl-uWyi+lAi2+dfDi'),
    verify_certs=False
)

# Endpoint to handle search queries
@app.route('/search', methods=['GET'])
def search():
    query = request.args.get('query')

    if not query:
        return jsonify({'error': 'Please provide a search query'})

    # Elasticsearch query for simple text search
    search_results = es.search(
        index='search_index',  # Use your index name here
        body={
            "query": {
                "match": {
                    "content": query  # Change 'content' to the field you want to search in
                }
            }
        }
    )

    hits = search_results['hits']['hits']

    # Extract relevant information from search results
    extracted_results = [{'document_name': hit['_source']['document_name']} for hit in hits]

    return jsonify({'results': extracted_results})


if __name__ == '__main__':
    app.run(debug=True)
