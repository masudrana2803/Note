import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import NoteCard from "../components/NoteCard";
import { db, auth } from "../firebase.config";
import { collection, addDoc, query, where, getDocs, updateDoc, deleteDoc, doc } from "firebase/firestore";

const Notes = () => {
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState("");

  const fetchNotes = async () => {
    const q = query(collection(db, "notes"), where("userId", "==", auth.currentUser.uid), where("isDeleted", "==", false));
    const snapshot = await getDocs(q);
    setNotes(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
  };

  const addNote = async () => {
    if (!newNote.trim()) return;
    await addDoc(collection(db, "notes"), { text: newNote, userId: auth.currentUser.uid, isDeleted: false });
    setNewNote("");
    fetchNotes();
  };

  const deleteNote = async (id) => {
    const noteRef = doc(db, "notes", id);
    await updateDoc(noteRef, { isDeleted: true });
    fetchNotes();
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  return (
    <div>
      <Navbar />
      <div className="p-6 max-w-3xl mx-auto">
        <div className="flex gap-2 mb-6">
          <input
            className="flex-1 border rounded p-2"
            placeholder="Write a note..."
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
          />
          <button onClick={addNote} className="bg-blue-500 text-white px-4 rounded hover:bg-blue-600">
            Add
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {notes.map((note) => (
            <NoteCard key={note.id} note={note} onDelete={() => deleteNote(note.id)} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Notes;
