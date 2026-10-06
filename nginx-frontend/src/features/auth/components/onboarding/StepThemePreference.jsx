import React from "react";
import {
    Box,
    Typography,
    ToggleButton,
    ToggleButtonGroup,
    Fade,
} from "@mui/material";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";

export default function StepThemePreference({ selectedTheme, onSelect }) {
    return (
        <Fade in>
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, mt: 2 }}>
                <Typography variant="body2" color="text.secondary" textAlign="center">
                    Pick a colour theme. You can always change it later from the header bar.
                </Typography>

                <ToggleButtonGroup
                    value={selectedTheme}
                    exclusive
                    onChange={(_, val) => { if (val) onSelect(val); }}
                    aria-label="theme preference"
                    sx={{ gap: 2 }}
                >
                    {/* Light option */}
                    <ToggleButton
                        value="light"
                        id="onboarding-theme-light"
                        aria-label="Light mode"
                        sx={{
                            flexDirection: "column",
                            gap: 1,
                            width: 130,
                            height: 120,
                            borderRadius: "12px !important",
                            border: "2px solid",
                            borderColor: selectedTheme === "light" ? "primary.main" : "divider",
                            bgcolor: selectedTheme === "light" ? "primary.light" : "background.paper",
                            transition: "all 0.2s ease",
                            "&:hover": { borderColor: "primary.main" },
                        }}
                    >
                        <LightModeIcon sx={{ fontSize: 36, color: "#f5a623" }} />
                        <Typography variant="body2" fontWeight={600}>Light</Typography>
                    </ToggleButton>

                    {/* Dark option */}
                    <ToggleButton
                        value="dark"
                        id="onboarding-theme-dark"
                        aria-label="Dark mode"
                        sx={{
                            flexDirection: "column",
                            gap: 1,
                            width: 130,
                            height: 120,
                            borderRadius: "12px !important",
                            border: "2px solid",
                            borderColor: selectedTheme === "dark" ? "primary.main" : "divider",
                            bgcolor: selectedTheme === "dark" ? "#2d2d2d" : "background.paper",
                            color: selectedTheme === "dark" ? "#e4e6eb" : "text.primary",
                            transition: "all 0.2s ease",
                            "&:hover": { borderColor: "primary.main" },
                        }}
                    >
                        <DarkModeIcon sx={{ fontSize: 36, color: "#7986cb" }} />
                        <Typography variant="body2" fontWeight={600}>Dark</Typography>
                    </ToggleButton>
                </ToggleButtonGroup>

                <Typography variant="caption" color="text.secondary">
                    Current preview updates as you select ↑
                </Typography>
            </Box>
        </Fade>
    );
}