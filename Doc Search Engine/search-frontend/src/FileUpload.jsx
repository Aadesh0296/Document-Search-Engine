import React, { useState, useRef } from "react";
import axios from "axios";

const UploadComponent = () => {
  // eslint-disable-next-line no-unused-vars
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedFileName, setSelectedFileName] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null); // Ref for file input

  const handleFileChange = (file) => {
    setSelectedFile(file);

    if (file) {
      setSelectedFileName(file.name);
      uploadFile(file);
    } else {
      setSelectedFileName("");
    }
  };

  const uploadFile = async (file) => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post(
        "http://127.0.0.1:5000/upload_document",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          onUploadProgress: (progressEvent) => {
            const progress = Math.round(
              (progressEvent.loaded / progressEvent.total) * 100
            );
            setUploadProgress(progress);
          },
        }
      );
      window.alert(response.data.message);

      setSelectedFile(null);
      setSelectedFileName("");
      setUploadProgress(0); // Reset progress after successful upload
    } catch (error) {
      window.alert("Error uploading file");
      console.error("Error uploading file:", error);
      setUploadProgress(0); // Reset progress in case of an error
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    event.stopPropagation();

    const file = event.dataTransfer.files[0];
    handleFileChange(file);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const handleDropAreaClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div
      className="upload-container"
      onClick={handleDropAreaClick}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={(e) => handleFileChange(e.target.files[0])}
        className="file-input"
        accept=".docx,.pdf"
        style={{ display: "none" }}
      />
      <div className="drop-area">
        <div className="centered-text">
          <p>Click or Drag & Drop DOCX or PDF file here</p>
          <p>{selectedFileName}</p>
          {uploadProgress > 0 && (
            <progress value={uploadProgress} max="100">
              {uploadProgress}%
            </progress>
          )}
        </div>
      </div>
    </div>
  );
};

export default UploadComponent;
