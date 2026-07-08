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
  ChevronLeftIcon,
  ChevronRightIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  Squares2X2Icon,
  ListBulletIcon,
  EllipsisVerticalIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";

const DriveInterface = () => {
  const [hoveredItem, setHoveredItem] = useState(null);
  const [path, setPath] = useState([]);
  const [data, setdata] = useState({ folders: [], documents: [] });
  const [activeTab, setActiveTab] = useState("myDrive");
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState("list"); // 'list' | 'grid'
  const [searchQuery, setSearchQuery] = useState("");
  const route = useRouter();

  const fetchAll = async (page = 1) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/files?page=${page}&limit=10`);
      const result = await res.json();
      console.log(result);
      
      setdata(result);
      setPagination(result.pagination);
      setCurrentPage(page);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFolderContents = async (folderId) => {
    try {
      const res = await fetch(`/api/v1/files/${folderId}/content`);
      const result = await res.json();
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

  const getCurrentFolderId = () => {
    if (path.length === 0) return null;
    return path[path.length - 1]._id || path[path.length - 1].id;
  };

  useEffect(() => {
    if (activeTab === "myDrive") fetchAll(1);
  }, [activeTab]);

  const getCurrentItems = () => {
    if (path.length === 0) return data;
    const currentFolder = path[path.length - 1];
    return {
      folders: currentFolder.children?.filter(c => c.type === "folder") || [],
      documents: currentFolder.children?.filter(c => c.type !== "folder") || [],
    };
  };

  const currentItems = getCurrentItems();
  const folders = currentItems.folders || [];
  const documents = currentItems.documents || [];

  // Filter by search
  const filterItems = (items) => {
    if (!searchQuery) return items;
    return items.filter(item => 
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const filteredFolders = filterItems(folders);
  const filteredDocuments = filterItems(documents);

  const handleItemClick = async (item) => {
    if (item.type === "folder") {
      const folderContents = await fetchFolderContents(item._id || item.id);
      const updatedItem = {
        ...item,
        children: [
          ...(folderContents.folders || []),
          ...(folderContents.documents || []),
        ],
      };
      setPath([...path, updatedItem]);
    } else {
      route.push(`/document/${item.id || item._id}`);
    }
  };

  const handleBreadcrumbClick = (index) => {
    setPath(path.slice(0, index + 1));
  };

  const handleItemAction = async (action, item, e) => {
    e.stopPropagation();
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
      try {
        const res = await fetch(`/api/v1/files/${item.id}/delete`, { method: "PATCH" });
        await res.json();
        fetchAll(currentPage);
      } catch (error) {}
    }
  };

  useEffect(() => {
    fetchAll(1);
  }, []);

  const goToPage = (page) => {
    if (page >= 1 && page <= (pagination?.totalPages || 1)) {
      fetchAll(page);
    }
  };

  const getPageNumbers = () => {
    if (!pagination) return [];
    const total = pagination.totalPages;
    const current = pagination.currentPage;
    const pages = [];
    pages.push(1);
    for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
      if (!pages.includes(i)) pages.push(i);
    }
    if (total > 1 && !pages.includes(total)) pages.push(total);
    pages.sort((a, b) => a - b);
    const result = [];
    let prev = 0;
    for (const page of pages) {
      if (page - prev > 1) result.push("...");
      result.push(page);
      prev = page;
    }
    return result;
  };

  const getFileIcon = (type) => {
    switch (type) {
      case "folder": return <FolderIcon className="w-5 h-5 text-amber-500" />;
      case "pdf": return <DocumentIcon className="w-5 h-5 text-red-500" />;
      case "image": return <PhotoIcon className="w-5 h-5 text-green-500" />;
      default: return <DocumentIcon className="w-5 h-5 text-gray-400" />;
    }
  };

  const getFileColor = (type) => {
    switch (type) {
      case "folder": return "bg-amber-50 border-amber-200 text-amber-700";
      case "pdf": return "bg-red-50 border-red-200 text-red-700";
      case "image": return "bg-green-50 border-green-200 text-green-700";
      default: return "bg-gray-50 border-gray-200 text-gray-700";
    }
  };

  if (activeTab === "createFolder") {
    return (
      <div className="h-screen bg-gray-50 flex flex-col">
        <div className="flex pt-16 h-full">
          <div className="flex-1 ml-64 flex flex-col h-full">
            <div className="flex-1 overflow-auto">
              <div className="flex justify-center items-start pt-12">
                <CreateFolder setActiveTab={setActiveTab} currentFolderId={getCurrentFolderId()} />
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
                <UploadDocument setActiveTab={setActiveTab} currentFolderId={getCurrentFolderId()} />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      <div className="flex pt-16 h-full">
        <div className="flex-1 ml-64 flex flex-col h-full">
          
          {/* ===== TOP TOOLBAR ===== */}
          <div className="px-6 py-4 bg-white border-b border-gray-200">
            <div className="flex items-center justify-between">
              {/* Left: Breadcrumb */}
              <div className="flex items-center gap-2 text-sm">
                <button 
                  onClick={() => setPath([])}
                  className="text-gray-500 hover:text-gray-900 font-medium transition-colors"
                >
                  My Drive
                </button>
                {path.map((folder, idx) => (
                  <React.Fragment key={folder._id || folder.id}>
                    <ChevronRightIcon className="w-4 h-4 text-gray-400" />
                    <button
                      onClick={() => handleBreadcrumbClick(idx)}
                      className="text-gray-500 hover:text-gray-900 font-medium transition-colors"
                    >
                      {folder.name}
                    </button>
                  </React.Fragment>
                ))}
              </div>

              {/* Right: Actions */}
              <div className="flex items-center gap-3">
                {/* Search */}
                <div className="relative">
                  <MagnifyingGlassIcon className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search files..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 pr-4 py-2 w-64 text-sm bg-gray-100 border-0 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                  />
                </div>

                {/* View Toggle */}
                <div className="flex items-center bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-1.5 rounded-md transition-all ${viewMode === "list" ? "bg-white shadow-sm text-blue-600" : "text-gray-500 hover:text-gray-700"}`}
                  >
                    <ListBulletIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-1.5 rounded-md transition-all ${viewMode === "grid" ? "bg-white shadow-sm text-blue-600" : "text-gray-500 hover:text-gray-700"}`}
                  >
                    <Squares2X2Icon className="w-4 h-4" />
                  </button>
                </div>

                {/* Upload & New Folder */}
                <button
                  onClick={() => setActiveTab("UploadDocument")}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all text-sm font-medium shadow-sm"
                >
                  <ArrowUpTrayIcon className="w-4 h-4" />
                  Upload
                </button>
                <button
                  onClick={() => setActiveTab("createFolder")}
                  className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all text-sm font-medium"
                >
                  <PlusIcon className="w-4 h-4" />
                  New Folder
                </button>
              </div>
            </div>
          </div>

          {/* ===== MAIN CONTENT ===== */}
          <div className="flex-1 overflow-auto p-6">
            
            {/* FOLDERS SECTION */}
            {filteredFolders.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <FolderIcon className="w-4 h-4" />
                  Folders ({filteredFolders.length})
                </h2>
                
                {viewMode === "grid" ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {filteredFolders.map((folder) => (
                      <div
                        key={folder._id || folder.id}
                        onClick={() => handleItemClick(folder)}
                        className="group bg-white rounded-xl border border-gray-200 p-4 hover:shadow-lg hover:border-blue-300 transition-all cursor-pointer"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center">
                            <FolderIcon className="w-7 h-7 text-amber-500" />
                          </div>
                          <button 
                            onClick={(e) => handleItemAction("delete", folder, e)}
                            className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-500 transition-all"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                        <h3 className="font-medium text-gray-900 text-sm truncate mb-1">{folder.name}</h3>
                        <p className="text-xs text-gray-400">{folder.modified}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    {filteredFolders.map((folder, idx) => (
                      <div
                        key={folder._id || folder.id}
                        onClick={() => handleItemClick(folder)}
                        className={`flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50 cursor-pointer transition-colors group ${
                          idx !== filteredFolders.length - 1 ? "border-b border-gray-100" : ""
                        }`}
                      >
                        <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center shrink-0">
                          <FolderIcon className="w-5 h-5 text-amber-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-gray-900 text-sm truncate">{folder.name}</h3>
                          <p className="text-xs text-gray-400 mt-0.5">Folder • {folder.modified}</p>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={(e) => handleItemAction("view", folder, e)}
                            className="p-2 hover:bg-gray-200 rounded-lg text-gray-500 transition-colors"
                          >
                            <EyeIcon className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={(e) => handleItemAction("delete", folder, e)}
                            className="p-2 hover:bg-red-50 rounded-lg text-gray-500 hover:text-red-500 transition-colors"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* DOCUMENTS SECTION */}
            {filteredDocuments.length > 0 && (
              <div>
                <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <DocumentIcon className="w-4 h-4" />
                  Documents ({filteredDocuments.length})
                </h2>

                {viewMode === "grid" ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {filteredDocuments.map((doc) => (
                      <div
                        key={doc._id || doc.id}
                        onClick={() => handleItemClick(doc)}
                        className="group bg-white rounded-xl border border-gray-200 p-4 hover:shadow-lg hover:border-blue-300 transition-all cursor-pointer"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${getFileColor(doc.type).split(" ").slice(0, 2).join(" ")}`}>
                            {getFileIcon(doc.type)}
                          </div>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {doc.type === "pdf" && (
                              <button 
                                onClick={(e) => { e.stopPropagation(); route.push(`/document/${doc.id || doc._id}`); }}
                                className="p-1.5 hover:bg-purple-50 rounded-lg text-purple-500 transition-colors"
                                title="AI Summary"
                              >
                                <SparklesIcon className="w-4 h-4" />
                              </button>
                            )}
                            <button 
                              onClick={(e) => handleItemAction("download", doc, e)}
                              className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 transition-colors"
                            >
                              <ArrowDownTrayIcon className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={(e) => handleItemAction("delete", doc, e)}
                              className="p-1.5 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-500 transition-colors"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        <h3 className="font-medium text-gray-900 text-sm truncate mb-1">{doc.name}</h3>
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium uppercase ${getFileColor(doc.type)}`}>
                            {doc.type}
                          </span>
                          <span>•</span>
                          <span>{doc.size}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    {/* Header */}
                    <div className="px-5 py-3 bg-gray-50 border-b border-gray-100 grid grid-cols-12 gap-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="col-span-6">Name</div>
                      <div className="col-span-2">Type</div>
                      <div className="col-span-2">Size</div>
                      <div className="col-span-2">Modified</div>
                    </div>
                    
                    {filteredDocuments.map((doc, idx) => (
                      <div
                        key={doc._id || doc.id}
                        onClick={() => handleItemClick(doc)}
                        className={`flex items-center px-5 py-3.5 hover:bg-gray-50 cursor-pointer transition-colors group ${
                          idx !== filteredDocuments.length - 1 ? "border-b border-gray-100" : ""
                        }`}
                      >
                        <div className="col-span-6 flex items-center gap-3 flex-1 min-w-0">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${getFileColor(doc.type).split(" ").slice(0, 2).join(" ")}`}>
                            {getFileIcon(doc.type)}
                          </div>
                          <div className="min-w-0">
                            <h3 className="font-medium text-gray-900 text-sm truncate">{doc.name}</h3>
                            <p className="text-xs text-gray-400 mt-0.5">{doc.owner}</p>
                          </div>
                        </div>
                        <div className="col-span-2">
                          <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${getFileColor(doc.type)}`}>
                            {doc.type}
                          </span>
                        </div>
                        <div className="col-span-2 text-sm text-gray-500">{doc.size}</div>
                        <div className="col-span-2 flex items-center justify-between">
                          <span className="text-sm text-gray-500">{doc.modified}</span>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {doc.type === "pdf" && (
                              <button 
                                onClick={(e) => { e.stopPropagation(); route.push(`/document/${doc.id || doc._id}`); }}
                                className="p-2 hover:bg-purple-50 rounded-lg text-purple-500 transition-colors"
                                title="AI Summary"
                              >
                                <SparklesIcon className="w-4 h-4" />
                              </button>
                            )}
                            <button 
                              onClick={(e) => handleItemAction("download", doc, e)}
                              className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors"
                            >
                              <ArrowDownTrayIcon className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={(e) => handleItemAction("delete", doc, e)}
                              className="p-2 hover:bg-red-50 rounded-lg text-gray-500 hover:text-red-500 transition-colors"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Empty State */}
            {filteredFolders.length === 0 && filteredDocuments.length === 0 && !loading && (
              <div className="text-center py-20">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FolderIcon className="w-10 h-10 text-gray-300" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">
                  {searchQuery ? "No files match your search" : "This folder is empty"}
                </h3>
                <p className="text-sm text-gray-400 mb-6">
                  {searchQuery ? "Try a different search term" : "Upload files or create a folder to get started"}
                </p>
                {!searchQuery && (
                  <div className="flex justify-center gap-3">
                    <button
                      onClick={() => setActiveTab("UploadDocument")}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                    >
                      Upload File
                    </button>
                    <button
                      onClick={() => setActiveTab("createFolder")}
                      className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                    >
                      New Folder
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Loading */}
            {loading && (
              <div className="flex items-center justify-center py-20">
                <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
              </div>
            )}

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && path.length === 0 && !searchQuery && (
              <div className="mt-8 flex items-center justify-between">
                <p className="text-sm text-gray-500">
                  Showing <span className="font-medium text-gray-900">{((currentPage - 1) * 10) + 1}</span> to{" "}
                  <span className="font-medium text-gray-900">{Math.min(currentPage * 10, pagination.totalDocuments)}</span> of{" "}
                  <span className="font-medium text-gray-900">{pagination.totalDocuments}</span> files
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={!pagination.hasPreviousPage}
                    className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronLeftIcon className="w-4 h-4" />
                    Previous
                  </button>
                  <div className="flex items-center gap-1">
                    {getPageNumbers().map((page, idx) => (
                      page === "..." ? (
                        <span key={idx} className="px-3 py-2 text-sm text-gray-400">...</span>
                      ) : (
                        <button
                          key={page}
                          onClick={() => goToPage(page)}
                          className={`w-9 h-9 rounded-lg text-sm font-medium transition-all ${
                            page === currentPage
                              ? "bg-blue-600 text-white shadow-sm"
                              : "text-gray-700 hover:bg-gray-100 border border-gray-200"
                          }`}
                        >
                          {page}
                        </button>
                      )
                    ))}
                  </div>
                  <button
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={!pagination.hasNextPage}
                    className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  >
                    Next
                    <ChevronRightIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DriveInterface;