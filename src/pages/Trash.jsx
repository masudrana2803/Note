import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";

import { collection, query, where, getDocs, deleteDoc, doc, updateDoc } from "firebase/firestore";
import {db, auth } from "../firebase.config";

const Trash = () => {
  const [trash, setTrash] = useState([]);

  const fetchTrash = async () => {
    const q = query(collection(db, "notes"), where("userId", "==", auth.currentUser.uid), where("isDeleted", "==", true));
    const snapshot = await getDocs(q);
    setTrash(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
  };

  const recoverNote = async (id) => {
    const noteRef = doc(db, "notes", id);
    await updateDoc(noteRef, { isDeleted: false });
    fetchTrash();
  };

  const deletePermanently = async (id) => {
    await deleteDoc(doc(db, "notes", id));
    fetchTrash();
  };

  const deleteAll = async () => {
    trash.forEach((n) => deleteDoc(doc(db, "notes", n.id)));
    fetchTrash();
  };

  const recoverAll = async () => {
    trash.forEach((n) => updateDoc(doc(db, "notes", n.id), { isDeleted: false }));
    fetchTrash();
  };

  useEffect(() => {
    fetchTrash();
  }, []);

  return (
    <div>
      <Navbar />
      <div className="p-6 max-w-3xl mx-auto">
        <div className="flex justify-between mb-4">
          <button onClick={recoverAll} className="bg-green-500 text-white px-3 py-1 rounded">Recover All</button>
          <button onClick={deleteAll} className="bg-red-500 text-white px-3 py-1 rounded">Delete All</button>
        </div>
        {trash.map((note) => (
          <div key={note.id} className="p-3 border rounded mb-3 flex justify-between items-center">
            <p>{note.text}</p>
            <div className="space-x-2">
              <button onClick={() => recoverNote(note.id)} className="text-green-600">Recover</button>
              <button onClick={() => deletePermanently(note.id)} className="text-red-600">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Trash;
