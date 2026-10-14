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
    Popover,
} from "@mui/material";
import { getFriendsSuggestion, sendBatchFriendRequests } from "../../../friends/services/friendService";
import { getAvatarUrl } from "../../../../utils/avatarUtils";

export default function StepSuggestedFriends({ onSkip, onNext, onGetNextHandler }) {
    const [suggestions, setSuggestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedIds, setSelectedIds] = useState(new Set());
    const [error, setError] = useState(null);
    const [anchorEl, setAnchorEl] = useState(null);
    const [hoveredUser, setHoveredUser] = useState(null);
    const popoverCloseTimeout = useRef(null);
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

    const handleCardMouseEnter = (event, user) => {
        if (popoverCloseTimeout.current) {
            clearTimeout(popoverCloseTimeout.current);
            popoverCloseTimeout.current = null;
        }
        setAnchorEl(event.currentTarget);
        setHoveredUser(user);
    };

    const handleCardMouseLeave = () => {
        popoverCloseTimeout.current = setTimeout(() => {
            setAnchorEl(null);
            setHoveredUser(null);
        }, 200);
    };

    const handlePopoverMouseEnter = () => {
        if (popoverCloseTimeout.current) {
            clearTimeout(popoverCloseTimeout.current);
            popoverCloseTimeout.current = null;
        }
    };

    const handlePopoverMouseLeave = () => {
        popoverCloseTimeout.current = setTimeout(() => {
            setAnchorEl(null);
            setHoveredUser(null);
        }, 200);
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
                    <Box
                        sx={{
                            display: "grid",
                            gridTemplateColumns: "repeat(2, 1fr)",
                            gap: 1.5,
                            pr: 1.5,
                            pl: 0.5,
                            py: 0.5,
                        }}
                    >
                        {[1, 2, 3, 4].map((item) => (
                            <Card
                                key={item}
                                sx={{
                                    borderRadius: "12px",
                                    border: "1px solid",
                                    borderColor: "divider",
                                }}
                            >
                                <CardContent sx={{ textAlign: "center", p: 2, "&:last-child": { pb: 2 } }}>
                                    <Skeleton variant="circular" width={56} height={56} sx={{ mx: "auto", mb: 1.5 }} />
                                    <Skeleton variant="text" width="80%" sx={{ mx: "auto", mb: 0.5 }} />
                                    <Skeleton variant="text" width="60%" sx={{ mx: "auto", mb: 1.5 }} />
                                    <Skeleton variant="rounded" height={32} sx={{ borderRadius: "8px" }} />
                                </CardContent>
                            </Card>
                        ))}
                    </Box>
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

                <Box
                    sx={{
                        maxHeight: "400px",
                        overflowY: "auto",
                        overflowX: "hidden",
                        pr: 1.5,
                        pl: 0.5,
                        py: 0.5,
                        "&::-webkit-scrollbar": {
                            width: "6px",
                        },
                        "&::-webkit-scrollbar-track": {
                            background: (theme) =>
                                theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.05)" : "#f1f1f1",
                            borderRadius: "4px",
                        },
                        "&::-webkit-scrollbar-thumb": {
                            background: (theme) =>
                                theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.2)" : "#c1c1c1",
                            borderRadius: "4px",
                            "&:hover": {
                                background: (theme) =>
                                    theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.35)" : "#a8a8a8",
                            },
                        },
                    }}
                >
                    <Box
                        sx={{
                            display: "grid",
                            gridTemplateColumns: "repeat(2, 1fr)",
                            gap: 1.5,
                        }}
                    >
                        {suggestions.map((user, index) => (
                            <Card
                                key={user.userId || user.id || index}
                                variant="outlined"
                                onMouseEnter={(e) => handleCardMouseEnter(e, user)}
                                onMouseLeave={handleCardMouseLeave}
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
                        ))}
                    </Box>
                    <Popover
                        open={Boolean(anchorEl)}
                        anchorEl={anchorEl}
                        onClose={() => { setAnchorEl(null); setHoveredUser(null); }}
                        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                        transformOrigin={{ vertical: 'top', horizontal: 'center' }}
                        PaperProps={{
                            sx: { p: 2, pointerEvents: 'auto' },
                            onMouseEnter: handlePopoverMouseEnter,
                            onMouseLeave: handlePopoverMouseLeave,
                        }}
                    >
                        {hoveredUser && (
                            <>
                                <Avatar
                                    src={getAvatarUrl(hoveredUser.avatarUrl, hoveredUser.gender) || undefined}
                                    sx={{
                                        width: 80,
                                        height: 80,
                                        mb: 1.5,
                                        mx: 'auto',
                                        border: 2,
                                        borderColor: 'divider',
                                    }}
                                >
                                    {!hoveredUser.avatarUrl && !hoveredUser.gender && (hoveredUser.fullName?.[0]?.toUpperCase() || '?')}
                                </Avatar>
                                <Typography variant="subtitle1" fontWeight={600} sx={{ textAlign: 'center', mb: 0.5 }}>
                                    {hoveredUser.fullName || 'Unknown'}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mb: 1 }}>
                                    {hoveredUser.mutualFriendsCount ? `${hoveredUser.mutualFriendsCount} bạn chung` : 'Gợi ý cho bạn'}
                                </Typography>
                                <Button
                                    variant={selectedIds.has(hoveredUser.id) ? "outlined" : "contained"}
                                    size="small"
                                    fullWidth
                                    onClick={(e) => { e.stopPropagation(); handleToggleFriend(hoveredUser.id); }}
                                    sx={{ textTransform: 'none' }}
                                >
                                    {selectedIds.has(hoveredUser.id) ? 'Request sent' : 'Add Friend'}
                                </Button>
                            </>
                        )}
                    </Popover>
                </Box>
            </Box>
        </Fade>
    );
}