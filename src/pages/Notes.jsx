import React, { useEffect, useState, useCallback } from "react";
import Navbar from "../components/Navbar";
import NoteCard from "../components/NoteCard";
import { db, auth } from "../firebase.config";
import {
  collection,
  addDoc,
  query,
  where,
  updateDoc,
  doc,
  serverTimestamp,
  onSnapshot,
} from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";

const colorOptions = [
  { name: "yellow", bg: "bg-yellow-300", label: "Yellow" },
  { name: "blue", bg: "bg-blue-300", label: "Blue" },
  { name: "pink", bg: "bg-pink-300", label: "Pink" },
  { name: "green", bg: "bg-green-300", label: "Green" },
  { name: "purple", bg: "bg-purple-300", label: "Purple" },
  { name: "orange", bg: "bg-orange-300", label: "Orange" },
];

const Notes = () => {
  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [selectedColor, setSelectedColor] = useState("yellow");
  const [loading, setLoading] = useState(true);
  const { user, isAdmin, isOnline } = useAuth();

  // Fetch notes in real-time
  useEffect(() => {
    if (!user) return;
    setLoading(true);

    const q = isAdmin
      ? query(collection(db, "notes"), where("isDeleted", "==", false))
      : query(
          collection(db, "notes"),
          where("userId", "==", user.uid),
          where("isDeleted", "==", false)
        );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedNotes = snapshot.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .sort(
          (a, b) =>
            (b.createdAt?.toDate?.() || 0) - (a.createdAt?.toDate?.() || 0)
        );
      setNotes(fetchedNotes);
      setLoading(false);
    });

    return unsubscribe;
  }, [user, isAdmin]);

  // Add new note with retry/backoff and verbose logging
  const addNote = useCallback(async () => {
    if (!title.trim() && !text.trim()) {
      toast.error("Please add at least a title or note text");
      return;
    }

    if (!user) {
      toast.error("You must be signed in to add notes.");
      console.warn("Notes.addNote attempted with no user");
      return;
    }

    if (!isOnline) {
      toast.error("Browser is offline. Please check your network connection.");
      console.warn("Notes.addNote attempted while offline, navigator.onLine=", navigator.onLine);
      return;
    }

    const payload = {
      title: title.trim(),
      text: text.trim(),
      color: selectedColor,
      userId: user.uid,
      isDeleted: false,
      createdAt: serverTimestamp(),
    };

    // Debug: log current user and auth options
    console.log("Notes.addNote: starting write attempt");
    console.log("Notes.addNote: navigator.onLine=", navigator.onLine);
    console.log("Notes.addNote: isOnline from context=", isOnline);
    try {
      console.log("Notes.addNote: auth.app.options=", auth && auth.app && auth.app.options);
    } catch (e) {
      console.warn("Could not read auth.app.options", e);
    }
    console.log("Notes.addNote: auth.currentUser=", auth?.currentUser || null);
    console.log("Notes.addNote: user=", user?.uid);
    console.log("Notes.addNote: payload=", payload);

    const maxAttempts = 3;
    let lastErr = null;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        console.log(`Notes.addNote: attempt ${attempt + 1}/${maxAttempts}`);
        await addDoc(collection(db, "notes"), payload);
        lastErr = null;
        console.log("Notes.addNote: addDoc succeeded on attempt", attempt + 1);
        break;
      } catch (err) {
        lastErr = err;
        console.error(`Notes.addNote: attempt ${attempt + 1} failed:`, err);
        console.error(`Notes.addNote: error code=`, err?.code);
        console.error(`Notes.addNote: error message=`, err?.message);
        const msg = (err && err.message ? String(err.message) : "").toLowerCase();
        if (
          msg.includes("client is offline") ||
          msg.includes("unavailable") ||
          msg.includes("deadline-exceeded") ||
          msg.includes("network")
        ) {
          const waitMs = 500 * Math.pow(2, attempt);
          console.log(`Notes.addNote: transient error, waiting ${waitMs}ms before retry`);
          await new Promise((res) => setTimeout(res, waitMs));
          continue; // retry
        }
        // non-transient error, break out
        console.log(`Notes.addNote: non-transient error, stopping retries`);
        break;
      }
    }

    if (lastErr) {
      console.error("Notes.addNote: failed after all retries:", lastErr);
      toast.error("Error adding note: " + (lastErr.message || lastErr));
      return;
    }

    // Reset fields after success
    setTitle("");
    setText("");
    setSelectedColor("yellow");

    toast.success("Note added successfully!");
  }, [title, text, selectedColor, user]);

  // Delete (soft delete) note
  const deleteNote = useCallback(async (id) => {
    try {
      const noteRef = doc(db, "notes", id);
      await updateDoc(noteRef, { isDeleted: true });
      toast.success("Note moved to trash");
    } catch (error) {
      console.error("Error deleting note:", error);
      toast.error("Error deleting note: " + error.message);
    }
  }, []);

  return (
    <div>
      <Navbar />
      <div className="p-6 max-w-7xl mx-auto">
        {/* Note creation area */}
        <div className="bg-white p-6 rounded-lg shadow-lg mb-6 sticky top-20 z-40">
          <h2 className="text-xl font-bold mb-4 text-gray-800">Create Note</h2>

          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <input
              className="flex-1 border-2 border-gray-300 rounded-lg p-3 focus:outline-none focus:border-blue-500 transition"
              placeholder="Note title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            <textarea
              className="flex-1 border-2 border-gray-300 rounded-lg p-3 focus:outline-none focus:border-blue-500 transition resize-none h-24"
              placeholder="Add note content..."
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
          </div>

          {/* Color selector */}
          <div className="flex items-center gap-3 mb-4">
            <label className="font-semibold text-gray-700">Color:</label>
            <div className="flex gap-2">
              {colorOptions.map((color) => (
                <button
                  key={color.name}
                  onClick={() => setSelectedColor(color.name)}
                  className={`w-8 h-8 ${color.bg} rounded-full border-4 ${
                    selectedColor === color.name
                      ? "border-gray-800 scale-110"
                      : "border-gray-300"
                  } transition-all`}
                  title={color.label}
                />
              ))}
            </div>
          </div>

          <button
            onClick={addNote}
            className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition font-semibold"
          >
            Add Note
          </button>
        </div>

        {/* Notes display area */}
        {loading ? (
          <div className="text-center py-8">
            <p className="text-gray-500">Loading notes...</p>
          </div>
        ) : notes.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No notes yet. Create one above!</p>
          </div>
        ) : (
          <div className="flex flex-wrap gap-4 justify-center md:justify-start">
            {notes.map((note) => (
              <div key={note.id} className="w-full sm:w-[48%] md:w-[31%] lg:w-[23%]">
                <NoteCard note={note} onDelete={() => deleteNote(note.id)} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notes;
