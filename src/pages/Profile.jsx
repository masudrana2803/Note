import React, { useEffect, useState } from "react";
import { auth, db } from "../firebase.config";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import {
  updateProfile,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from "firebase/auth";
import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [profile, setProfile] = useState({
    name: "",
    email: "",
  });

  // Password fields
  const [currentPass, setCurrentPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");

  // Wait for Firebase Auth user to load
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // Load Firestore profile once user is ready
  useEffect(() => {
    if (!user) return;

    const fetchProfile = async () => {
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        setProfile({
          name: userSnap.data().name,
          email: user.email,
        });
      } else {
        // Create default profile if missing
        await setDoc(userRef, {
          name: user.displayName || "",
          createdAt: serverTimestamp(),
        });

        setProfile({
          name: user.displayName || "",
          email: user.email,
        });
      }

      setLoading(false);
    };

    fetchProfile();
  }, [user]);

  // Save profile name
  const saveProfile = async () => {
    if (!user) return;

    const userRef = doc(db, "users", user.uid);

    await updateDoc(userRef, {
      name: profile.name,
      updatedAt: serverTimestamp(),
    });

    await updateProfile(user, {
      displayName: profile.name,
    });

    alert("Profile updated!");
  };

  // Change password
  const changePassword = async () => {
    if (!currentPass || !newPass || !confirmPass)
      return alert("Please fill all password fields!");

    if (newPass !== confirmPass)
      return alert("New passwords do not match!");

    try {
      // Re-authenticate the user
      const credential = EmailAuthProvider.credential(
        user.email,
        currentPass
      );

      await reauthenticateWithCredential(user, credential);

      // Update password
      await updatePassword(user, newPass);

      // Clear inputs
      setCurrentPass("");
      setNewPass("");
      setConfirmPass("");

      alert("Password updated successfully!");
    } catch (error) {
      console.error(error);
      alert("Incorrect current password or operation not allowed!");
    }
  };

  if (loading) {
    
    return (
      <div className="text-center mt-20 text-xl font-semibold">
        Loading profile...
      </div>
    );

    

  }

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-gradient from-blue-50 to-cyan-50 pb-12">

        {/* Header */}
        <div className="max-w-7xl mx-auto px-6 py-8 flex items-center justify-between border-b-2 border-blue-100">
          <h2 className="text-4xl font-bold text-gray-800">👤 User Profile</h2>

          <button
            onClick={() => navigate("/notes")}
            className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition"
          >
            📝 Back to Notes
          </button>
        </div>

        {/* Profile Form */}
        <div className="max-w-3xl mx-auto px-6 py-10">
          <div className="bg-white p-8 rounded-2xl shadow-md border border-blue-100 space-y-8">

            {/* EMAIL */}
            <div>
              <label className="text-gray-700 font-semibold">Email Address</label>
              <input
                type="text"
                value={profile.email}
                disabled
                className="w-full mt-2 px-4 py-3 bg-gray-100 border-2 border-gray-200 rounded-lg text-gray-600"
              />
            </div>

            {/* NAME */}
            <div>
              <label className="text-gray-700 font-semibold">Full Name</label>
              <input
                type="text"
                value={profile.name}
                onChange={(e) =>
                  setProfile((prev) => ({ ...prev, name: e.target.value }))
                }
                className="w-full mt-2 px-4 py-3 border-2 border-blue-200 rounded-lg focus:border-blue-500 bg-blue-50"
              />

              <button
                onClick={saveProfile}
                className="mt-4 w-full py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition"
              >
                Save Profile
              </button>
            </div>

            {/* CHANGE PASSWORD SECTION */}
            <div className="pt-6 border-t border-gray-200">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                🔐 Change Password
              </h3>

              {/* Current Password */}
              <input
                type="password"
                placeholder="Current Password"
                value={currentPass}
                onChange={(e) => setCurrentPass(e.target.value)}
                className="w-full px-4 py-3 mb-3 border-2 border-blue-200 rounded-lg bg-blue-50"
              />

              {/* New Password */}
              <input
                type="password"
                placeholder="New Password"
                value={newPass}
                onChange={(e) => setNewPass(e.target.value)}
                className="w-full px-4 py-3 mb-3 border-2 border-blue-200 rounded-lg bg-blue-50"
              />

              {/* Confirm Password */}
              <input
                type="password"
                placeholder="Confirm New Password"
                value={confirmPass}
                onChange={(e) => setConfirmPass(e.target.value)}
                className="w-full px-4 py-3 mb-6 border-2 border-blue-200 rounded-lg bg-blue-50"
              />

              <button
                onClick={changePassword}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition"
              >
                Update Password
              </button>
            </div>

            {/* Logout Button */}
            <button
              onClick={() => {
                auth.signOut();
                navigate("/login");
              }}
              className="w-full py-3 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition"
            >
              Logout
            </button>

          </div>
        </div>
      </div>
    </>
  );
};

export default Profile;
