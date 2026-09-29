import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { getMyInfo } from "../features/profile/services/userService";
import { isAuthenticated, getCurrentUserId } from "../features/auth/services/authenticationService";
import { AuthContext } from "../context/AuthContext";

const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
  const authContext = useContext(AuthContext);
  const isAuth = authContext?.isAuthenticated;
  const userId = authContext?.userId;

  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchCurrentUser = useCallback(async () => {
    if (!isAuthenticated()) {
      setCurrentUser(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await getMyInfo();
      const rawUser = response?.data?.result || response?.result || response?.data;
      if (rawUser) {
        const displayName =
          [rawUser.firstname, rawUser.lastname].filter(Boolean).join(" ").trim() ||
          rawUser.username ||
          "User";
        const avatarUrl = rawUser.avatar || rawUser.avatarUrl || "";

        setCurrentUser({
          ...rawUser,
          id: rawUser.id || getCurrentUserId(),
          userId: rawUser.id || rawUser.userId || getCurrentUserId(),
          name: displayName,
          displayName,
          avatar: avatarUrl,
          avatarUrl,
        });
      }
    } catch (error) {
      console.warn("Failed to fetch current user profile:", error);
      // Fallback with minimal info from token if possible
      const fallbackId = getCurrentUserId();
      if (fallbackId) {
        setCurrentUser((prev) => prev || { id: fallbackId, userId: fallbackId, name: "User", avatar: "" });
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuth || isAuthenticated()) {
      fetchCurrentUser();
    } else {
      setCurrentUser(null);
      setLoading(false);
    }
  }, [isAuth, userId, fetchCurrentUser]);

  return (
    <UserContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        loading,
        refreshUser: fetchCurrentUser,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};

export default UserContext;
