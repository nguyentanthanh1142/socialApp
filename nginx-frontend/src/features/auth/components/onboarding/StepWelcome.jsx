import React from "react";
import { Box, Typography, Fade } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

export default function StepWelcome({ firstName }) {
    return (
        <Fade in>
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, py: 3 }}>
                <CheckCircleIcon sx={{ fontSize: 72, color: "success.main" }} />
                <Typography variant="h5" fontWeight={700} textAlign="center">
                    You're all set, {firstName || "friend"}! 🎉
                </Typography>
                <Typography variant="body1" color="text.secondary" textAlign="center" maxWidth={360}>
                    Your profile has been created. Click <strong>Go to Feed</strong> below to start
                    connecting with people.
                </Typography>
            </Box>
        </Fade>
    );
}