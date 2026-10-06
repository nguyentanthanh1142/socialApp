import React, { useState, useRef, useEffect } from "react";
import {
    Box,
    Button,
    Typography,
    Avatar,
    Fade,
    Grid,
    Card,
    CardContent,
    Skeleton,
} from "@mui/material";
import { getFriendsSuggestion, sendBatchFriendRequests } from "../../../friends/services/friendService";
import { getAvatarUrl } from "../../../../utils/avatarUtils";

export default function StepSuggestedFriends({ onSkip, onNext, onGetNextHandler }) {
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
                            <Grid item xs={6} sm={6} key={item}>
                                <Card sx={{ borderRadius: 3 }}>
                                    <CardContent sx={{ textAlign: "center" }}>
                                        <Skeleton variant="circular" width={56} height={56} sx={{ mx: "auto", mb: 1 }} />
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
            <Box sx={{ mt: 1 }}>
                <Typography variant="body2" color="text.secondary" mb={2}>
                    Friend suggestions ({suggestions.length})
                </Typography>

                {/* Container hỗ trợ cuộn với thanh scroll tinh chỉnh gọn gàng */}
                <Box
                    sx={{
                        maxHeight: "360px",
                        overflowY: "auto",
                        px: 0.5, // Padding 2 bên cân bằng
                        py: 0.5,
                        mr: -0.5, // Tạo khoảng trống sát lề cho thanh cuộn
                        "&::-webkit-scrollbar": {
                            width: "5px",
                        },
                        "&::-webkit-scrollbar-track": {
                            background: "transparent",
                        },
                        "&::-webkit-scrollbar-thumb": {
                            background: "rgba(0, 0, 0, 0.15)",
                            borderRadius: "10px",
                            "&:hover": {
                                background: "rgba(0, 0, 0, 0.3)",
                            },
                        },
                    }}
                >
                    <Grid container spacing={1.5}>
                        {suggestions.map((user, index) => (
                            <Grid item xs={6} key={user.userId || user.id || index}>
                                <Card
                                    variant="outlined"
                                    sx={{
                                        height: "100%",
                                        display: "flex",
                                        flexDirection: "column",
                                        justifyContent: "space-between",
                                        bgcolor: "background.paper",
                                        borderColor: "divider",
                                        borderRadius: "12px",
                                        transition: "all 0.2s ease",
                                        "&:hover": {
                                            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                                            borderColor: "primary.light",
                                        },
                                    }}
                                >
                                    <CardContent sx={{ textAlign: "center", p: 2, "&:last-child": { pb: 2 } }}>
                                        <Avatar
                                            src={getAvatarUrl(user.avatarUrl, user.gender) || undefined}
                                            sx={{
                                                width: 56,
                                                height: 56,
                                                mx: "auto",
                                                mb: 1.5,
                                                bgcolor: "primary.main",
                                                fontSize: "1.2rem",
                                            }}
                                        >
                                            {!user.avatarUrl && !user.gender && (user.fullName?.[0]?.toUpperCase() || "?")}
                                        </Avatar>
                                        <Typography
                                            variant="body2"
                                            fontWeight={600}
                                            fontSize="0.9rem"
                                            noWrap
                                            sx={{
                                                mb: 0.5,
                                                overflow: "hidden",
                                                textOverflow: "ellipsis",
                                            }}
                                        >
                                            {user.fullName || "Unknown"}
                                        </Typography>
                                        <Typography
                                            variant="caption"
                                            fontSize="0.75rem"
                                            color="text.secondary"
                                            sx={{ display: "block", mb: 1.5 }}
                                        >
                                            Suggested for you
                                        </Typography>
                                        <Button
                                            variant={selectedIds.has(user.id) ? "outlined" : "contained"}
                                            size="small"
                                            fullWidth
                                            onClick={() => handleToggleFriend(user.id)}
                                            sx={{
                                                textTransform: "none",
                                                borderRadius: "8px",
                                                fontWeight: 600,
                                                fontSize: "0.8rem",
                                                boxShadow: "none",
                                            }}
                                        >
                                            {selectedIds.has(user.id) ? "Request sent" : "Add Friend"}
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