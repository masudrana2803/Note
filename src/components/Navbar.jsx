import React from "react";
import { signOut } from "firebase/auth";
import { auth } from "../firebase.config";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/");
  };

  return (
    <nav className="sticky top-0 z-50 bg-white border-b-2 border-blue-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient from-blue-400 to-cyan-500 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-lg">K</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Keep</h1>
        </div>

        <div className="flex items-center gap-4">
          {/* <button
            onClick={() => navigate("/profile")}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Profile
          </button> */}

          <button
            onClick={handleLogout}
            className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition duration-200 transform hover:scale-105"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
