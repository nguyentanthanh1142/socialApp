import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Navigate } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Stack,
  Container,
  Fade,
  Divider,
  Snackbar,
  Alert,
} from "@mui/material";
import {
  MarkEmailReadOutlined,
  Launch,
  ArrowBack,
} from "@mui/icons-material";
import { resendVerification } from "../services/authenticationService";

export default function VerifyEmailSent() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;
  const [countdown, setCountdown] = useState(0);
  const [snackBarOpen, setSnackBarOpen] = useState(false);
  const [snackBarMessage, setSnackBarMessage] = useState("");
  const [severity, setSeverity] = useState("error");

  useEffect(() => {
    let interval;
    if (countdown > 0) {
      interval = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [countdown]);

  const handleCloseSnackBar = (event, reason) => {
    if (reason === "clickaway") return;
    setSnackBarOpen(false);
  };

  const handleResendEmail = async () => {
    try {
      await resendVerification(email);
      setSnackBarMessage("Verification email resent successfully!");
      setSeverity("success");
      setSnackBarOpen(true);
      setCountdown(60);
    } catch (error) {
      if (error.response?.status === 429) {
        setSnackBarMessage("Too fast! Please wait 60 seconds.");
        setSeverity("error");
        setSnackBarOpen(true);
        setCountdown(60);
      } else {
        const errorMessage = error.response?.data?.message || "Failed to resend email";
        setSnackBarMessage(errorMessage);
        setSeverity("error");
        setSnackBarOpen(true);
      }
    }
  };

  const handleOpenGmail = () => {
    window.open("https://mail.google.com", "_blank");
  };

  if (!email) {
    return <Navigate to="/login" replace />;
  }

  return (
    <>
      <Snackbar
        open={snackBarOpen}
        onClose={handleCloseSnackBar}
        autoHideDuration={6000}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseSnackBar}
          severity={severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snackBarMessage}
        </Alert>
      </Snackbar>
      <Fade in timeout={500}>
        <Box
        minHeight="100vh"
        display="flex"
        alignItems="center"
        justifyContent="center"
        bgcolor="grey.100"
        p={2}
      >
        <Card
          maxWidth={440}
          width="100%"
          borderRadius={3}
          elevation={3}
          p={2}
          textAlign="center"
          sx={{
            maxWidth: 440,
            width: "100%",
            borderRadius: 3,
            p: 2,
            textAlign: "center",
          }}
        >
          <CardContent>
            <Box
              width={72}
              height={72}
              borderRadius="50%"
              bgcolor="primary.50"
              color="primary.main"
              display="flex"
              alignItems="center"
              justifyContent="center"
              mx="auto"
              mb={2}
            >
              <MarkEmailReadOutlined sx={{ fontSize: 40 }} />
            </Box>

            <Typography variant="h5" fontWeight={700} gutterBottom>
              Check your email
            </Typography>

            <Typography variant="body2" color="text.secondary" mb={3}>
              We sent a verification link to{" "}
              <Typography component="span" fontWeight={700}>
                {email}
              </Typography>
              . Please check your inbox and follow the instructions to verify your account.
            </Typography>

            <Divider sx={{ mb: 3 }} />

            <Stack spacing={2}>
              <Button
                variant="contained"
                size="large"
                fullWidth
                endIcon={<Launch />}
                onClick={handleOpenGmail}
              >
                Open Gmail
              </Button>

              <Button
                variant="outlined"
                size="large"
                fullWidth
                disabled={countdown > 0}
                onClick={handleResendEmail}
              >
                {countdown > 0
                  ? `Resend in (${countdown}s)`
                  : "Resend verification email"}
              </Button>

              <Button
                variant="text"
                color="inherit"
                startIcon={<ArrowBack />}
                onClick={() => navigate("/login")}
              >
                Back to login
              </Button>
            </Stack>
          </CardContent>
        </Card>
      </Box>
    </Fade>
    </>
  );
}
