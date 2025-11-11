import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth, db } from "../firebase.config";
import { doc, getDoc } from "firebase/firestore";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    // Track online/offline state
    const handleOnline = () => {
      console.log("AuthContext: Browser came online");
      setIsOnline(true);
    };
    const handleOffline = () => {
      console.log("AuthContext: Browser went offline");
      setIsOnline(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  useEffect(() => {
    let onlineListener = null;
    let retryTimeoutId = null;

    const fetchAdmin = async (uid) => {
      try {
        // Log detailed info before attempt
        console.log("AuthContext.fetchAdmin: attempting fetch for uid=", uid);
        console.log("AuthContext.fetchAdmin: navigator.onLine=", navigator.onLine);
        console.log("AuthContext.fetchAdmin: auth.currentUser=", auth.currentUser?.uid);

        const userDoc = await getDoc(doc(db, "users", uid));
        const adminStatus = userDoc.data()?.isAdmin || false;
        console.log("AuthContext.fetchAdmin: success, isAdmin=", adminStatus);
        setIsAdmin(adminStatus);
      } catch (err) {
        const msg = (err?.message || "").toLowerCase();
        console.error("AuthContext.fetchAdmin: error=", err);
        console.error("AuthContext.fetchAdmin: error message=", err?.message);
        console.error("AuthContext.fetchAdmin: error code=", err?.code);
        setIsAdmin(false);

        // If offline or network-related, schedule retry
        if (
          msg.includes("client is offline") ||
          msg.includes("unavailable") ||
          msg.includes("network") ||
          msg.includes("deadline-exceeded")
        ) {
          console.warn("AuthContext.fetchAdmin: transient error detected, will retry on online event");
          if (onlineListener) window.removeEventListener("online", onlineListener);
          onlineListener = () => {
            console.log("AuthContext.fetchAdmin: retrying after online event");
            fetchAdmin(uid).catch((e) =>
              console.warn("AuthContext.fetchAdmin: retry failed:", e)
            );
            window.removeEventListener("online", onlineListener);
            onlineListener = null;
          };
          window.addEventListener("online", onlineListener);

          // Also add a timeout-based retry (in case 'online' event doesn't fire)
          if (retryTimeoutId) clearTimeout(retryTimeoutId);
          retryTimeoutId = setTimeout(() => {
            console.log("AuthContext.fetchAdmin: timeout-based retry triggered");
            fetchAdmin(uid).catch((e) =>
              console.warn("AuthContext.fetchAdmin: timeout retry failed:", e)
            );
          }, 3000);
        }
      }
    };

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      console.log("AuthContext: onAuthStateChanged fired, currentUser=", currentUser?.uid || null);
      setUser(currentUser);
      if (currentUser) {
        await fetchAdmin(currentUser.uid);
      } else {
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return () => {
      unsubscribe();
      if (onlineListener) window.removeEventListener("online", onlineListener);
      if (retryTimeoutId) clearTimeout(retryTimeoutId);
    };
  }, []);

  const logout = () => signOut(auth);

  return (
    <AuthContext.Provider value={{ user, isAdmin, logout, isOnline }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
