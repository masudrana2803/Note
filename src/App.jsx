import React, { lazy, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Lazy load pages for better code splitting and performance
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const Notes = lazy(() => import("./pages/Notes"));
const Trash = lazy(() => import("./pages/Trash"));

// Loading fallback component
const LoadingFallback = () => (
  <div className="flex h-screen justify-center items-center">
    <p className="text-gray-500">Loading...</p>
  </div>
);

// MyRoute component with emailVerified check for security
const MyRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            <Route path="/" element={<MyRoute><Notes /></MyRoute>} />
            <Route path="/trash" element={<MyRoute><Trash /></MyRoute>} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Routes>
        </Suspense>
      </Router>
      <ToastContainer position="top-right" />
    </AuthProvider>
  );
}

export default App;
