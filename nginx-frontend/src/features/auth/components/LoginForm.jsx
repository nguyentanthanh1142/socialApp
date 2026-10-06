import React from "react";
import PropTypes from "prop-types";
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
    CircularProgress,
} from "@mui/material";
import GoogleIcon from "@mui/icons-material/Google";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function LoginForm({
    username,
    setUsername,
    password,
    setPassword,
    loading,
    snackBarOpen,
    snackBarMessage,
    severity,
    handleCloseSnackBar,
    handleSubmit,
    handleGoogleLogin,
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
                    severity={severity}
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
                            flexDirection: { xs: "column", md: "row" },
                            boxShadow: "0px 15px 35px rgba(0, 0, 0, 0.08)",
                            borderRadius: 4,
                            overflow: "hidden",
                        }}
                    >
                        {/* Banner bên trái - Màu Blue Primary */}
                        <Box
                            component={motion.div}
                            initial={{ x: 30, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                            sx={{
                                flex: 1,
                                background: "linear-gradient(135deg, #1976d2 0%, #115293 100%)",
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
                                Connect with friends and the world around you.
                            </Typography>
                            <Typography variant="body2" sx={{ opacity: 0.7, maxWidth: 360 }}>
                                Share moments, chat in real-time, and stay updated with your community.
                            </Typography>
                        </Box>

                        {/* Form bên phải */}
                        <Box
                            component={motion.div}
                            initial={{ x: -30, opacity: 0 }}
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
                                Welcome Back
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                                Please enter your details to sign in.
                            </Typography>

                            <Box
                                component="form"
                                id="login-form"
                                display="flex"
                                flexDirection="column"
                                width="100%"
                                onSubmit={handleSubmit}
                            >
                                <TextField
                                    id="login-username"
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
                                    id="login-password"
                                    label="Password"
                                    type="password"
                                    variant="outlined"
                                    fullWidth
                                    margin="normal"
                                    size="small"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    disabled={loading}
                                    autoComplete="current-password"
                                    required
                                />

                                <Button
                                    id="login-submit-btn"
                                    type="submit"
                                    variant="contained"
                                    size="large"
                                    fullWidth
                                    disabled={loading}
                                    sx={{
                                        mt: 2.5,
                                        mb: 2,
                                        py: 1.2,
                                        borderRadius: 2,
                                        textTransform: "none",
                                        fontSize: "0.95rem",
                                        fontWeight: 600,
                                        boxShadow: "0 4px 12px rgba(25, 118, 210, 0.25)",
                                    }}
                                >
                                    {loading ? <CircularProgress size={24} color="inherit" /> : "Log In"}
                                </Button>

                                <Divider sx={{ my: 1.5, color: "text.secondary", fontSize: "0.85rem" }}>
                                    OR
                                </Divider>

                                <Button
                                    id="login-google-btn"
                                    type="button"
                                    variant="outlined"
                                    size="large"
                                    onClick={handleGoogleLogin}
                                    fullWidth
                                    disabled={loading}
                                    startIcon={<GoogleIcon sx={{ color: "#4285F4" }} />}
                                    sx={{
                                        mt: 1,
                                        mb: 3,
                                        py: 1,
                                        borderRadius: 2,
                                        textTransform: "none",
                                        borderColor: "#cbd5e1",
                                        color: "#334155",
                                        fontWeight: 500,
                                        backgroundColor: "#ffffff",
                                        "&:hover": {
                                            backgroundColor: "#f8fafc",
                                            borderColor: "#94a3b8",
                                        },
                                    }}
                                >
                                    Continue with Google
                                </Button>

                                <Box sx={{ textAlign: "center" }}>
                                    <Typography variant="body2" color="text.secondary">
                                        Don't have an account?{" "}
                                        <Typography
                                            component={Link}
                                            to="/register"
                                            variant="body2"
                                            sx={{
                                                fontWeight: 600,
                                                color: "primary.main",
                                                textDecoration: "none",
                                                "&:hover": { textDecoration: "underline" },
                                            }}
                                        >
                                            Create an account
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

LoginForm.propTypes = {
    username: PropTypes.string.isRequired,
    setUsername: PropTypes.func.isRequired,
    password: PropTypes.string.isRequired,
    setPassword: PropTypes.func.isRequired,
    loading: PropTypes.bool.isRequired,
    snackBarOpen: PropTypes.bool.isRequired,
    snackBarMessage: PropTypes.string.isRequired,
    severity: PropTypes.string.isRequired,
    handleCloseSnackBar: PropTypes.func.isRequired,
    handleSubmit: PropTypes.func.isRequired,
    handleGoogleLogin: PropTypes.func.isRequired,
};