import React, { useState, useEffect } from "react";
import { auth, db } from "../firebase.config";
import {
  collection,
  addDoc,
  onSnapshot,
  serverTimestamp,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import Navbar from "../components/Navbar";
import NoteCard from "../components/NoteCard";
import { useNavigate } from "react-router-dom";

const Notes = () => {
  // 🧠 Local state
  const [title, setTitle] = useState(""); // Note title
  const [desc, setDesc] = useState(""); // Note description
  const [color, setColor] = useState("#ffffff"); // Background color for note
  const [notes, setNotes] = useState([]); // List of all active notes
  const [editNote, setEditNote] = useState(null); // Currently edited note

  const user = auth.currentUser; // Get currently logged-in Firebase user
  const navigate = useNavigate(); // For navigating between Notes and Trash pages

  // 🔹 Fetch all notes in real time for this user
  useEffect(() => {
    if (!user) return; // Stop if user is not yet loaded

    const notesRef = collection(db, "users", user.uid, "notes");

    // Real-time Firestore listener
    const unsub = onSnapshot(notesRef, (snapshot) => {
      const fetchedNotes = snapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter(
          (note) =>
            // ✅ Only show valid notes
            note &&
            typeof note.title === "string" &&
            typeof note.description === "string" &&
            note.title.trim() !== "" &&
            note.description.trim() !== "" &&
            !note.deletedAt // exclude deleted/trash items accidentally left behind
        );

      setNotes(fetchedNotes); // Update local state
    });

    // Cleanup listener on component unmount
    return () => unsub();
  }, [user]);

  // ➕ Add a new note
  const addNote = async () => {
    if (!title || !desc) {
      alert("Please fill in both title and description!");
      return;
    }

    const notesRef = collection(db, "users", user.uid, "notes");

    // Create a new note document in Firestore
    await addDoc(notesRef, {
      uid: user.uid,
      title,
      description: desc,
      color,
      createdAt: serverTimestamp(),
    });

    // Clear inputs after adding
    setTitle("");
    setDesc("");
    setColor("#ffffff");
  };

  // ✏️ Start editing a note
  const startEdit = (note) => {
    setEditNote(note);
    setTitle(note.title);
    setDesc(note.description);
    setColor(note.color);
  };

  // 💾 Save updated note
  const updateNote = async () => {
    if (!editNote) return;

    const noteRef = doc(db, "users", user.uid, "notes", editNote.id);
    await updateDoc(noteRef, {
      title,
      description: desc,
      color,
      updatedAt: serverTimestamp(),
    });

    // Reset fields after update
    setEditNote(null);
    setTitle("");
    setDesc("");
    setColor("#ffffff");
  };

  // 🗑️ Move a note to Trash (not permanent deletion)
  const moveToTrash = async (note) => {
    const noteRef = doc(db, "users", user.uid, "notes", note.id);
    const trashRef = collection(db, "users", user.uid, "trash");

    // Copy note to Trash collection with timestamp
    await addDoc(trashRef, { ...note, deletedAt: serverTimestamp() });

    // Remove it from Notes collection
    await deleteDoc(noteRef);

    // Optional: instant local update for smooth UX
    setNotes((prev) => prev.filter((n) => n.id !== note.id));
  };

  return (
    <>
      {/* 🔝 Navigation bar */}
      <Navbar />

      <div className="min-h-screen bg-gradient from-blue-50 to-cyan-50 pb-12">
        {/* 🧩 Header section with Trash navigation */}
        <div className="max-w-7xl mx-auto px-6 py-8 flex items-center justify-between border-b-2 border-blue-100">
          <h2 className="text-4xl font-bold text-gray-800">📝 Your Notes</h2>

          {/* Go to Trash page */}
          <button
            onClick={() => navigate("/trash")}
            className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition duration-200 transform hover:scale-105"
          >
            🗑️ Go to Trash
          </button>
        </div>

        {/* ✍️ Create / Edit form */}
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="bg-white rounded-2xl shadow-md p-8 border-2 border-blue-100 space-y-6">
            <h3 className="text-xl font-semibold text-gray-800">
              {editNote ? "✏️ Edit Note" : "Create a New Note"}
            </h3>

            {/* Title input */}
            <input
              type="text"
              placeholder="Note title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:outline-none focus:border-blue-500 bg-blue-50"
            />

            {/* Description textarea */}
            <textarea
              placeholder="Write your note..."
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:outline-none focus:border-blue-500 bg-blue-50 resize-none h-32"
            />

            {/* Form buttons */}
            <div className="flex gap-4">
              {editNote ? (
                // Update button if editing
                <button
                  onClick={updateNote}
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white font-semibold py-3 rounded-lg transition"
                >
                  ✔️ Update Note
                </button>
              ) : (
                // Add button if new note
                <button
                  onClick={addNote}
                  className="w-1/4 bg-blue-400 hover:bg-blue-600 text-white font-semibold py-3 rounded-lg transition"
                >
                  + Add Note
                </button>
              )}

              {/* Cancel editing */}
              {editNote && (
                <button
                  onClick={() => {
                    setEditNote(null);
                    setTitle("");
                    setDesc("");
                  }}
                  className="px-6 bg-gray-400 hover:bg-gray-500 text-white font-semibold py-3 rounded-lg transition"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 🗂️ Notes List */}
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-wrap gap-6 justify-center">
            {notes.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                onDelete={() => moveToTrash(note)} // Move note to trash
                onEdit={() => startEdit(note)} // Edit existing note
              />
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default Notes;
