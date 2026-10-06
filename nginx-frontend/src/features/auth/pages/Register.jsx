import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getToken } from "../../../storage/localStorageService";
import { register } from "../../../features/auth/services/authenticationService";
import RegisterForm from "../components/RegisterForm";

export default function Register() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const [snackBarOpen, setSnackBarOpen] = useState(false);
  const [snackBarMessage, setSnackBarMessage] = useState("");
  const [snackBarSeverity, setSnackBarSeverity] = useState("success");

  useEffect(() => {
    const accessToken = getToken();
    if (accessToken) {
      navigate("/");
    }
  }, [navigate]);

  const handleCloseSnackBar = (event, reason) => {
    if (reason === "clickaway") return;
    setSnackBarOpen(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      // Chỉ gửi các trường cần thiết, các thông tin khác sẽ bổ sung ở Onboarding
      const response = await register(username, password, "", "", "", email, "");
      if (response.status === 201 || response.status === 200) {
        setSnackBarMessage("Registration successful");
        setSnackBarSeverity("success");
        setSnackBarOpen(true);

        setTimeout(() => {
          navigate("/verify-email-sent", { state: { email } });
        }, 1000);
      } else {
        setSnackBarMessage("Registration failed");
        setSnackBarSeverity("error");
        setSnackBarOpen(true);
      }
    } catch (error) {
      const errorResponse = error?.response?.data;
      setSnackBarMessage(errorResponse?.message || "Registration failed");
      setSnackBarSeverity("error");
      setSnackBarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <RegisterForm
      username={username}
      setUsername={setUsername}
      password={password}
      setPassword={setPassword}
      email={email}
      setEmail={setEmail}
      snackBarOpen={snackBarOpen}
      snackBarMessage={snackBarMessage}
      snackBarSeverity={snackBarSeverity}
      handleCloseSnackBar={handleCloseSnackBar}
      handleSubmit={handleSubmit}
      loading={loading}
    />
  );
}