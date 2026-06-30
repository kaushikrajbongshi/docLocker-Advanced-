"use client";
import React, { useState } from "react";
import { FolderPlusIcon, ArrowPathIcon } from "@heroicons/react/24/outline";

const CreateFolder = ({ setActiveTab, currentFolderId }) => {
  console.log("Current Folder ID in CreateFolder:", currentFolderId);
  
  const [folderName, setFolderName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateFolder = async (e) => {
    e.preventDefault();
    if (!folderName.trim()) return;
    setIsCreating(true);

    try {
      const data = {
        name: folderName,
        parentFolderId: currentFolderId || null,
      };

      const res = await fetch("/api/v1/files/new/folder", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await res.json();
      console.log(result);

      if (res.ok) {
        // Reset form and go back to drive view
        setFolderName("");
        setActiveTab("myDrive"); // This will trigger data refresh
      }
    } catch (error) {
      console.error("Failed to create folder", error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="p-6">
      <div className="max-w-md w-[400px] sm:w-[500px]">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <FolderPlusIcon className="w-8 h-8 text-blue-500" />
            <h2 className="text-xl font-semibold text-gray-900">
              Create New Folder
            </h2>
          </div>

          {currentFolderId && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-700">
                Creating folder inside current directory
              </p>
              <p className="text-xs text-blue-600">Folder ID: {currentFolderId}</p>
            </div>
          )}

          <form onSubmit={handleCreateFolder} className="space-y-4">
            <div>
              <label
                htmlFor="folderName"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Folder Name
              </label>
              <input
                type="text"
                id="folderName"
                value={folderName}
                onChange={(e) => setFolderName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg 
                           focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                           outline-none"
                placeholder="Enter folder name..."
                required
              />
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                type="submit"
                disabled={!folderName.trim() || isCreating}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg 
                           hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed 
                           transition-colors"
              >
                {isCreating ? (
                  <div className="flex items-center justify-center space-x-2">
                    <ArrowPathIcon className="w-4 h-4 animate-spin" />
                    <span>Creating...</span>
                  </div>
                ) : (
                  "Create Folder"
                )}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("myDrive")}
                className="px-4 py-2 text-gray-600 border border-gray-300 
                           rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateFolder;