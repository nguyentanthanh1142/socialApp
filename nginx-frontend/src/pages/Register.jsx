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
} from "@mui/material";

import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { getToken, setToken } from "../services/localStorageService";
import { register } from "../services/authenticationService";

export default function Register() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [city, setCity] = useState("");
  const [firstname, setFirstName] = useState("");
  const [lastname, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [birthday, setBirthDay] = useState("");
  const [snackBarOpen, setSnackBarOpen] = useState(false);
  const [snackBarMessage, setSnackBarMessage] = useState("");
  const [snackBarSeverity, setSnackBarSeverity] = useState("");

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
    try {
      const response = await register(username, password, firstname, lastname, city, email,birthday);
          if (response.status === 201 || response.status === 200) {
              setSnackBarMessage("Đăng ký thành công");
              setSnackBarSeverity("success");
              setSnackBarOpen(true);

              // Ví dụ: redirect sang trang login sau 1 giây
              setTimeout(() => {
                navigate("/login");
              }, 1000);
    } else {
      setSnackBarMessage("Đăng ký không thành công");
      setSnackBarSeverity("error");
      setSnackBarOpen(true);
    }
    } catch (error) {
      const errorResponse = error?.response?.data;
      setSnackBarMessage(errorResponse?.message || "Đăng ký thất bại");
      setSnackBarSeverity("error");
      setSnackBarOpen(true);
    }
  };

 
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
          severity={snackBarSeverity}
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
            minWidth: 400,
            maxWidth: 500,
            boxShadow: 4,
            borderRadius: 4,
            padding: 4,
          }}
        >
          <CardContent>
            <Typography variant="h5" component="h1" textAlign="center" gutterBottom>
              Create your account
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
              />
              <TextField
                label="Password"
                type="password"
                variant="outlined"
                fullWidth
                margin="normal"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <TextField
                label="email"
                type="email"
                variant="outlined"
                fullWidth
                margin="normal"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
                              <Box display="flex" gap={2} width="100%">
                  <TextField
                    label="First Name"
                    type="text"
                    variant="outlined"
                    fullWidth
                    value={firstname}
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                  <TextField
                    label="Last Name"
                    type="text"
                    variant="outlined"
                    fullWidth
                    value={lastname}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                  <TextField
  label="Birth Date"
  type="date"
  value={birthday}
  onChange={(e) => setBirthDay(e.target.value)}
  InputLabelProps={{
    shrink: true,
  }}
  fullWidth
/>
                </Box>
            
              <TextField
                label="Address"
                type="text"
                variant="outlined"
                fullWidth
                margin="normal"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
              <Button
                type="submit"
                variant="contained"
                color="primary"
                size="large"
                onClick={handleSubmit}
                fullWidth
                sx={{
                  mt: "15px",
                  mb: "25px",
                }}
              >
                Craete an account
              </Button>
              <Divider></Divider>
            </Box>

            <Box display="flex" flexDirection="column" width="100%" gap="25px">
              <Button
                type="submit"
                variant="contained"
                color="secondary"
                size="large"
                fullWidth
                component={Link} to="/login"
                sx={{ gap: "10px" }}
              >
                                Login
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </>
  );
}
