import React, { useEffect, useState, useCallback, useMemo } from "react";
import Navbar from "../components/Navbar";
import { collection, query, where, getDocs, deleteDoc, doc, updateDoc, onSnapshot } from "firebase/firestore";
import { db, auth } from "../firebase.config";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";

const Trash = () => {
  const [trash, setTrash] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isAdmin } = useAuth();

  useEffect(() => {
    if (!auth.currentUser) return;

    setLoading(true);
    let q;

    // Admin sees all deleted notes; users see only their own
    if (isAdmin) {
      q = query(collection(db, "notes"), where("isDeleted", "==", true));
    } else {
      q = query(
        collection(db, "notes"),
        where("userId", "==", auth.currentUser.uid),
        where("isDeleted", "==", true)
      );
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setTrash(
        snapshot.docs
          .map((d) => ({ id: d.id, ...d.data() }))
          .sort((a, b) => (b.createdAt?.toDate() || 0) - (a.createdAt?.toDate() || 0))
      );
      setLoading(false);
    });

    return unsubscribe;
  }, [isAdmin]);

  const recoverNote = useCallback(async (id) => {
    try {
      const noteRef = doc(db, "notes", id);
      await updateDoc(noteRef, { isDeleted: false });
      toast.success("Note recovered");
    } catch (error) {
      toast.error("Error recovering note: " + error.message);
      console.error("Error recovering note:", error);
    }
  }, []);

  const deletePermanently = useCallback(async (id) => {
    try {
      await deleteDoc(doc(db, "notes", id));
      toast.success("Note deleted permanently");
    } catch (error) {
      toast.error("Error deleting note: " + error.message);
      console.error("Error deleting note:", error);
    }
  }, []);

  const deleteAll = useCallback(async () => {
    try {
      await Promise.all(trash.map((n) => deleteDoc(doc(db, "notes", n.id))));
      toast.success("All notes deleted");
    } catch (error) {
      toast.error("Error deleting all notes: " + error.message);
      console.error("Error deleting all:", error);
    }
  }, [trash]);

  const recoverAll = useCallback(async () => {
    try {
      await Promise.all(
        trash.map((n) => updateDoc(doc(db, "notes", n.id), { isDeleted: false }))
      );
      toast.success("All notes recovered");
    } catch (error) {
      toast.error("Error recovering all notes: " + error.message);
      console.error("Error recovering all:", error);
    }
  }, [trash]);

  const colorMap = useMemo(
    () => ({
      yellow: "bg-yellow-100",
      blue: "bg-blue-100",
      pink: "bg-pink-100",
      green: "bg-green-100",
      purple: "bg-purple-100",
      orange: "bg-orange-100",
    }),
    []
  );

  return (
    <div>
      <Navbar />
      <div className="p-6 max-w-7xl mx-auto">
        {trash.length > 0 && (
          <div className="flex justify-between mb-6 gap-2">
            <button
              onClick={recoverAll}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition font-semibold"
            >
              Recover All
            </button>
            <button
              onClick={deleteAll}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition font-semibold"
            >
              Delete All
            </button>
          </div>
        )}

        {loading ? (
          <div className="text-center py-8">
            <p className="text-gray-500">Loading trash...</p>
          </div>
        ) : trash.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">Trash is empty</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {trash.map((note) => (
              <div
                key={note.id}
                className={`${colorMap[note.color] || colorMap.yellow} p-4 rounded-lg shadow-md flex flex-col justify-between`}
              >
                <div>
                  {note.title && <h3 className="font-bold text-lg mb-2 text-gray-800">{note.title}</h3>}
                  {note.description && <p className="text-gray-700 mb-2">{note.description}</p>}
                  {note.text && <p className="text-sm text-gray-600">{note.text}</p>}
                  {note.createdAt && (
                    <p className="text-xs text-gray-500 mt-2">
                      {new Date(note.createdAt.toDate()).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <div className="flex gap-3 mt-4">
                  <button
                    onClick={() => recoverNote(note.id)}
                    className="flex-1 bg-green-600 text-white px-3 py-2 rounded hover:bg-green-700 transition text-sm font-semibold"
                  >
                    Recover
                  </button>
                  <button
                    onClick={() => deletePermanently(note.id)}
                    className="flex-1 bg-red-600 text-white px-3 py-2 rounded hover:bg-red-700 transition text-sm font-semibold"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Trash;
