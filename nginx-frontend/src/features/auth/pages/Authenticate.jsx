// src/features/auth/pages/Authenticate.jsx
import { useNavigate } from "react-router-dom";
import { useContext, useEffect, useState, useRef } from "react";
import { setToken } from "../../../storage/localStorageService";
import { Box, CircularProgress, Typography, Snackbar, Alert } from "@mui/material";
import { outbound } from "../services/authenticationService";
import { useSocket } from "../../../providers/SocketProvider";
import { AuthContext } from "../../../context/AuthContext";

export default function Authenticate() {
    const navigate = useNavigate();
    const { reconnect } = useSocket();
    const { refresh, verifySession } = useContext(AuthContext);
    const [snackBarMessage, setSnackBarMessage] = useState("");
    const [snackBarOpen, setSnackBarOpen] = useState(false);

    // 🟢 Khóa useRef ngăn React StrictMode gọi API trùng 2 lần làm cháy Auth Code
    const isProcessedRef = useRef(false);

    useEffect(() => {
        const handleAuthenticate = async () => {
            const authCodeRegex = /code=([^&]+)/;
            const isMatch = window.location.href.match(authCodeRegex);

            if (!isMatch) {
                navigate("/login", { replace: true });
                return;
            }

            // Nếu đã từng xử lý code này rồi thì dừng ngay (Chống lỗi 400 Bad Request)
            if (isProcessedRef.current) return;
            isProcessedRef.current = true;

            const authCode = isMatch[1];
            try {
                const response = await outbound(authCode);
                const result = response.data?.result || {};
                const token = result.token;

                // Lấy cờ firstLogin trực tiếp từ response API
                const isFirst = result.firstLogin ?? result.isFirstLogin ?? false;

                if (token) {
                    setToken(token);
                    if (typeof reconnect === "function") {
                        reconnect();
                    }
                }

                // 🟢 Gọi hàm xác minh phiên & load User Profile vào Context
                const syncSession = refresh || verifySession;
                if (typeof syncSession === "function") {
                    await syncSession();
                }

                // 🟢 Sau khi Context đã nạp đầy đủ User mới tiến hành Navigate
                if (isFirst) {
                    navigate("/onboarding", { replace: true });
                } else {
                    navigate("/", { replace: true });
                }

            } catch (error) {
                console.error("Authentication error:", error);
                const errorMsg =
                    error.response?.data?.message || "Authentication failed. Please try again.";
                setSnackBarMessage(errorMsg);
                setSnackBarOpen(true);
                setTimeout(() => navigate("/login", { replace: true }), 2000);
            }
        };

        handleAuthenticate();
    }, [navigate, reconnect, refresh, verifySession]);

    return (
        <>
            <Box
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "30px",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "100vh",
                }}
            >
                <CircularProgress />
                <Typography>Authenticating, please wait...</Typography>
            </Box>

            <Snackbar
                open={snackBarOpen}
                autoHideDuration={6000}
                onClose={() => setSnackBarOpen(false)}
                anchorOrigin={{ vertical: "top", horizontal: "right" }}
            >
                <Alert
                    onClose={() => setSnackBarOpen(false)}
                    severity="error"
                    sx={{ width: "100%" }}
                >
                    {snackBarMessage}
                </Alert>
            </Snackbar>
        </>
    );
}