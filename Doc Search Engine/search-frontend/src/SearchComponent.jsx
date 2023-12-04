import React, { useState, useEffect } from "react";
import axios from "axios";

const SearchComponent = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [selectedDocumentContent, setSelectedDocumentContent] = useState("");
  const [typingTimeout, setTypingTimeout] = useState(null); // Initialize with null

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
      }, 10) // Adjust this delay as needed (e.g., 300ms)
    );
  };

  const viewDocument = async (documentName) => {
    try {
      const response = await axios.get(
        `http://127.0.0.1:5000/get_document_by_name?name=${documentName}`
      );

      // Highlight the searched word in the document content
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
    debouncedSearch();
    // Clean up the timeout on component unmount or when query changes
    return () => {
      clearTimeout(typingTimeout);
      setSelectedDocumentContent(""); // Reset selected document content
    };
  }, [query]); // Trigger the effect when the query changes

  return (
    <div>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search..."
      />
      {results && results.length > 0 ? (
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
        <p>No results found</p>
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
