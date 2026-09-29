import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
  Snackbar,
  Alert,
  CircularProgress,
} from "@mui/material";
import { useState } from "react";
import { adminLogIn } from "../../services/admin/adminAuthService";

export default function AdminLogin() {

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "error" });

  const handleCloseSnackBar = (event, reason) => {
    if (reason === "clickaway") return;
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!username.trim() || !password.trim()) {
      setSnackbar({
        open: true,
        message: "Please enter both username and password.",
        severity: "error",
      });
      return;
    }

    setLoading(true);

    try {
      await adminLogIn({ username, password });
      
      window.location.href = "/admin/dashboard";
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Invalid credentials or insufficient permissions.";
      setSnackbar({
        open: true,
        message: errorMsg,
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };


  return (
    <>
      <Snackbar
        open={snackbar.open}
        onClose={handleCloseSnackBar}
        autoHideDuration={6000}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >

        <Alert
          onClose={handleCloseSnackBar}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        height="100vh"
        bgcolor="#1e1e2f"
      >

        <Card
          sx={{
            minWidth: 320,
            maxWidth: 400,
            boxShadow: 4,
            borderRadius: 3,
            padding: 4,
          }}
        >

          <CardContent>
            <Typography variant="h5" component="h1" textAlign="center" gutterBottom fontWeight="bold" color="primary">
              Admin Portal
            </Typography>

            <Box
              component="form"
              display="flex"
              flexDirection="column"
              alignItems="center"
              justifyContent="center"
              width="100%"
              onSubmit={handleSubmit}
              noValidate
            >

              <TextField
                label="Admin Username"
                variant="outlined"
                fullWidth
                margin="normal"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={loading}
                autoComplete="username"
                required
              />

              <TextField
                label="Password"
                type="password"
                variant="outlined"
                fullWidth
                margin="normal"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                autoComplete="current-password"
                required
              />

              <Button
                type="submit"
                variant="contained"
                color="primary"
                size="large"
                fullWidth
                disabled={loading}
                sx={{ mt: 3, mb: 1, py: 1.2 }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : "Login to Dashboard"}
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </>
  );

}