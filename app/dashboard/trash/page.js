"use client";

import React, { useEffect, useState } from "react";
import {
  TrashIcon,
  XMarkIcon,
  ArrowPathIcon,
  FolderIcon,
  DocumentIcon,
  PhotoIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";

// Confirmation Dialog Component
const ConfirmDialog = ({ isOpen, onClose, onConfirm, title, message, confirmText, confirmColor }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden animate-[fadeIn_0.2s_ease-out]">
        <div className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
              confirmColor === "red" ? "bg-red-100" : "bg-green-100"
            }`}>
              <ExclamationTriangleIcon className={`w-6 h-6 ${
                confirmColor === "red" ? "text-red-600" : "text-green-600"
              }`} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
              <p className="text-sm text-gray-500 mt-1">{message}</p>
            </div>
          </div>
          
          <div className="flex gap-3 justify-end mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors ${
                confirmColor === "red" 
                  ? "bg-red-600 hover:bg-red-700" 
                  : "bg-green-600 hover:bg-green-700"
              }`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const TrashPage = () => {
  const [trashItems, setTrashItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialog, setDialog] = useState({
    isOpen: false,
    title: "",
    message: "",
    confirmText: "",
    confirmColor: "red",
    onConfirm: () => {},
  });

  const fetchAll = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/files/recycle", { method: "GET" });
      if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
      
      const result = await res.json();
      const allItems = [
        ...(result.folders || []),
        ...(result.documents || []),
      ];
      setTrashItems(allItems);
    } catch (error) {
      console.error("[TrashPage] Failed to fetch trash items:", error);
    } finally {
      setLoading(false);
    }
  };

  const openDialog = (config) => {
    setDialog({ ...config, isOpen: true });
  };

  const closeDialog = () => {
    setDialog(prev => ({ ...prev, isOpen: false }));
  };

  const handleRestore = (item) => {
    openDialog({
      title: "Restore Item",
      message: `Are you sure you want to restore "${item.name}"? It will return to its original location.`,
      confirmText: "Restore",
      confirmColor: "green",
      onConfirm: async () => {
        closeDialog();
        try {
          const res = await fetch(`/api/files/recycle/${item.id}/restore`, {
            method: "PATCH",
          });
          if (!res.ok) throw new Error("Restore failed");
          fetchAll();
        } catch (error) {
          console.error("Restore error:", error);
        }
      },
    });
  };

  const handlePermanentDelete = (item) => {
    openDialog({
      title: "Delete Forever",
      message: `Are you sure you want to permanently delete "${item.name}"? This action cannot be undone.`,
      confirmText: "Delete Forever",
      confirmColor: "red",
      onConfirm: async () => {
        closeDialog();
        try {
          const res = await fetch(`/api/files/recycle/${item.id}/parmanentDelete`, {
            method: "PATCH",
          });
          if (!res.ok) throw new Error("Delete failed");
          fetchAll();
        } catch (error) {
          console.error("Delete error:", error);
        }
      },
    });
  };

  const getFileIcon = (type) => {
    switch (type) {
      case "folder":
        return (
          <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center">
            <FolderIcon className="w-5 h-5 text-amber-500" />
          </div>
        );
      case "pdf":
        return (
          <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
            <DocumentIcon className="w-5 h-5 text-red-500" />
          </div>
        );
      case "image":
        return (
          <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
            <PhotoIcon className="w-5 h-5 text-green-500" />
          </div>
        );
      default:
        return (
          <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center">
            <DocumentIcon className="w-5 h-5 text-gray-500" />
          </div>
        );
    }
  };

  const getDaysColor = (days) => {
    if (days === undefined || days === null) return "text-gray-400";
    if (days <= 3) return "text-red-500 font-medium";
    if (days <= 7) return "text-amber-500";
    return "text-gray-500";
  };

  useEffect(() => {
    fetchAll();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 mt-14 ">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-5">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-3 ml-9">
            <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
              <TrashIcon className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Trash</h1>
              <p className="text-sm text-gray-500">
                Items in trash are permanently deleted after 30 days
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-8 py-6">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
          </div>
        ) : trashItems.length === 0 ? (
          /* Empty State */
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <TrashIcon className="w-10 h-10 text-gray-300" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">Trash is empty</h3>
            <p className="text-sm text-gray-400">
              Items you delete will appear here for 30 days
            </p>
          </div>
        ) : (
          /* Items List */
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
            {/* Table Header */}
            <div className="px-6 py-3 bg-gray-50 border-b border-gray-100 grid grid-cols-12 gap-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
              <div className="col-span-5">Name</div>
              <div className="col-span-3">Deleted</div>
              <div className="col-span-2">Expires In</div>
              <div className="col-span-2 text-right">Actions</div>
            </div>

            {/* Items */}
            {trashItems.map((item, idx) => (
              <div
                key={item.id}
                className={`flex items-center px-6 py-4 hover:bg-gray-50 transition-colors group ${
                  idx !== trashItems.length - 1 ? "border-b border-gray-100" : ""
                }`}
              >
                {/* Name */}
                <div className="col-span-5 flex items-center gap-3 min-w-0">
                  {getFileIcon(item.type)}
                  <div className="min-w-0">
                    <h3 className="text-sm font-medium text-gray-900 truncate line-through decoration-gray-400">
                      {item.name}
                    </h3>
                    <p className="text-xs text-gray-400 mt-0.5 capitalize">{item.type}</p>
                  </div>
                </div>

                {/* Deleted Date */}
                <div className="col-span-3 flex items-center gap-2 text-sm text-gray-500">
                  <ClockIcon className="w-4 h-4 text-gray-400" />
                  {item.deletedDate || item.modified || "Recently"}
                </div>

                {/* Remaining Days */}
                <div className="col-span-2">
                  <span className={`text-sm flex items-center gap-1.5 ${getDaysColor(item.remainingDays)}`}>
                    {item.remainingDays !== undefined && item.remainingDays !== null ? (
                      <>
                        <div className={`w-2 h-2 rounded-full ${
                          item.remainingDays <= 3 ? "bg-red-500" : 
                          item.remainingDays <= 7 ? "bg-amber-500" : "bg-green-500"
                        }`} />
                        {item.remainingDays} days left
                      </>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </span>
                </div>

                {/* Actions */}
                <div className="col-span-2 flex items-center justify-end gap-2">
                  <button
                    onClick={() => handleRestore(item)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-green-700 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
                  >
                    <ArrowPathIcon className="w-3.5 h-3.5" />
                    Restore
                  </button>

                  <button
                    onClick={() => handlePermanentDelete(item)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete Forever"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Info Banner */}
        {trashItems.length > 0 && (
          <div className="mt-6 flex items-center gap-2 px-4 py-3 bg-blue-50 border border-blue-100 rounded-lg text-sm text-blue-700">
            <ExclamationTriangleIcon className="w-4 h-4" />
            <p>
              Items in trash will be automatically deleted after 30 days. 
              <button 
                onClick={() => {
                  openDialog({
                    title: "Empty Trash",
                    message: "Are you sure you want to permanently delete all items in trash? This action cannot be undone.",
                    confirmText: "Empty Trash",
                    confirmColor: "red",
                    onConfirm: async () => {
                      closeDialog();
                      // Call your empty trash API here
                      console.log("Empty trash");
                    },
                  });
                }}
                className="font-medium underline ml-1 text-red-600 hover:text-blue-800"
              >
                Empty trash now
              </button>
            </p>
          </div>
        )}
      </div>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={dialog.isOpen}
        onClose={closeDialog}
        onConfirm={dialog.onConfirm}
        title={dialog.title}
        message={dialog.message}
        confirmText={dialog.confirmText}
        confirmColor={dialog.confirmColor}
      />
    </div>
  );
};

export default TrashPage;