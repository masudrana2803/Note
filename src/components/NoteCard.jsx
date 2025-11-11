import React, { memo } from "react";

// Color map for note backgrounds
const colorMap = {
  yellow: "bg-yellow-100",
  blue: "bg-blue-100",
  pink: "bg-pink-100",
  green: "bg-green-100",
  purple: "bg-purple-100",
  orange: "bg-orange-100",
};

const NoteCard = memo(({ note, onDelete }) => {
  const bgColor = colorMap[note.color] || colorMap.yellow;

  return (
    <div className={`${bgColor} p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow`}>
      {note.title && <h3 className="font-bold text-lg mb-2 text-gray-800">{note.title}</h3>}
      {note.description && <p className="text-gray-700 mb-3">{note.description}</p>}
      {note.text && <p className="text-sm text-gray-600">{note.text}</p>}
      {note.createdAt && (
        <p className="text-xs text-gray-500 mt-2">
          {new Date(note.createdAt.toDate()).toLocaleDateString()}
        </p>
      )}
      <button
        onClick={onDelete}
        className="text-red-600 hover:text-red-800 mt-3 text-sm font-semibold transition"
      >
        Delete
      </button>
    </div>
  );
});

NoteCard.displayName = "NoteCard";

export default NoteCard;
