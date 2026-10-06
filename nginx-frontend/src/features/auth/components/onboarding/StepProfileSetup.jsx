import React, { useRef } from "react";
import {
    Box,
    Typography,
    Avatar,
    Tooltip,
    CircularProgress,
    TextField,
    Fade,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import { getAvatarUrl } from "../../../../utils/avatarUtils";

export default function StepProfileSetup({ values, onChange, errors, onAvatarUpload, uploadingAvatar }) {
    const fileInputRef = useRef(null);

    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileSelect = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        if (!file.type.match("image.*")) {
            alert("Please select a valid image file.");
            return;
        }

        try {
            const formData = new FormData();
            formData.append("file", file);
            await onAvatarUpload(formData);
        } catch (error) {
            console.error("Error uploading avatar:", error);
            alert("Failed to upload image. Please try again.");
        }
    };

    return (
        <Fade in>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
                <Typography variant="body2" color="text.secondary" mb={1}>
                    Let's personalise your experience. Fill in your details to get started.
                </Typography>

                {/* Avatar upload */}
                <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
                    <Tooltip title="Click to change avatar">
                        <Box sx={{ position: "relative" }}>
                            <Avatar
                                src={getAvatarUrl(values.avatarUrl, values.gender) || undefined}
                                sx={{
                                    width: 100,
                                    height: 100,
                                    fontSize: 40,
                                    bgcolor: "primary.main",
                                    cursor: "pointer",
                                    "&:hover": { opacity: 0.9 },
                                }}
                                onClick={handleAvatarClick}
                            >
                                {!values.avatarUrl && !values.gender && ((values.firstName?.[0] || values.lastName?.[0])?.toUpperCase() || "?")}
                            </Avatar>

                            <Box
                                onClick={handleAvatarClick}
                                sx={{
                                    position: "absolute",
                                    bottom: 0,
                                    right: 0,
                                    backgroundColor: "#f0f2f5",
                                    borderRadius: "50%",
                                    p: 1,
                                    boxShadow: 1,
                                    cursor: "pointer",
                                    "&:hover": { backgroundColor: "#e4e6eb" },
                                }}
                            >
                                <PhotoCameraIcon sx={{ color: "#333", fontSize: 20 }} />
                            </Box>

                            {uploadingAvatar && (
                                <Box
                                    sx={{
                                        position: "absolute",
                                        inset: 0,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        borderRadius: "50%",
                                        backgroundColor: "rgba(0, 0, 0, 0.4)",
                                    }}
                                >
                                    <CircularProgress size={36} sx={{ color: "white" }} />
                                </Box>
                            )}
                        </Box>
                    </Tooltip>

                    <input
                        type="file"
                        accept="image/*"
                        ref={fileInputRef}
                        style={{ display: "none" }}
                        onChange={handleFileSelect}
                    />
                </Box>

                <Box sx={{ display: "flex", gap: 2 }}>
                    <TextField
                        id="onboarding-firstname"
                        label="First Name"
                        fullWidth
                        value={values.firstName}
                        onChange={(e) => onChange("firstName", e.target.value)}
                        error={Boolean(errors.firstName)}
                        helperText={errors.firstName}
                        autoFocus
                        inputProps={{ maxLength: 50 }}
                    />
                    <TextField
                        id="onboarding-lastname"
                        label="Last Name"
                        fullWidth
                        value={values.lastName}
                        onChange={(e) => onChange("lastName", e.target.value)}
                        error={Boolean(errors.lastName)}
                        helperText={errors.lastName}
                        inputProps={{ maxLength: 50 }}
                    />
                </Box>
                <TextField
                    id="onboarding-phone"
                    label="Phone Number (optional)"
                    fullWidth
                    value={values.phoneNumber}
                    onChange={(e) => onChange("phoneNumber", e.target.value)}
                    error={Boolean(errors.phoneNumber)}
                    helperText={errors.phoneNumber}
                    inputProps={{ maxLength: 20 }}
                    placeholder="e.g. 0912 345 678"
                />
                <TextField
                    id="onboarding-bio"
                    label="Bio (optional)"
                    fullWidth
                    multiline
                    rows={2}
                    value={values.bio}
                    onChange={(e) => onChange("bio", e.target.value)}
                    helperText="Tell us about yourself"
                    inputProps={{ maxLength: 500 }}
                />
                <Box sx={{ display: "flex", gap: 2 }}>
                    <TextField
                        id="onboarding-city"
                        label="Current City (optional)"
                        fullWidth
                        value={values.currentCity}
                        onChange={(e) => onChange("currentCity", e.target.value)}
                        inputProps={{ maxLength: 100 }}
                    />
                    <TextField
                        id="onboarding-hometown"
                        label="Hometown (optional)"
                        fullWidth
                        value={values.hometown}
                        onChange={(e) => onChange("hometown", e.target.value)}
                        inputProps={{ maxLength: 100 }}
                    />
                </Box>
                <TextField
                    id="onboarding-country"
                    label="Country (optional)"
                    fullWidth
                    value={values.country}
                    onChange={(e) => onChange("country", e.target.value)}
                    inputProps={{ maxLength: 100 }}
                />
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                        label="Birthday (optional)"
                        value={values.birthday}
                        onChange={(newValue) => onChange("birthday", newValue)}
                        slotProps={{ textField: { fullWidth: true, size: "small" } }}
                    />
                </LocalizationProvider>
            </Box>
        </Fade>
    );
}