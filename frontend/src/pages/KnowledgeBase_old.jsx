
import { useEffect, useRef, useState } from "react";

import {
  uploadDocument,
  getDocuments,
  deleteDocument,
} from "../services/KnowledgeService";

import "../styles/knowledge-base.css";

function KnowledgeBase() {
  const fileInputRef = useRef(null);

  const [documents, setDocuments] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    loadDocuments();
  }, []);

  async function loadDocuments() {
    try {
      setLoading(true);
      setError("");

      const data = await getDocuments();
      setDocuments(data || []);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to load documents.");
    } finally {
      setLoading(false);
    }
  }

  function handleFile(file) {
    setMessage("");
    setError("");

    if (!file) {
      return;
    }

    const allowedExtensions = [
      ".pdf",
      ".docx",
      ".txt",
      ".csv",
      ".md",
    ];

    const filename = file.name.toLowerCase();

    const isAllowed = allowedExtensions.some(
      extension => filename.endsWith(extension)
    );

    if (!isAllowed) {
      setSelectedFile(null);
      setError(
        "Unsupported file format. Please upload PDF, DOCX, TXT, CSV, or MD."
      );
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setSelectedFile(null);
      setError("File size cannot exceed 10 MB.");
      return;
    }

    setSelectedFile(file);
  }

  function handleFileInput(event) {
    const file = event.target.files?.[0];
    handleFile(file);
  }

  function handleDrop(event) {
    event.preventDefault();
    setDragActive(false);

    const file = event.dataTransfer.files?.[0];
    handleFile(file);
  }

  function handleDragOver(event) {
    event.preventDefault();
    setDragActive(true);
  }

  function handleDragLeave(event) {
    event.preventDefault();
    setDragActive(false);
  }

  async function handleUpload() {
    if (!selectedFile) {
      setError("Please select a document first.");
      return;
    }

    try {
      setUploading(true);
      setError("");
      setMessage("");

      const result = await uploadDocument(selectedFile);

      setMessage(
        `${result.filename} uploaded successfully and processed into ${result.chunks} chunk${result.chunks === 1 ? "" : "s"}.`
      );

      setSelectedFile(null);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      await loadDocuments();
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to upload document.");
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(filename) {
    const confirmed = window.confirm(
      `Delete "${filename}" from the knowledge base?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeleting(filename);
      setError("");
      setMessage("");

      const result = await deleteDocument(filename);

      setMessage(
        `${result.filename} deleted successfully.`
      );

      await loadDocuments();
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to delete document.");
    } finally {
      setDeleting("");
    }
  }

  function formatFileSize(bytes) {
    if (!bytes) {
      return "0 KB";
    }

    const mb = bytes / (1024 * 1024);

    if (mb >= 1) {
      return `${mb.toFixed(1)} MB`;
    }

    return `${Math.max(
      1,
      Math.round(bytes / 1024)
    )} KB`;
  }

  function getFileIcon(filename) {
    const extension = filename
      .split(".")
      .pop()
      ?.toLowerCase();

    if (extension === "pdf") return "📕";
    if (extension === "docx") return "📘";
    if (extension === "csv") return "📊";
    if (extension === "md") return "📝";

    return "📄";
  }

  return (
    <div className="knowledge-page">

      <div className="knowledge-page-header">
        <div>
          <span className="knowledge-eyebrow">
            AI KNOWLEDGE BASE
          </span>

          <h1>Knowledge Base</h1>

          <p>
            Upload company documents that your AI support
            assistant can use when answering customer questions.
          </p>
        </div>

        <div className="knowledge-stat">
          <span>{documents.length}</span>
          <small>
            {documents.length === 1
              ? "Document"
              : "Documents"}
          </small>
        </div>
      </div>

      {message && (
        <div className="knowledge-alert knowledge-alert-success">
          <span>✓</span>
          <p>{message}</p>
        </div>
      )}

      {error && (
        <div className="knowledge-alert knowledge-alert-error">
          <span>!</span>
          <p>{error}</p>
        </div>
      )}

      <section className="knowledge-upload-card">

        <div className="knowledge-card-header">
          <div>
            <span className="knowledge-section-label">
              DOCUMENT UPLOAD
            </span>

            <h2>Add knowledge</h2>

            <p>
              Upload a document to make its information
              available to the AI assistant.
            </p>
          </div>
        </div>

        <div
          className={`knowledge-dropzone ${
            dragActive
              ? "knowledge-dropzone-active"
              : ""
          } ${
            selectedFile
              ? "knowledge-dropzone-selected"
              : ""
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
        >

          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx,.txt,.csv,.md"
            onChange={handleFileInput}
            hidden
          />

          {selectedFile ? (
            <>
              <div className="knowledge-upload-icon">
                {getFileIcon(selectedFile.name)}
              </div>

              <div className="knowledge-selected-file">
                <strong>{selectedFile.name}</strong>

                <span>
                  {formatFileSize(selectedFile.size)}
                </span>
              </div>

              <span className="knowledge-change-file">
                Click to choose another file
              </span>
            </>
          ) : (
            <>
              <div className="knowledge-upload-icon">
                ↑
              </div>

              <strong>
                Drop your document here
              </strong>

              <span>
                or click to browse from your computer
              </span>

              <small>
                PDF, DOCX, TXT, CSV or MD · Maximum 10 MB
              </small>
            </>
          )}
        </div>

        <button
          type="button"
          className="knowledge-upload-button"
          onClick={handleUpload}
          disabled={!selectedFile || uploading}
        >
          {uploading
            ? "Processing document..."
            : "Upload & Process Document"}
        </button>

      </section>

      <section className="knowledge-documents-card">

        <div className="knowledge-card-header">
          <div>
            <span className="knowledge-section-label">
              YOUR DOCUMENTS
            </span>

            <h2>Knowledge sources</h2>

            <p>
              Documents currently available to the AI assistant.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="knowledge-empty-state">
            <div className="knowledge-spinner" />
            <p>Loading documents...</p>
          </div>
        ) : documents.length === 0 ? (
          <div className="knowledge-empty-state">
            <div className="knowledge-empty-icon">
              📚
            </div>

            <h3>No documents yet</h3>

            <p>
              Upload your first document to start building
              your AI knowledge base.
            </p>
          </div>
        ) : (
          <div className="knowledge-document-list">

            {documents.map(document => (
              <div
                className="knowledge-document"
                key={document.filename}
              >

                <div className="knowledge-document-icon">
                  {getFileIcon(document.filename)}
                </div>

                <div className="knowledge-document-info">
                  <strong>
                    {document.filename}
                  </strong>

                  <span>
                    {document.file_type?.replace(".", "").toUpperCase()}
                    {" · "}
                    {formatFileSize(document.size)}
                  </span>
                </div>

                <button
                  type="button"
                  className="knowledge-delete-button"
                  onClick={() =>
                    handleDelete(document.filename)
                  }
                  disabled={
                    deleting === document.filename
                  }
                  aria-label={`Delete ${document.filename}`}
                >
                  {deleting === document.filename
                    ? "..."
                    : "Delete"}
                </button>

              </div>
            ))}

          </div>
        )}

      </section>

    </div>
  );
}

export default KnowledgeBase;

