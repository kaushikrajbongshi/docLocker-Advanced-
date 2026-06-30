import React, { useState } from "react";
import {
  ArrowPathIcon,
  XMarkIcon,
  DocumentIcon,
  CloudArrowUpIcon,
} from "@heroicons/react/24/outline";

const UploadDocument = ({ setActiveTab, currentFolderId }) => {
  console.log("Current Folder ID in Upload:", currentFolderId);

  // Cloudinary configuration
  const CLOUDINARY_CLOUD_NAME =
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "your-cloud-name";
  const CLOUDINARY_UPLOAD_PRESET =
    process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "your-upload-preset";
  console.log("Cloud Name:", CLOUDINARY_CLOUD_NAME);
  console.log("Upload Preset:", CLOUDINARY_UPLOAD_PRESET);

  const [dragActive, setDragActive] = useState(false);
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const handleFiles = (newFiles) => {
    const fileObjects = newFiles.map((file) => ({
      file,
      name: file.name,
      size: file.size,
      type: file.type,
      id: Math.random().toString(36).substr(2, 9),
    }));
    setFiles((prev) => [...prev, ...fileObjects]);
  };

  const removeFile = (fileId) => {
    setFiles(files.filter((f) => f.id !== fileId));
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // Upload single file to Cloudinary
  const uploadToCloudinary = (fileObj) => {
    return new Promise((resolve, reject) => {
      const formData = new FormData();
      formData.append("file", fileObj.file);
      formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

      const xhr = new XMLHttpRequest();

      xhr.addEventListener("load", () => {
        if (xhr.status === 200) {
          const response = JSON.parse(xhr.responseText);
          resolve(response.secure_url);
        } else {
          reject(new Error(`Upload failed with status: ${xhr.status}`));
        }
      });

      xhr.addEventListener("error", () => {
        reject(new Error("Upload failed due to network error"));
      });

      xhr.open(
        "POST",
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/auto/upload`,
      );
      xhr.send(formData);
    });
  };

  const handleUpload = async () => {
    if (files.length === 0) return;

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("folderId", currentFolderId || "null");

      const filesMeta = []; // Array to hold { name, url }

      for (const fileObj of files) {
        // Upload to Cloudinary and get download URL
        const downloadURL = await uploadToCloudinary(fileObj);
        console.log("File URL:", downloadURL);

        // Save metadata for backend
        filesMeta.push({
          name: fileObj.file.name,
          url: downloadURL,
        });
      }

      // Now send metadata to backend
      filesMeta.forEach(({ name, url }) => {
        formData.append("documents", JSON.stringify({ name, url }));
      });

      const res = await fetch("/api/v1/files/new/document", {
        method: "POST",
        body: formData,
      });

      const result = await res.json();
      console.log("Backend upload result:", result);

      if (res.ok) {
        setFiles([]); // Clear selected files
        setActiveTab("myDrive");
      } else {
        alert(`Upload failed: ${result.message || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Upload process failed:", error);
      alert("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const getFileType = (fileName) => {
    const extension = fileName.split(".").pop().toLowerCase();
    const imageTypes = ["jpg", "jpeg", "png", "gif", "webp"];
    const documentTypes = ["pdf", "doc", "docx", "txt"];

    if (imageTypes.includes(extension)) return "image";
    if (documentTypes.includes(extension)) return "document";
    return extension;
  };

  return (
    <div className="p-6">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <CloudArrowUpIcon className="w-8 h-8 text-green-500" />
            <h2 className="text-xl font-semibold text-gray-900">
              Upload Documents
            </h2>
          </div>

          {currentFolderId && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-700">
                Uploading to current directory
              </p>
              <p className="text-xs text-green-600">
                Folder ID: {currentFolderId}
              </p>
            </div>
          )}

          <div
            className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive
                ? "border-blue-400 bg-blue-50"
                : "border-gray-300 hover:border-gray-400"
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              type="file"
              multiple
              onChange={handleChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif,.webp"
            />

            <CloudArrowUpIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-lg font-medium text-gray-900 mb-2">
              Drop files here or click to browse
            </p>
            <p className="text-sm text-gray-500">
              Supports PDF, DOC, DOCX, TXT, and image files up to 10MB each
            </p>
          </div>

          {files.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-medium text-gray-900 mb-3">
                Selected Files ({files.length})
              </h3>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {files.map((fileObj) => (
                  <div
                    key={fileObj.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <DocumentIcon className="w-5 h-5 text-gray-500" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {fileObj.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatFileSize(fileObj.size)} •{" "}
                          {getFileType(fileObj.name)}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => removeFile(fileObj.id)}
                      className="text-red-500 hover:text-red-700 transition-colors flex-shrink-0"
                    >
                      <XMarkIcon className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex space-x-3 mt-6 pt-4 border-t border-gray-200">
            <button
              onClick={handleUpload}
              disabled={files.length === 0 || uploading}
              className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {uploading ? (
                <div className="flex items-center justify-center space-x-2">
                  <ArrowPathIcon className="w-4 h-4 animate-spin" />
                  <span>Uploading...</span>
                </div>
              ) : (
                `Upload ${
                  files.length > 0
                    ? `${files.length} file${files.length > 1 ? "s" : ""}`
                    : "Files"
                }`
              )}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("myDrive")}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadDocument;
