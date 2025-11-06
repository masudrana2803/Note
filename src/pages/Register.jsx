import React, { useState } from "react";
import { createUserWithEmailAndPassword, updateProfile, sendEmailVerification, signOut } from "firebase/auth";
import { auth, db } from "../firebase.config";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const Register = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    // validation
    if (!firstName || !lastName || !email || !password || !confirm) {
      toast.error("Please fill in all fields.");
      return;
    }

    if (password !== confirm) {
      toast.error("Passwords do not match");
      return;
    }
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Update displayName on the Firebase Auth profile
      if (firstName || lastName) {
        await updateProfile(user, { displayName: `${firstName || ""} ${lastName || ""}`.trim() });
      }

      // Save user document in Firestore
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        firstName: firstName || null,
        lastName: lastName || null,
        email: user.email,
        createdAt: serverTimestamp(),
      });

      // Send verification email
      try {
        // Optional: set a continue URL so users return to your app after verifying
        const actionCodeSettings = {
          // The URL to redirect to after email verification. Adjust if you have a dedicated route.
          url: window.location.origin + "/login",
          // This must be false for the standard email verification flow
          handleCodeInApp: false,
        };

        await sendEmailVerification(user, actionCodeSettings);
        console.log("sendEmailVerification: email request sent for", user.email);
        toast.success("Verification email sent. Please check your inbox (and spam folder).");
      } catch (err) {
        // Non-fatal: show notice but continue — include error info for debugging
        console.error("sendEmailVerification error:", err?.code, err?.message);
        toast.error(`Account created but verification email failed to send: ${err?.message || err}`);
      }

      // Sign out the user so they must verify before logging in
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      showToast(error.message || "Registration failed", "error");
    }
  };

  return (
    <div className="flex h-screen justify-center items-center bg-sky-50">
      <form onSubmit={handleRegister} className="glass w-96 p-8 rounded-2xl shadow-2xl">
        <h2 className="text-3xl font-extrabold mb-6 text-center text-sky-900">Create Account</h2>

        <div className="grid grid-cols-2 gap-3 mb-3">
          <input
            type="text"
            placeholder="First name"
            className="p-2 rounded bg-white/30 placeholder-sky-800 border border-red-200"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
          <input
            type="text"
            placeholder="Last name"
            className="p-2 rounded bg-white/30 placeholder-sky-800 border border-red-200"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
        </div>

        <input
          type="email"
          placeholder="Email address"
          className="w-full mb-3 p-2 rounded bg-white/30 placeholder-sky-800 border border-red-200"
          onChange={(e) => setEmail(e.target.value)}
          value={email}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full mb-3 p-2 rounded bg-white/30 placeholder-sky-800 border border-red-200"
          onChange={(e) => setPassword(e.target.value)}
          value={password}
        />

        <input
          type="password"
          placeholder="Confirm password"
          className="w-full mb-4 p-2 rounded bg-white/30 placeholder-sky-800 border border-red-200"
          onChange={(e) => setConfirm(e.target.value)}
          value={confirm}
        />

        <button className="w-full bg-red-600 text-white py-2 rounded hover:bg-red-700 transition">
          Register
        </button>

        <p className="text-center mt-4 text-sm text-sky-800">
          Already have an account? <Link to="/login" className="font-semibold underline">Login</Link>
        </p>
      </form>
    </div>
  );
};

export default Register;
