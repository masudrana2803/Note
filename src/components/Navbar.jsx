import React from "react";
import { Link } from "react-router";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-blue-600 text-white flex justify-between items-center px-6 py-3">
      <h1 className="font-bold text-lg">Google Notes Clone</h1>
      <div className="flex gap-4 items-center">
        <Link to="/" className="hover:underline">Notes</Link>
        <Link to="/trash" className="hover:underline">Trash</Link>
        {user && <button onClick={logout} className="bg-red-500 px-3 py-1 rounded">Logout</button>}
      </div>
    </nav>
  );
};

export default Navbar;
