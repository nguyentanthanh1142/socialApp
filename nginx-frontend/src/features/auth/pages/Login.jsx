import React, { useContext, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  isFirstLoginFromStorage,
  isAuthenticated as checkIsAuthenticated,
} from "../services/authenticationService";
import { OAuthConfig } from "../../../configurations/configuration";
import { useSocket } from "../../../providers/SocketProvider";
import { AuthContext } from "../../../context/AuthContext";
import LoginForm from "../components/LoginForm";

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { reconnect } = useSocket();
  const { login, isAuthenticated: isAuth, isFirstLogin } = useContext(AuthContext);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [snackBarOpen, setSnackBarOpen] = useState(false);
  const [snackBarMessage, setSnackBarMessage] = useState("");
  const [severity, setSeverity] = useState("error");

  const handleCloseSnackBar = (event, reason) => {
    if (reason === "clickaway") return;
    setSnackBarOpen(false);
  };

  const handleGoogleLogin = () => {
    const callbackUrl = OAuthConfig.redirectUri;
    const authUrl = OAuthConfig.authUri;
    const googleClientId = OAuthConfig.clientId;

    const targetUrl = `${authUrl}?redirect_uri=${encodeURIComponent(
      callbackUrl
    )}&response_type=code&client_id=${googleClientId}&scope=openid%20email%20profile`;

    window.location.href = targetUrl;
  };

  useEffect(() => {
    if (isAuth || checkIsAuthenticated()) {
      navigate(isFirstLogin || isFirstLoginFromStorage() ? "/onboarding" : "/", {
        replace: true,
      });
    }
  }, [isAuth, isFirstLogin, navigate]);

  useEffect(() => {
    const status = searchParams.get("status");

    if (status === "success") {
      setSnackBarMessage("Account verification successful! Please log in.");
      setSeverity("success");
      setSnackBarOpen(true);
      navigate("/login", { replace: true });
    } else if (status === "error") {
      setSnackBarMessage("Account verification failed or the link has expired.");
      setSeverity("error");
      setSnackBarOpen(true);
      navigate("/login", { replace: true });
    }
  }, [searchParams, navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!username.trim() || !password.trim()) {
      setSnackBarMessage("Username and password cannot be empty.");
      setSeverity("error");
      setSnackBarOpen(true);
      return;
    }

    setLoading(true);

    try {
      if (typeof login === "function") {
        await login(username, password);
      }
      if (typeof reconnect === "function") {
        reconnect();
      }
      navigate(isFirstLoginFromStorage() ? "/onboarding" : "/", { replace: true });
    } catch (error) {
      const errorResponse = error.response?.data || {
        message: "Login failed. Please check your network connection.",
      };

      if (errorResponse.code === 1012) {
        const email = errorResponse.email || username;
        setSnackBarMessage("Your account email has not been verified yet.");
        setSeverity("warning");
        setSnackBarOpen(true);
        setTimeout(() => {
          navigate("/verify-email-sent", { state: { email } });
        }, 1500);
      } else {
        setSnackBarMessage(errorResponse.message || "Invalid username or password.");
        setSeverity("error");
        setSnackBarOpen(true);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <LoginForm
      username={username}
      setUsername={setUsername}
      password={password}
      setPassword={setPassword}
      loading={loading}
      snackBarOpen={snackBarOpen}
      snackBarMessage={snackBarMessage}
      severity={severity}
      handleCloseSnackBar={handleCloseSnackBar}
      handleSubmit={handleSubmit}
      handleGoogleLogin={handleGoogleLogin}
    />
  );
}