import React, { memo } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = memo(() => {
  const { user, isAdmin, logout } = useAuth();

  return (
    <nav className="bg-blue-600 text-white flex justify-between items-center px-6 py-3 shadow-md">
      <h1 className="font-bold text-lg">Google Notes Clone</h1>
      <div className="flex gap-4 items-center">
        <Link to="/" className="hover:underline">Notes</Link>
        <Link to="/trash" className="hover:underline">Trash</Link>
        {isAdmin && <span className="bg-red-500 px-3 py-1 rounded text-sm font-semibold">Admin</span>}
        {user && <button onClick={logout} className="bg-red-500 px-3 py-1 rounded hover:bg-red-600 transition">Logout</button>}
      </div>
    </nav>
  );
});

Navbar.displayName = "Navbar";

export default Navbar;
