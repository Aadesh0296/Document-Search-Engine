from flask import Flask, request
from PyPDF2 import PdfReader
from flask_cors import CORS  # Import CORS from flask_cors

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes of the Flask app


@app.route('/upload', methods=['POST'])
def upload_file():
    uploaded_file = request.files['file']

    if uploaded_file.filename != '':
        # Save the uploaded file temporarily
        temp_file_path = 'temp.pdf'
        uploaded_file.save(temp_file_path)

        # Extract text from the PDF
        text = extract_text_from_pdf(temp_file_path)

        # Return the extracted text
        return text

    return 'No file uploaded'

def extract_text_from_pdf(pdf_path):
    text = ""
    with open(pdf_path, 'rb') as file:
        pdf_reader = PdfReader(file)
        num_pages = len(pdf_reader.pages)

        for page_num in range(num_pages):
            page = pdf_reader.pages[page_num]
            text += page.extract_text()

    return text

if __name__ == '__main__':
    app.run(debug=True)
