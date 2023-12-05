import React, { useState, useEffect } from "react";
import axios from "axios";

const SearchComponent = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [selectedDocumentContent, setSelectedDocumentContent] = useState("");
  const [typingTimeout, setTypingTimeout] = useState(null);

  const handleSearch = async () => {
    try {
      const response = await axios.get(
        `http://127.0.0.1:5000/search?query=${query}`
      );
      setResults(response.data.results);
    } catch (error) {
      console.error("Error searching:", error);
    }
  };

  const debouncedSearch = () => {
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }

    setTypingTimeout(
      setTimeout(() => {
        handleSearch();
      }, 300) // Adjust debounce delay as needed (e.g., 300ms)
    );
  };

  const viewDocument = async (documentName) => {
    try {
      const response = await axios.get(
        `http://127.0.0.1:5000/get_document_by_name?name=${documentName}`
      );

      const content = response.data.content.replace(
        new RegExp(query, "gi"),
        (match) => `<span style="background-color: yellow">${match}</span>`
      );

      setSelectedDocumentContent(content);
    } catch (error) {
      console.error("Error viewing document:", error);
    }
  };

  useEffect(() => {
    if (query.trim() !== '') { // Check if query is not empty
      debouncedSearch();
    } else {
      setResults([]); // Clear results if query is empty
    }

    return () => {
      clearTimeout(typingTimeout);
      setSelectedDocumentContent("");
    };
  }, [query]);

  return (
    <div>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search..."
      />
      {results.length > 0 ? (
        <table>
          <thead>
            <tr>
              <th>Document Name</th>
              <th>View</th>
            </tr>
          </thead>
          <tbody>
            {results.map((result, index) => (
              <tr key={index}>
                <td>{result.document_name}</td>
                <td>
                  <button
                    type="button"
                    onClick={() => viewDocument(result.document_name)}
                    style={{
                      textDecoration: "underline",
                      background: "none",
                      border: "none",
                      padding: "0",
                      font: "inherit",
                      cursor: "pointer",
                      color: "blue",
                    }}
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        query.trim() !== '' && <p>No results found</p>
      )}

      {selectedDocumentContent && (
        <div>
          <h2>Document Content</h2>
          <div
            style={{
              border: "1px solid #ccc",
              padding: "10px",
              borderRadius: "5px",
              backgroundColor: "#f9f9f9",
            }}
            dangerouslySetInnerHTML={{ __html: selectedDocumentContent }}
          />
        </div>
      )}
    </div>
  );
};

export default SearchComponent;
