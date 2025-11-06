import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Notes from "./pages/Notes";
import Trash from "./pages/Trash";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// MyRoute component inlined here so external file isn't required
const MyRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<MyRoute><Notes /></MyRoute>} />
          <Route path="/trash" element={<MyRoute><Trash /></MyRoute>} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </Router>
      <ToastContainer position="top-right" />
    </AuthProvider>
  );
}

export default App;
