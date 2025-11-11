import React, { useState } from "react";
import {
  createUserWithEmailAndPassword,
  updateProfile,
  sendEmailVerification,
  signOut,
} from "firebase/auth";
import { auth, db } from "../firebase.config";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { Link, useNavigate } from "react-router";
import { toast } from "react-toastify";

const Register = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!firstName || !lastName || !email || !password || !confirm) {
      toast.error("Please fill in all fields.");
      return;
    }

    if (password !== confirm) {
      toast.error("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Update display name
      await updateProfile(user, {
        displayName: `${firstName} ${lastName}`.trim(),
      });

      // Save user info to Firestore
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        firstName,
        lastName,
        email: user.email,
        createdAt: serverTimestamp(),
      });

      // Send verification email
      await sendEmailVerification(auth.currentUser, {
        url: window.location.origin + "/login",
        handleCodeInApp: false,
      });

      toast.success("Verification email sent! Please check your inbox.");

      // Clear input fields
      setFirstName("");
      setLastName("");
      setEmail("");
      setPassword("");
      setConfirm("");

      // Sign out so user must verify first
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error("Registration Error:", error);
      toast.error(error.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen justify-center items-center bg-sky-50">
      <form
        onSubmit={handleRegister}
        className="glass w-96 p-8 rounded-2xl shadow-2xl bg-white/60 backdrop-blur-md"
      >
        <h2 className="text-3xl font-extrabold mb-6 text-center text-sky-900">
          Create Account
        </h2>

        <div className="grid grid-cols-2 gap-3 mb-3">
          <input
            type="text"
            placeholder="First name"
            className="p-2 rounded bg-white/30 placeholder-sky-800 border border-red-200 focus:outline-none focus:ring-2 focus:ring-sky-500"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
          <input
            type="text"
            placeholder="Last name"
            className="p-2 rounded bg-white/30 placeholder-sky-800 border border-red-200 focus:outline-none focus:ring-2 focus:ring-sky-500"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
        </div>

        <input
          type="email"
          placeholder="Email address"
          className="w-full mb-3 p-2 rounded bg-white/30 placeholder-sky-800 border border-red-200 focus:outline-none focus:ring-2 focus:ring-sky-500"
          onChange={(e) => setEmail(e.target.value)}
          value={email}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full mb-3 p-2 rounded bg-white/30 placeholder-sky-800 border border-red-200 focus:outline-none focus:ring-2 focus:ring-sky-500"
          onChange={(e) => setPassword(e.target.value)}
          value={password}
        />

        <input
          type="password"
          placeholder="Confirm password"
          className="w-full mb-4 p-2 rounded bg-white/30 placeholder-sky-800 border border-red-200 focus:outline-none focus:ring-2 focus:ring-sky-500"
          onChange={(e) => setConfirm(e.target.value)}
          value={confirm}
        />

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2 rounded text-white transition ${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-red-600 hover:bg-red-700"
          }`}
        >
          {loading ? "Registering..." : "Register"}
        </button>

        <p className="text-center mt-4 text-sm text-sky-800">
          Already have an account?{" "}
          <Link to="/login" className="font-semibold underline">
            Login
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Register;
