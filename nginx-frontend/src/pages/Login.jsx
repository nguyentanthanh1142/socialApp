import {
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  TextField,
  Typography,
  Snackbar,
  Alert,
  CircularProgress,
} from "@mui/material";

import GoogleIcon from "@mui/icons-material/Google";
import { useEffect, useState } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { logIn, register, isAuthenticated } from "../services/authenticationService";
import { OAuthConfig } from "../configurations/configuration";
import { useSocket } from "../components/hooks/useSocket"



export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { reconnect } = useSocket();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [snackBarOpen, setSnackBarOpen] = useState(false);
  const [snackBarMessage, setSnackBarMessage] = useState("");
  const [severity, setSeverity] = useState("error");

  const handleCloseSnackBar = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackBarOpen(false);
  };

  const handleClick = () => {
    console.log("OAuth config:", OAuthConfig);
    const callbackUrl = OAuthConfig.redirectUri;
    const authUrl = OAuthConfig.authUri;
    const googleClientId = OAuthConfig.clientId;

    const targetUrl = `${authUrl}?redirect_uri=${encodeURIComponent(
      callbackUrl
    )}&response_type=code&client_id=${googleClientId}&scope=openid%20email%20profile`;

    console.log(targetUrl);
    window.location.href = targetUrl;
  };

  useEffect(() => {
    if (isAuthenticated()) {
      navigate("/");
    }
  }, [navigate]);

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
      const response = await logIn(username, password);
      console.log("Response body:", response.data);
      reconnect();
      navigate("/");
    } catch (error) {
      const errorResponse = error.response?.data || {
        message: "Đăng nhập thất bại. Vui lòng kiểm tra lại kết nối."
      };
      setSnackBarMessage(errorResponse.message || "Tài khoản hoặc mật khẩu không chính xác.");
      setSeverity("error");
      setSnackBarOpen(true);
    }
    finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const status = searchParams.get("status");

    if (status === "success") {
      setSnackBarMessage("Xác thực tài khoản thành công! Mời bạn đăng nhập.");
      setSeverity("success");
      setSnackBarOpen(true);

      navigate("/login", { replace: true });
    } else if (status === "error") {
      setSnackBarMessage("Xác thực tài khoản thất bại hoặc link đã hết hạn.");
      setSeverity("error");
      setSnackBarOpen(true);

      navigate("/login", { replace: true });
    }
  }, [searchParams, navigate]);

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
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        height="100vh"
        bgcolor={"#f0f2f5"}
      >
        <Card
          sx={{
            minWidth: 300,
            maxWidth: 400,
            boxShadow: 3,
            borderRadius: 3,
            padding: 4,
          }}
        >
          <CardContent>
            <Typography variant="h5" component="h1" textAlign="center" gutterBottom>
              Login
            </Typography>
            <Box
              component="form"
              display="flex"
              flexDirection="column"
              alignItems="center"
              justifyContent="center"
              width="100%"
              onSubmit={handleSubmit}
            >
              <TextField
                label="Username"
                variant="outlined"
                fullWidth
                margin="normal"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={loading}
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
              />
              <Button
                type="submit"
                variant="contained"
                color="primary"
                size="large"
                fullWidth
                disabled={loading}
                sx={{
                  mt: "15px",
                  mb: "25px",
                }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : "Login"}
              </Button>
              <Divider></Divider>
            </Box>

            <Box display="flex" flexDirection="column" width="100%" gap="25px">
              <Button
                type="button"
                variant="contained"
                color="secondary"
                size="large"
                onClick={handleClick}
                fullWidth
                sx={{ gap: "10px" }}
              >
                <GoogleIcon />
                Continue with Google
              </Button>
              <Button
                type="button"
                variant="contained"
                color="success"
                size="large"
                component={Link} to="/register"
              >
                Create an account
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </>
  );
}