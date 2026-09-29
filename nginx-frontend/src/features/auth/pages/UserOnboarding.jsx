// src/features/auth/pages/UserOnboarding.jsx
import React, { useState, useContext, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Step,
  StepLabel,
  Stepper,
  TextField,
  Typography,
  Alert,
  CircularProgress,
  Avatar,
  Paper,
  ToggleButton,
  ToggleButtonGroup,
  Fade,
  LinearProgress,
  Divider,
  Grid,
  Card,
  CardContent,
  Skeleton,
  Tooltip,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import LightModeIcon    from "@mui/icons-material/LightMode";
import DarkModeIcon     from "@mui/icons-material/DarkMode";
import CheckCircleIcon  from "@mui/icons-material/CheckCircle";
import PersonIcon       from "@mui/icons-material/Person";
import PeopleIcon       from "@mui/icons-material/People";
import PaletteIcon      from "@mui/icons-material/Palette";
import CelebrationIcon  from "@mui/icons-material/Celebration";
import PhotoCameraIcon  from "@mui/icons-material/PhotoCamera";
import dayjs from "dayjs";

import { AuthContext }          from "../../../context/AuthContext";
import { useColorMode }         from "../../../context/ColorModeContext";
import { completeOnboarding, saveProfileOnboarding } from "../services/onboardingService";
import { getFriendsSuggestion, sendBatchFriendRequests } from "../../../features/friends/services/friendService";
import { uploadAvatar } from "../../../features/profile/services/userService";
import usePageTitle from "../../../hooks/usePageTitle";

// ────────────────────────────────────────────────────────────────────────────
const STEPS = [
  { label: "Profile Setup",       icon: <PersonIcon /> },
  { label: "Suggested Friends",  icon: <PeopleIcon /> },
  { label: "Theme Preference",   icon: <PaletteIcon /> },
  { label: "Welcome!",           icon: <CelebrationIcon /> },
];

// ────────────────────────────────────────────────────────────────────────────
function StepProfileSetup({ values, onChange, errors, onAvatarUpload, uploadingAvatar }) {
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
                src={values.avatarUrl || undefined}
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
                {!values.avatarUrl && ((values.firstName?.[0] || values.lastName?.[0])?.toUpperCase() || "?")}
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

// ────────────────────────────────────────────────────────────────────────────
function StepSuggestedFriends({ onSkip, onNext, onGetNextHandler }) {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [error, setError] = useState(null);
  const abortRef = useRef(null);

  useEffect(() => {
    const fetchSuggestions = async () => {
      abortRef.current = new AbortController();
      setLoading(true);
      setError(null);
      try {
        const response = await getFriendsSuggestion();
        const data = response.data?.result || [];
        setSuggestions(Array.isArray(data) ? data.slice(0, 8) : []);
      } catch (err) {
        if (err.name !== "CanceledError" && err.name !== "AbortError") {
          console.error("Failed to fetch friend suggestions:", err);
          setError("Failed to load suggestions");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchSuggestions();
    return () => abortRef.current?.abort();
  }, []);

  const handleToggleFriend = (userId) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) {
        next.delete(userId);
      } else {
        next.add(userId);
      }
      return next;
    });
  };

  const handleNext = async () => {
    if (selectedIds.size > 0) {
      try {
        await sendBatchFriendRequests(Array.from(selectedIds));
      } catch (err) {
        console.error("Failed to send friend requests:", err);
      }
    }
    onNext();
  };

  // Expose handleNext to parent via callback
  useEffect(() => {
    if (onGetNextHandler) {
      onGetNextHandler(handleNext);
    }
  }, [selectedIds, onGetNextHandler]);

  if (loading) {
    return (
      <Fade in>
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" color="text.secondary" mb={2}>
            Finding people you may know...
          </Typography>
          <Grid container spacing={2}>
            {[1, 2, 3, 4].map((item) => (
              <Grid item xs={6} sm={4} key={item}>
                <Card sx={{ borderRadius: 2 }}>
                  <CardContent sx={{ textAlign: "center" }}>
                    <Skeleton variant="circular" width={60} height={60} sx={{ mx: "auto", mb: 1 }} />
                    <Skeleton variant="text" width="80%" sx={{ mx: "auto" }} />
                    <Skeleton variant="text" width="60%" sx={{ mx: "auto" }} />
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Fade>
    );
  }

  if (error || suggestions.length === 0) {
    return (
      <Fade in>
        <Box sx={{ textAlign: "center", py: 4 }}>
          <Typography variant="body1" color="text.secondary" mb={2}>
            {error || "No suggestions available right now"}
          </Typography>
          <Button variant="outlined" onClick={onSkip}>
            Skip
          </Button>
        </Box>
      </Fade>
    );
  }

  return (
    <Fade in>
      <Box sx={{ mt: 2 }}>
        <Typography variant="body2" color="text.secondary" mb={2}>
          Friend suggestions ({suggestions.length})
        </Typography>
        <Box
          sx={{
            maxHeight: '420px',
            overflowY: 'auto',
            paddingRight: '12px',
            paddingBottom: '8px',
            '&::-webkit-scrollbar': {
              width: '6px',
            },
            '&::-webkit-scrollbar-track': {
              background: '#f1f1f1',
              borderRadius: '3px',
            },
            '&::-webkit-scrollbar-thumb': {
              background: '#c1c1c1',
              borderRadius: '3px',
              '&:hover': {
                background: '#a8a8a8',
              },
            },
          }}
        >
          <Grid container spacing={2}>
            {suggestions.map((user, index) => (
              <Grid item xs={6} key={user.userId || user.id || index}>
                <Card
                  sx={{
                    bgcolor: 'background.paper',
                    border: '1px solid #eaeeef',
                    borderRadius: '12px',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                    },
                  }}
                >
                  <CardContent sx={{ textAlign: 'center', p: 2 }}>
                    <Avatar
                      src={user.avatarUrl || undefined}
                      sx={{
                        width: 56,
                        height: 56,
                        mx: 'auto',
                        mb: 1.5,
                        bgcolor: 'primary.main',
                        fontSize: '1.2rem',
                      }}
                    >
                      {!user.avatarUrl && (user.fullName?.[0]?.toUpperCase() || '?')}
                    </Avatar>
                    <Typography
                      variant="body2"
                      fontWeight={600}
                      fontSize="0.95rem"
                      noWrap
                      sx={{
                        mb: 0.5,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {user.fullName || 'Unknown'}
                    </Typography>
                    <Typography
                      variant="caption"
                      fontSize="0.8rem"
                      color="text.secondary"
                      sx={{ display: 'block', mb: 1.5 }}
                    >
                      Suggested for you
                    </Typography>
                    <Button
                      variant={selectedIds.has(user.id) ? 'outlined' : 'contained'}
                      size="small"
                      fullWidth
                      onClick={() => handleToggleFriend(user.id)}
                      sx={{
                        textTransform: 'none',
                        borderRadius: '8px',
                        fontWeight: 600,
                        fontSize: '0.85rem',
                      }}
                    >
                      {selectedIds.has(user.id) ? 'Request sent' : 'Add Friend'}
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Box>
    </Fade>
  );
}

// ────────────────────────────────────────────────────────────────────────────
function StepThemePreference({ selectedTheme, onSelect }) {
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
              color:   selectedTheme === "dark" ? "#e4e6eb"  : "text.primary",
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

// ────────────────────────────────────────────────────────────────────────────
function StepWelcome({ firstName }) {
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

// ────────────────────────────────────────────────────────────────────────────
export default function UserOnboarding() {
  usePageTitle("Complete Profile");

  const navigate           = useNavigate();
  const { completeOnboardingFlag } = useContext(AuthContext);
  const { mode, setMode }  = useColorMode();

  const [activeStep, setActiveStep] = useState(0);
  const [loading,    setLoading]    = useState(false);
  const [apiError,   setApiError]   = useState(null);

  // Form values
  const [values, setValues] = useState({
    firstName:    "",
    lastName:     "",
    phoneNumber:  "",
    avatarUrl:    "",
    bio:          "",
    currentCity:  "",
    hometown:     "",
    country:      "",
    birthday:     null,
  });
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [errors, setErrors] = useState({});
  const [preferredTheme, setPreferredTheme] = useState(mode); // synced with live theme

  // AbortController ref — prevents setState on unmounted component
  const abortRef = useRef(null);
  useEffect(() => () => abortRef.current?.abort(), []);

  // Ref to store StepSuggestedFriends handleNext handler
  const friendsStepNextHandlerRef = useRef(null);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleChange = (field, value) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleThemeSelect = (newTheme) => {
    setPreferredTheme(newTheme);
    // Live preview — updates the whole app's theme immediately
    setMode(newTheme);
  };

  // Step 1 validation
  const validateStep1 = () => {
    const next = {};
    if (!values.firstName.trim())
      next.firstName = "First name is required.";
    else if (values.firstName.trim().length < 2)
      next.firstName = "First name must be at least 2 characters.";
    if (!values.lastName.trim())
      next.lastName = "Last name is required.";
    else if (values.lastName.trim().length < 2)
      next.lastName = "Last name must be at least 2 characters.";
    if (values.phoneNumber && !/^[\d\s\+\-\(\)]{7,20}$/.test(values.phoneNumber))
      next.phoneNumber = "Please enter a valid phone number.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleNext = async () => {
    if (activeStep === 0 && !validateStep1()) return;
    
    // Step 1 -> Step 2: Save profile data incrementally
    if (activeStep === 0) {
      setLoading(true);
      setApiError(null);
      abortRef.current = new AbortController();
      try {
        await saveProfileOnboarding(
          {
            firstName: values.firstName.trim(),
            lastName: values.lastName.trim(),
            phoneNumber: values.phoneNumber.trim(),
            avatarUrl: values.avatarUrl.trim(),
            bio: values.bio.trim(),
            currentCity: values.currentCity.trim(),
            hometown: values.hometown.trim(),
            country: values.country.trim(),
            birthday: values.birthday ? values.birthday.format("YYYY-MM-DD") : null,
          },
          abortRef.current.signal
        );
      } catch (err) {
        if (err.name === "CanceledError" || err.name === "AbortError") return;
        const msg =
          err?.response?.data?.message ||
          "Failed to save profile. Please try again.";
        setApiError(msg);
        setLoading(false);
        return;
      } finally {
        setLoading(false);
      }
    }
    
    setActiveStep((s) => s + 1);
  };

  const handleBack = () => setActiveStep((s) => s - 1);

  // Final submission on step 2 (Theme) -> moves to step 3 (Welcome) after API call
  const handleSubmit = async () => {
    setLoading(true);
    setApiError(null);

    abortRef.current = new AbortController();

    try {
      await completeOnboarding(
        {
          firstName: values.firstName.trim(),
          lastName: values.lastName.trim(),
          phoneNumber: values.phoneNumber.trim(),
          avatarUrl: values.avatarUrl.trim(),
          bio: values.bio.trim(),
          currentCity: values.currentCity.trim(),
          hometown: values.hometown.trim(),
          country: values.country.trim(),
          birthday: values.birthday ? values.birthday.format("YYYY-MM-DD") : null,
          preferredTheme,
        },
        abortRef.current.signal
      );

      // Update in-memory auth state so ProtectedRoute stops redirecting here
      completeOnboardingFlag();

      // Advance to the welcome/completion step
      setActiveStep(3);
    } catch (err) {
      if (err.name === "CanceledError" || err.name === "AbortError") return;
      const msg =
        err?.response?.data?.message ||
        "Something went wrong. Please try again.";
      setApiError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoToFeed = () => navigate("/", { replace: true });

  const handleAvatarUpload = async (formData) => {
    setUploadingAvatar(true);
    try {
      const response = await uploadAvatar(formData);
      const imageUrl = response.data?.result?.avatar || response.data?.result;
      setValues((prev) => ({ ...prev, avatarUrl: imageUrl }));
    } finally {
      setUploadingAvatar(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "background.default",
        px: 2,
        py: 4,
      }}
    >
      <Paper
        elevation={4}
        sx={{
          width: "100%",
          maxWidth: 520,
          borderRadius: 4,
          overflow: "hidden",
        }}
      >
        {/* Progress bar at the top */}
        <LinearProgress
          variant="determinate"
          value={((activeStep + 1) / STEPS.length) * 100}
          sx={{ height: 4 }}
        />

        <Box sx={{ p: { xs: 3, sm: 5 } }}>
          {/* Header */}
          <Typography variant="h5" fontWeight={700} mb={0.5}>
            Welcome to Social App 👋
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={3}>
            Let's set up your profile in just a few steps.
          </Typography>

          {/* MUI Stepper */}
          <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
            {STEPS.map((step) => (
              <Step key={step.label}>
                <StepLabel>{step.label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          <Divider sx={{ mb: 3 }} />

          {/* Step content */}
          {activeStep === 0 && (
            <StepProfileSetup
              values={values}
              onChange={handleChange}
              errors={errors}
              onAvatarUpload={handleAvatarUpload}
              uploadingAvatar={uploadingAvatar}
            />
          )}
          {activeStep === 1 && (
            <StepSuggestedFriends
              onSkip={() => setActiveStep(2)}
              onNext={() => setActiveStep(2)}
              onGetNextHandler={(handler) => {
                friendsStepNextHandlerRef.current = handler;
              }}
            />
          )}
          {activeStep === 2 && (
            <StepThemePreference
              selectedTheme={preferredTheme}
              onSelect={handleThemeSelect}
            />
          )}
          {activeStep === 3 && <StepWelcome firstName={values.firstName} />}

          {/* API error banner */}
          {apiError && (
            <Alert severity="error" sx={{ mt: 2 }} onClose={() => setApiError(null)}>
              {apiError}
            </Alert>
          )}

          {/* Navigation buttons */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: '24px',
            }}
          >
            {/* Left Group: Back and Skip buttons */}
            <Box sx={{ display: 'flex', gap: '12px' }}>
              {activeStep > 0 && activeStep < 3 && (
                <Button variant="outlined" onClick={handleBack} disabled={loading}>
                  Back
                </Button>
              )}
              {activeStep === 1 && (
                <Button variant="text" onClick={() => setActiveStep(2)}>
                  Skip
                </Button>
              )}
            </Box>

            {/* Right Group: Next / Submit / Go to Feed */}
            {activeStep === 0 && (
              <Button
                id="onboarding-next-step1"
                variant="contained"
                onClick={handleNext}
                disabled={loading}
                size="large"
                sx={{ minWidth: 120 }}
              >
                {loading ? <CircularProgress size={22} color="inherit" /> : 'Next'}
              </Button>
            )}

            {activeStep === 1 && (
              <Button
                variant="contained"
                onClick={() => friendsStepNextHandlerRef.current?.()}
                disabled={loading}
                size="large"
                sx={{ minWidth: 120 }}
              >
                Next
              </Button>
            )}

            {activeStep === 2 && (
              <Button
                id="onboarding-submit"
                variant="contained"
                onClick={handleSubmit}
                disabled={loading}
                size="large"
                sx={{ minWidth: 140 }}
              >
                {loading ? (
                  <CircularProgress size={22} color="inherit" />
                ) : (
                  'Complete Setup'
                )}
              </Button>
            )}

            {activeStep === 3 && (
              <Button
                id="onboarding-go-feed"
                variant="contained"
                color="success"
                onClick={handleGoToFeed}
                size="large"
                fullWidth
              >
                Go to Feed 🚀
              </Button>
            )}
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}
