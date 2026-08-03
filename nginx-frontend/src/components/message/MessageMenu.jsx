import React, { useState, useEffect, useRef } from "react";
import {
    Box,
    Menu,
    MenuItem,
    CircularProgress,
    Avatar,
    Typography,
    Alert,
    Button,
} from "@mui/material";
import { getMyNotifications } from "../../services/notificationService";

export default function MessageMenu({anchorEl, open, onClose}){
    const [notifications, setNotifications] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [loading, setLoading] = useState(true);
    const [hasMore, setHasMore] = useState(false);
    const observer = useRef();
    const [error, setError] = useState(null);
    const lastElementRef = useRef(null);

    const fetchNotifications = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await getMyNotifications(page);
            const nextNotifications = response?.data?.result?.data || [];
            setTotalPages(response?.data?.result?.totalPages || 0);
            setNotifications((prevNotifications) => [...prevNotifications, ...nextNotifications]);
            setHasMore(nextNotifications.length > 0);
        } catch (error) {
            console.error(error);
            setError("Unable to load notifications right now.");
            if (page === 1) {
                setNotifications([]);
            }
            setHasMore(false);
        } finally {
            setLoading(false);
        }
    };

    // const handleNotifications = () => {
    //     console.log("New post content:", newPostContent);
    //     handleCloseDialog();

    //     createPost(newPostContent)
    //         .then((response) => {
    //             console.log("Post created successfully:", response.data);
    //             setPosts((prevPosts) => [response.data.result, ...prevPosts]);
    //             setNewPostContent("");
    //             setSnackbarMessage("Post created successfully!");
    //             setSnackbarSeverity("success");
    //             setSnackbarOpen(true);
    //         })
    //         .catch((error) => {
    //             console.error("Error creating post:", error);
    //             setSnackbarMessage("Failed to create post. Please try again.");
    //             setSnackbarSeverity("error");
    //             setSnackbarOpen(true);
    //         });
    // };

    useEffect(() => {
        // loadPosts(page);
        fetchNotifications(page);
    }, [page]);


    useEffect(() => {
        if (!hasMore) return;

        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                if (page < totalPages) {
                    setPage((prevPage) => prevPage + 1);
                }
            }
        });
        if (lastElementRef.current) {
            observer.current.observe(lastElementRef.current);
        }

        setHasMore(false);
    }, [hasMore]);

    const formatTime = (isoString) => {
        const date = new Date(isoString);
        const diff = (Date.now() - date.getTime()) / 1000;
        if (diff < 60) return "vừa xong";
        if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
        if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
        return date.toLocaleString("vi-VN");
    };
        return (
        <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={onClose}
            PaperProps={{
                elevation: 4,
                sx: {
                    mt: 1.5,
                    minWidth: 340,
                    maxHeight: 450,
                    overflowY: "auto",
                    "&::-webkit-scrollbar": { width: "6px" },
                    "&::-webkit-scrollbar-thumb": {
                        backgroundColor: "#ccc",
                        borderRadius: "3px",
                    },
                },
            }}
            anchorOrigin={{
                vertical: "bottom",
                horizontal: "right",
            }}
            transformOrigin={{
                vertical: "top",
                horizontal: "right",
            }}
        >
            <Box sx={{ px: 2, py: 1.5 }}>
                <Typography variant="subtitle1" fontWeight="bold">
                    Thông báo
                </Typography>
            </Box>

            {error && !loading && (
                <Box sx={{ px: 2, pb: 1 }}>
                    <Alert
                        severity="warning"
                        action={
                            <Button color="inherit" size="small" onClick={fetchNotifications}>
                                Retry
                            </Button>
                        }
                    >
                        {error}
                    </Alert>
                </Box>
            )}

            {notifications.length === 0 && !loading && !error && (
                <MenuItem disabled>Không có thông báo nào</MenuItem>
            )}

            {notifications.map((noti, index) => (
                <MenuItem
                    key={noti.id}
                    ref={index === notifications.length - 1 ? lastElementRef : null}
                    onClick={() => {
                        onClose();
                        window.location.href = `/post/${noti.entity?.id}`;
                    }}
                    sx={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 1,
                        py: 1,
                        whiteSpace: "normal",
                        "&:hover": { backgroundColor: "rgba(0,0,0,0.05)" },
                    }}
                >
                    <Avatar
                        src={noti.actor?.avatarUrl || ""}
                        alt={noti.actor?.name || "user"}
                        sx={{ width: 36, height: 36 }}
                    />
                    <Box>
                        <Typography fontSize={14}>
                            <strong>{noti.actor?.name}</strong>{" "}
                            {noti.type === "LIKE" && (
                                <>
                                    đã thích bài viết:{" "}
                                    <i>"{noti.entity?.contentPreview}"</i>
                                </>
                            )}
                            {noti.type === "COMMENT" && (
                                <>
                                    đã bình luận về bài viết:{" "}
                                    <i>"{noti.entity?.contentPreview}"</i>
                                </>
                            )}
                        </Typography>
                        <Typography fontSize={12} color="gray">
                            {formatTime(noti.createdAt)}
                        </Typography>
                    </Box>
                </MenuItem>
            ))}

            {loading && (
                <Box sx={{ textAlign: "center", py: 1 }}>
                    <CircularProgress size={20} />
                </Box>
            )}

            <Box
                sx={{
                    textAlign: "center",
                    py: 1,
                    borderTop: "1px solid #eee",
                    cursor: "pointer",
                    "&:hover": { backgroundColor: "rgba(0,0,0,0.04)" },
                }}
                onClick={() => {
                    onClose();
                    window.location.href = "/notifications";
                }}
            >
                Xem tất cả thông báo
            </Box>
        </Menu>
    );
}
