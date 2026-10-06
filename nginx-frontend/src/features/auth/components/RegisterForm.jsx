import React from "react";
import {
  Box,
  Button,
  Card,
  CssBaseline,
  Divider,
  TextField,
  Typography,
  Snackbar,
  Alert,
} from "@mui/material";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function RegisterForm({
  username,
  setUsername,
  password,
  setPassword,
  email,
  setEmail,
  snackBarOpen,
  snackBarMessage,
  snackBarSeverity,
  handleCloseSnackBar,
  handleSubmit,
  loading = false,
}) {
  return (
    <>
      <CssBaseline />

      <Snackbar
        open={snackBarOpen}
        onClose={handleCloseSnackBar}
        autoHideDuration={6000}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseSnackBar}
          severity={snackBarSeverity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snackBarMessage}
        </Alert>
      </Snackbar>

      <Box
        component="main"
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "#f8fafc",
          p: { xs: 2, md: 4 },
        }}
      >
        {/* Hiệu ứng mượt mà khi load trang Đăng ký */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          style={{ width: "100%", maxWidth: 960, display: "flex", justifyContent: "center" }}
        >
          <Card
            sx={{
              width: "100%",
              display: "flex",
              flexDirection: { xs: "column", md: "row-reverse" }, // Đổi thứ tự: Cột trái sang phải
              boxShadow: "0px 15px 35px rgba(0, 0, 0, 0.08)",
              borderRadius: 4,
              overflow: "hidden",
            }}
          >
            {/* CỘT PHẢI (BANNER): Tông màu Teal / Emerald hoàn toàn mới */}
            <Box
              component={motion.div}
              initial={{ x: -30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              sx={{
                flex: 1,
                background: "linear-gradient(135deg, #0d9488 0%, #0f766e 100%)", // Tông xanh Teal/Emerald
                color: "white",
                p: { xs: 4, md: 6 },
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: { xs: "center", md: "flex-start" },
                textAlign: { xs: "center", md: "left" },
              }}
            >
              <Typography
                variant="h3"
                component="div"
                fontWeight="800"
                sx={{ mb: 1, letterSpacing: -1 }}
              >
                SocialApp
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.9, fontWeight: 400, mb: 2 }}>
                Start your journey!
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.7, maxWidth: 360 }}>
                Create your account in seconds and set up your personal profile in the next step.
              </Typography>
            </Box>

            {/* CỘT TRÁI (FORM): Đăng ký */}
            <Box
              component={motion.div}
              initial={{ x: 30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              sx={{
                flex: 1,
                p: { xs: 3, sm: 5 },
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                bgcolor: "#ffffff",
              }}
            >
              <Typography
                variant="h5"
                component="h1"
                fontWeight="700"
                sx={{ mb: 1, color: "#0f172a" }}
              >
                Create an Account
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Enter your details below to register.
              </Typography>

              <Box
                component="form"
                id="register-form"
                display="flex"
                flexDirection="column"
                width="100%"
                onSubmit={handleSubmit}
              >
                <TextField
                  id="register-username"
                  label="Username"
                  variant="outlined"
                  fullWidth
                  margin="normal"
                  size="small"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={loading}
                  autoComplete="username"
                  required
                />

                <TextField
                  id="register-email"
                  label="Email Address"
                  type="email"
                  variant="outlined"
                  fullWidth
                  margin="normal"
                  size="small"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  autoComplete="email"
                  required
                />

                <TextField
                  id="register-password"
                  label="Password"
                  type="password"
                  variant="outlined"
                  fullWidth
                  margin="normal"
                  size="small"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  autoComplete="new-password"
                  required
                />

                <Button
                  id="register-submit-btn"
                  type="submit"
                  variant="contained"
                  size="large"
                  fullWidth
                  disabled={loading}
                  sx={{
                    mt: 3,
                    mb: 2,
                    py: 1.2,
                    borderRadius: 2,
                    textTransform: "none",
                    fontSize: "0.95rem",
                    fontWeight: 600,
                    bgcolor: "#0d9488", // Nút màu Teal
                    "&:hover": {
                      bgcolor: "#0f766e",
                    },
                    boxShadow: "0 4px 12px rgba(13, 148, 136, 0.25)",
                  }}
                >
                  Sign Up
                </Button>

                <Divider sx={{ my: 1.5, color: "text.secondary", fontSize: "0.85rem" }} />

                <Box sx={{ textAlign: "center", mt: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Already have an account?{" "}
                    <Typography
                      component={Link}
                      to="/login"
                      variant="body2"
                      sx={{
                        fontWeight: 600,
                        color: "#0d9488",
                        textDecoration: "none",
                        "&:hover": { textDecoration: "underline" },
                      }}
                    >
                      Log In
                    </Typography>
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Card>
        </motion.div>
      </Box>
    </>
  );
}