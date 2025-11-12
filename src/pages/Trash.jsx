import React, { useState, useEffect } from "react";
import { auth, db } from "../firebase.config";
import {
  collection,
  addDoc,
  onSnapshot,
  deleteDoc,
  doc,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";
import Navbar from "../components/Navbar";
import NoteCard from "../components/NoteCard";
import { useNavigate } from "react-router-dom";

const Trash = () => {
  const [trash, setTrash] = useState([]); // All deleted notes
  const user = auth.currentUser;
  const navigate = useNavigate();

  // 🧩 Listen to user's Trash notes in real time
  useEffect(() => {
    if (!user) return;
    const trashRef = collection(db, "users", user.uid, "trash");

    const unsub = onSnapshot(trashRef, (snapshot) => {
      const fetched = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setTrash(fetched);
    });

    return () => unsub();
  }, [user]);

  // ♻️ Recover one note from Trash → Notes
  const recoverNote = async (note) => {
    const trashDocRef = doc(db, "users", user.uid, "trash", note.id);
    const notesRef = collection(db, "users", user.uid, "notes");

    // ✅ Clean the note object before re-adding
    const { id, deletedAt, ...rest } = note;

    await addDoc(notesRef, {
      ...rest,
      restoredAt: serverTimestamp(),
    });

    // Delete from Trash
    await deleteDoc(trashDocRef);

    // Update UI instantly
    setTrash((prev) => prev.filter((n) => n.id !== note.id));
  };

  // ☠️ Permanently delete one note
  const deletePermanently = async (noteId) => {
    const trashDocRef = doc(db, "users", user.uid, "trash", noteId);
    await deleteDoc(trashDocRef);

    // Instantly update UI
    setTrash((prev) => prev.filter((n) => n.id !== noteId));
  };

  // ♻️ Recover All notes
  const recoverAll = async () => {
    const trashRef = collection(db, "users", user.uid, "trash");
    const notesRef = collection(db, "users", user.uid, "notes");
    const snapshot = await getDocs(trashRef);

    const promises = snapshot.docs.map(async (docSnap) => {
      const { id, deletedAt, ...data } = docSnap.data();
      await addDoc(notesRef, {
        ...data,
        restoredAt: serverTimestamp(),
      });
      await deleteDoc(docSnap.ref);
    });

    await Promise.all(promises);
    setTrash([]); // Clear UI after recovery
  };

  // ☠️ Delete All permanently
  const deleteAll = async () => {
    const trashRef = collection(db, "users", user.uid, "trash");
    const snapshot = await getDocs(trashRef);

    const promises = snapshot.docs.map((docSnap) => deleteDoc(docSnap.ref));
    await Promise.all(promises);
    setTrash([]); // Clear UI
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient from-red-50 to-pink-50 pb-12">
        {/* Header */}
        <div className="max-w-7xl mx-auto px-6 py-8 flex items-center justify-between border-b-2 border-red-100">
          <h2 className="text-4xl font-bold text-gray-800">🗑️ Trash Bin</h2>
          <button
            onClick={() => navigate("/notes")}
            className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition duration-200 transform hover:scale-105"
          >
            ← Back to Notes
          </button>
        </div>

        {/* Trash List */}
        <div className="max-w-7xl mx-auto px-6">
          {trash.length > 0 ? (
            <>
              <div className="flex flex-wrap gap-6 justify-center mt-6">
                {trash.map((note) => (
                  <NoteCard
                    key={note.id}
                    note={note}
                    isTrash
                    onRecover={() => recoverNote(note)}
                    onDelete={() => deletePermanently(note.id)}
                  />
                ))}
              </div>

              {/* Buttons: Recover All / Delete All */}
              <div className="flex gap-4 justify-center mt-10">
                <button
                  onClick={recoverAll}
                  className="px-8 py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition"
                >
                  ♻️ Recover All
                </button>
                <button
                  onClick={deleteAll}
                  className="px-8 py-3 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition"
                >
                  ☠️ Delete All
                </button>
              </div>
            </>
          ) : (
            <div className="text-center py-16 text-gray-500 text-2xl">
              No notes in trash 🧹
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Trash;
