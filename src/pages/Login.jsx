import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase.config";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    // validation
    if (!email || !password) {
      toast.error("Please fill in both email and password.");
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast.success("Successfully logged in");
      navigate("/");
    } catch (error) {
      toast.error(error.message || "Login failed");
    }
  };

  return (
    <div className="flex h-screen justify-center items-center bg-sky-50 ">
      <form
        onSubmit={handleLogin}
        className="glass w-96 p-8 rounded-2xl shadow-2xl"
      >
        <h2 className="text-3xl font-extrabold mb-6 text-center text-sky-900">Welcome Back</h2>
        <p className="text-center text-sm text-sky-700 mb-4">Sign in to continue to your notes</p>

        <input
          type="email"
            placeholder="Email address"
            className="w-full mb-3 p-2 rounded bg-white/30 placeholder-sky-800 border border-red-200"
            onChange={(e) => setEmail(e.target.value)}
          />

        <input
          type="password"
            placeholder="Password"
            className="w-full mb-4 p-2 rounded bg-white/30 placeholder-sky-800 border border-red-200"
            onChange={(e) => setPassword(e.target.value)}
          />

        <button className="w-full bg-red-500 text-white py-2 rounded hover:bg-red-700 transition">
          Login
        </button>

        <p className="text-center mt-4 text-sm text-sky-800">
          Don’t have an account? <Link to="/register" className="font-semibold underline">Sign up</Link>
        </p>
      </form>
    </div>
  );
};

export default Login;
