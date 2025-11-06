import React from "react";

const NoteCard = ({ note, onDelete }) => {
  return (
    <div className="bg-yellow-100 p-3 rounded-lg shadow">
      <p>{note.text}</p>
      <button onClick={onDelete} className="text-red-500 mt-2 text-sm">Delete</button>
    </div>
  );
};

export default NoteCard;
