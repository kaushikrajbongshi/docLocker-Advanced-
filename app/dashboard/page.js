"use client";
import React, { useEffect, useState } from "react";
import CreateFolder from "@/component/Dashboard/CreateFolder";
import UploadDocument from "@/component/Dashboard/UploadDocument";
import { useRouter } from "next/navigation";
import {
  FolderIcon,
  DocumentIcon,
  TrashIcon,
  EyeIcon,
  ArrowDownTrayIcon,
  PhotoIcon,
  PlusIcon,
  ArrowUpTrayIcon,
} from "@heroicons/react/24/outline";

const DriveInterface = () => {
  const [hoveredItem, setHoveredItem] = useState(null);
  const [path, setPath] = useState([]); // stores navigation path
  const [data, setdata] = useState([]);
  const [activeTab, setActiveTab] = useState("myDrive"); // Add activeTab state
  const route = useRouter();

  const fetchAll = async () => {
    try {
      const res = await fetch("/api/files");
      const result = await res.json();
      setdata(result);
      console.log(data);
    } catch (error) {
      console.log(error);
    }
  };

  // Fetch folder contents when navigating into a folder
  const fetchFolderContents = async (folderId) => {
    try {
      const res = await fetch(`/api/files/${folderId}/content`);
      const result = await res.json();

      // Handle the API response structure
      if (result.success && result.data) {
        return {
          folders: result.data.folder || [],
          documents: result.data.document || [],
        };
      }

      return { folders: [], documents: [] };
    } catch (error) {
      console.log(error);
      return { folders: [], documents: [] };
    }
  };

  console.log(data);

  // Get current folder ID without causing re-renders
  const getCurrentFolderId = () => {
    if (path.length === 0) {
      return null; // Root directory
    }
    const currentFolder = path[path.length - 1];
    return currentFolder._id || currentFolder.id;
  };

  const currentFolderId = getCurrentFolderId();
  console.log("Current Folder ID:", currentFolderId); // Console log current folder ID

  // Refresh data when coming back from create folder
  useEffect(() => {
    if (activeTab === "myDrive") {
      fetchAll();
    }
  }, [activeTab]);

  // Helper: get current folder content
  const getCurrentItems = () => {
    if (path.length === 0) {
      return [...(data.folders || []), ...(data.documents || [])];
    }

    const currentFolder = path[path.length - 1];

    // Return the children of the current folder if they exist
    if (currentFolder.children) {
      return currentFolder.children;
    }

    return [];
  };

  const currentItems = getCurrentItems();

  const getFileIcon = (type) => {
    switch (type) {
      case "folder":
        return <FolderIcon className="w-6 h-6 text-blue-500" />;
      case "pdf":
        return <DocumentIcon className="w-6 h-6 text-red-500" />;
      case "image":
        return <PhotoIcon className="w-6 h-6 text-green-500" />;
      default:
        return <DocumentIcon className="w-6 h-6 text-gray-500" />;
    }
  };

  const handleItemClick = async (item) => {
    if (item.type === "folder") {
      console.log("Clicking folder with ID:", item._id || item.id);

      // Always fetch fresh folder contents when clicking on a folder
      const folderContents = await fetchFolderContents(item._id || item.id);

      console.log("Fetched folder contents:", folderContents);

      // Create updated item with fresh contents
      const updatedItem = {
        ...item,
        children: [
          ...(folderContents.folders || []),
          ...(folderContents.documents || []),
        ],
      };

      setPath([...path, updatedItem]);
    }
  };

  const handleBreadcrumbClick = (index) => {
    setPath(path.slice(0, index + 1));
  };

  const handleItemAction = async (action, item) => {
    if (action === "view") {
      if (item.type === "folder") {
        handleItemClick(item);
      } else {
        route.push(`/document/${item.id || item._id}`);
      }
    }
    if (action === "download") {
      const link = document.createElement("a");
      link.href = item.url;
      link.download = item.name;
      link.click();
    }
    if (action === "delete") {
      console.log(item.id);
      try {
        const res = await fetch(`/api/files/${item.id}/delete`, {
          method: "PATCH",
        });
        const result = await res.json();
        console.log(result);
      } catch (error) {}
      console.log("Delete file:", item.name);
    }
  };
  useEffect(() => {
    fetchAll();
  }, []);

  // Render CreateFolder component
  if (activeTab === "createFolder") {
    return (
      <div className="h-screen bg-gray-50 flex flex-col">
        <div className="flex pt-16 h-full">
          <div className="flex-1 ml-64 flex flex-col h-full">
            <div className="flex-1 overflow-auto">
              <div className="flex justify-center items-start pt-12">
                <CreateFolder
                  setActiveTab={setActiveTab}
                  currentFolderId={currentFolderId} // Pass current folder ID
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (activeTab === "UploadDocument") {
    return (
      <div className="h-screen bg-gray-50 flex flex-col">
        <div className="flex pt-16 h-full">
          <div className="flex-1 ml-64 flex flex-col h-full">
            <div className="flex-1 overflow-auto">
              <div className="flex justify-center items-start pt-12">
                <UploadDocument
                  setActiveTab={setActiveTab}
                  currentFolderId={currentFolderId} // Pass current folder ID
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render Main Drive Interface
  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      <div className="flex pt-16 h-full">
        <div className="flex-1 ml-64 flex flex-col h-full">
          {/* Add Create Folder Button */}
          <div className="px-8 pt-2 flex justify-between items-center border-gray-600">
            <div></div>
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab("UploadDocument")}
                className=" text-white px-4 py-2 border-2 border-solid border-[rgb(170_191_222)] rounded-lg hover:bg-gray-100 transition-colors flex items-center space-x-2"
              >
                <ArrowUpTrayIcon className="w-6 h-5 text-blue-500" />
                <span className="text-gray-600">Upload</span>
              </button>
              <button
                onClick={() => setActiveTab("createFolder")}
                className=" text-white px-2 py-2 border-2 border-solid border-[rgb(170_191_222)] rounded-lg hover:bg-gray-100 transition-colors flex items-center space-x-2"
              >
                <PlusIcon className=" h-5 text-blue-500" />
                <span className="text-gray-600">New Folder</span>
              </button>
            </div>
          </div>

          {/* Breadcrumb */}
          <div className="px-8 pt-2 text-sm text-gray-600 flex space-x-2">
            <span
              onClick={() => setPath([])}
              className="cursor-pointer text-gray-600 font-bold text-2xl hover:cursor-pointer"
            >
              My Drive
            </span>
            {path.map((folder, idx) => (
              <span
                key={folder._id || folder.id}
                className="flex items-center space-x-2"
              >
                <span>{">"}</span>
                <span
                  onClick={() => handleBreadcrumbClick(idx)}
                  className="cursor-pointer text-gray-600 font-bold text-2xl hover:cursor-pointer"
                >
                  {folder.name}
                </span>
              </span>
            ))}
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-auto">
            <div className="p-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="px-6 py-3 bg-gray-50 border-b border-gray-200 text-sm font-medium text-gray-700">
                  <div className="grid grid-cols-12 gap-4">
                    <div className="col-span-5">Name</div>
                    <div className="col-span-2">Owner</div>
                    <div className="col-span-2">Last Modified</div>
                    <div className="col-span-2">File Size</div>
                    <div className="col-span-1">Actions</div>
                  </div>
                </div>

                {/* {console.log(currentItems)} */}
                {currentItems.map((item, index) => (
                  <div
                    key={item._id || item.id || index}
                    className="px-6 py-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer group transition-colors"
                    onMouseEnter={() => setHoveredItem(item._id || item.id)}
                    onMouseLeave={() => setHoveredItem(null)}
                    onClick={() => handleItemClick(item)}
                  >
                    <div className="grid grid-cols-12 gap-4 items-center text-sm">
                      <div className="col-span-5 flex items-center space-x-3">
                        {getFileIcon(item.type)}
                        <span className="text-gray-900 hover:text-blue-600 transition-colors font-medium">
                          {item.name}
                        </span>
                      </div>
                      <div className="col-span-2">
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center text-white text-xs font-medium">
                            M
                          </div>
                          <span className="text-gray-600">{item.owner}</span>
                        </div>
                      </div>
                      <div className="col-span-2 text-gray-600">
                        {item.modified}
                      </div>
                      <div className="col-span-2 text-gray-600">
                        {item.size}
                      </div>
                      <div className="col-span-1">
                        {hoveredItem === (item._id || item.id) && (
                          <div
                            className="flex items-center space-x-1"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              onClick={() => handleItemAction("view", item)}
                              className="p-1 rounded-full hover:bg-gray-200 text-gray-500 transition-colors"
                              title="View"
                            >
                              <EyeIcon className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleItemAction("download", item)}
                              className="p-1 rounded-full hover:bg-gray-200 text-gray-500 transition-colors"
                              title="Download"
                            >
                              <ArrowDownTrayIcon className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleItemAction("delete", item)}
                              className="p-1 rounded-full hover:bg-gray-200 text-red-500 transition-colors"
                              title="Delete"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {currentItems.length === 0 && (
                  <div className="px-6 py-8 text-center text-gray-500">
                    This folder is empty
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DriveInterface;
