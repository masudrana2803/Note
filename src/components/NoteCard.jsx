import React from "react";

/**
 * NoteCard Component
 * ------------------
 * A reusable card that displays a note.
 * It dynamically adapts its buttons depending on whether
 * it's being shown inside Notes or Trash.
 *
 * Props:
 * - note: The note object (title, description, color, id, etc.)
 * - onDelete: Function called when deleting a note
 * - onEdit: Function called when editing (only in Notes)
 * - onRecover: Function called when recovering (only in Trash)
 * - isTrash: Boolean that determines which UI to render (Trash vs Notes)
 */

const NoteCard = ({ note, onDelete, onEdit, onRecover, isTrash }) => {
  return (
    <div
      className="p-5 rounded-2xl shadow-md border border-gray-200 transition hover:shadow-xl hover:scale-[1.02] duration-200 bg-white"
      style={{
        backgroundColor: note.color || "#fff",
      }}
    >
      {/* Title */}
      <h3 className="text-xl font-semibold text-gray-800 mb-2">
        {note.title || "Untitled Note"}
      </h3>

      {/* Description */}
      <p className="text-gray-700 mb-4 whitespace-pre-line">
        {note.description || "No content available."}
      </p>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3 justify-end">
        {!isTrash ? (
          <>
            {/* Edit Button */}
            <button
              onClick={onEdit}
              title="Edit this note"
              className="px-4 py-2 bg-green-400 hover:bg-green-600 text-white rounded-lg font-medium shadow-sm transition active:scale-95"
            >
              Edit
            </button>

            {/* Move to Trash */}
            <button
              onClick={onDelete}
              title="Move to Trash"
              className="px-4 py-2 bg-red-400 hover:bg-red-600 text-white rounded-lg font-medium shadow-sm transition active:scale-95"
            >
              Delete
            </button>
          </>
        ) : (
          <>
            {/* Recover Button */}
            <button
              onClick={onRecover}
              title="Recover this note"
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium shadow-sm transition active:scale-95"
            >
              ♻️ Recover
            </button>

            {/* Permanently Delete Button */}
            <button
              onClick={onDelete}
              title="Delete permanently"
              className="px-4 py-1 bg-red-400 hover:bg-red-700 text-white rounded-lg font-medium shadow-sm transition active:scale-95"
            >
              ❌ Delete
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default NoteCard;
