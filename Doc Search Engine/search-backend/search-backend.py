from flask import Flask, request, jsonify
from flask_cors import CORS
from elasticsearch import Elasticsearch
from docx import Document
import fitz  # PyMuPDF for handling PDFs

app = Flask(__name__)
CORS(app)

# Elasticsearch instance setup
es = Elasticsearch(
    hosts=["https://localhost:9200"],
    basic_auth=('elastic', 'dQMAl-uWyi+lAi2+dfDi'),
    verify_certs=False
)

# Index settings and mappings
index_settings = {
    "settings": {
        "analysis": {
            "analyzer": {
                "custom_analyzer": {
                    "type": "custom",
                    "tokenizer": "whitespace",
                    "filter": ["lowercase", "stemmer"]
                }
            }
        }
    },
    "mappings": {
        "properties": {
            "content": {
                "type": "text",
                "analyzer": "custom_analyzer"
            },
            "document_name": {
                "type": "keyword"
            }
            # Add more fields or metadata here
        }
    }
}

# Function to create the Elasticsearch index
def create_index():
    try:
        if not es.indices.exists(index='searching_index_1'):
            es.indices.create(index='searching_index_1', body=index_settings)
            print("Index created successfully.")
    except Exception as e:
        print(f"Error creating index: {e}")

# Function to index document content into Elasticsearch
def index_document(text, document_name):
    if not es.indices.exists(index='searching_index_1'):
        print("Index doesn't exist")
        create_index()

    document_body = {
        "content": text,
        "document_name": document_name
    }
    es.index(index='searching_index_1', body=document_body)

# Route to handle document uploads (both DOCX and PDF)
@app.route('/upload_document', methods=['POST'])
def upload_document():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'})

    uploaded_file = request.files['file']

    if uploaded_file.filename == '':
        return jsonify({'error': 'No selected file'})

    if uploaded_file and allowed_file(uploaded_file.filename):
        file_extension = uploaded_file.filename.rsplit('.', 1)[1].lower()

        if file_extension == 'docx':
            document = Document(uploaded_file)
            full_text = [paragraph.text for paragraph in document.paragraphs]
            extracted_text = '\n'.join(full_text)
            index_document(extracted_text, uploaded_file.filename)
            return jsonify({'message': 'Document uploaded and indexed successfully'})
        elif file_extension == 'pdf':
            pdf_text = extract_pdf_text(uploaded_file)
            index_document(pdf_text, uploaded_file.filename)
            return jsonify({'message': 'PDF document uploaded and indexed successfully'})
        else:
            return jsonify({'error': 'File type not allowed'})
    else:
        return jsonify({'error': 'File type not allowed'})

# Function to extract text from PDF using PyMuPDF (fitz)
def extract_pdf_text(uploaded_file):
    pdf_document = fitz.open(stream=uploaded_file.read(), filetype="pdf")
    pdf_text = ""
    for page in pdf_document:
        pdf_text += page.get_text()
    return pdf_text

# Function to check allowed file types
def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in {'docx', 'pdf'}

# Endpoint to handle search queries
@app.route('/search', methods=['GET'])
def search():
    query = request.args.get('query')

    if not query:
        return jsonify({'error': 'Please provide a search query'})

    # Elasticsearch query for simple text search
    search_results = es.search(
        index='searching_index_1',  # Use your index name here
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

# Endpoint to get document content by name from Elasticsearch
@app.route('/get_document_by_name', methods=['GET'])
def get_document_by_name():
    document_name = request.args.get('name')

    try:
        # Elasticsearch query to fetch the document content based on the name
        search_results = es.search(
            index='searching_index_1',
            body={
                "query": {
                    "match": {
                        "document_name": document_name
                    }
                }
            }
        )

        hits = search_results['hits']['hits']

        if hits:
            document_content = hits[0]['_source'].get('content')
            if document_content:
                return jsonify({'content': document_content})
            else:
                return jsonify({'error': 'Document content not found'})
        else:
            return jsonify({'error': 'Document not found'})

    except Exception as e:
        return jsonify({'error': f'Error retrieving document: {e}'})


if __name__ == '__main__':
    app.run(debug=True)
