import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Alert, Box, Button, Snackbar } from "@mui/material";
import {
    getMyFriendsList,
    getFriendsSuggestion,
    getMyFriendRequest,
    acceptFriend,
    deleteFriendRequest,
    sendFriendsRequest,
} from "../services/friendService";
import { isAuthenticated } from "../services/authenticationService";
import Scene from "./Scene";
import FriendSideMenu from "../components/friends/FriendSideMenu";
import FriendsContent from "../components/friends/FriendsContent";

export default function Friends() {
    const [friendRequests, setFriendRequests] = useState([]);
    const [friendsList, setFriendsList] = useState([]);
    const [suggestions, setSuggestion] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadError, setLoadError] = useState(null);

    const navigate = useNavigate();
    
    // Gom nhóm Snackbar state để quản lý dễ hơn
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: "",
        severity: "success",
    });

    const showSnackbar = (message, severity = "success") => {
        setSnackbar({ open: true, message, severity });
    };

    const handleSnackbarClose = (event, reason) => {
        if (reason === "clickaway") return;
        setSnackbar((prev) => ({ ...prev, open: false }));
    };

    const loadFriendsData = useCallback(async () => {
        try {
            setLoading(true);
            setLoadError(null);

            const [friendsListRes, friendRequestsRes, suggestionsRes] = await Promise.allSettled([
                getMyFriendsList(),
                getMyFriendRequest(),
                getFriendsSuggestion(),
            ]);

            let hasError = false;

            if (friendsListRes.status === "fulfilled") {
                setFriendsList(friendsListRes.value?.data?.result || []);
            } else {
                setFriendsList([]);
                hasError = true;
            }

            if (friendRequestsRes.status === "fulfilled") {
                setFriendRequests(friendRequestsRes.value?.data?.result || []);
            } else {
                setFriendRequests([]);
                hasError = true;
            }

            if (suggestionsRes.status === "fulfilled") {
                setSuggestion(suggestionsRes.value?.data?.result || []);
            } else {
                setSuggestion([]);
                hasError = true;
            }

            if (hasError) {
                setLoadError("Some friend data could not be loaded. Please try again.");
            }
        } catch (err) {
            console.error("Failed to load friends data:", err);
            setFriendsList([]);
            setFriendRequests([]);
            setSuggestion([]);
            setLoadError("Unable to load friend data right now.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (!isAuthenticated()) {
            navigate("/login");
        } else {
            loadFriendsData();
        }
    }, [navigate, loadFriendsData]);

    // Xử lý chấp nhận lời mời kết bạn
    const handleConfirm = useCallback(async (request) => {
        const targetId = request.participantsHash || request.id;
        
        // Optimistic Update: Xóa ngay khỏi danh sách chờ để UI mượt mà
        setFriendRequests((prev) => prev.filter((item) => (item.participantsHash || item.id) !== targetId));

        try {
            await acceptFriend(targetId);
            showSnackbar("Friend request accepted!", "success");
            // Có thể gọi lại loadFriendsData() nếu muốn đồng bộ danh sách bạn bè chính thức ngay lập tức
        } catch (err) {
            console.error("Failed to accept friend request:", err);
            // Rollback state nếu lỗi API
            setFriendRequests((prev) => [request, ...prev]);
            showSnackbar("Failed to accept friend request.", "error");
        }
    }, []);

    // Xử lý gửi lời mời kết bạn từ danh sách gợi ý
    const handlePending = useCallback(async (id) => {
        const removedSuggestion = suggestions.find((item) => item.userId === id);
        setSuggestion((prev) => prev.filter((item) => item.userId !== id));

        try {
            await sendFriendsRequest(id);
            showSnackbar("Friend request sent!", "success");
        } catch (err) {
            console.error("Failed to send friend request:", err);
            if (removedSuggestion) {
                setSuggestion((prev) => [removedSuggestion, ...prev]);
            }
            showSnackbar("Failed to send friend request.", "error");
        }
    }, [suggestions]);

    // Xử lý từ chối / xóa lời mời kết bạn
    const handleDelete = useCallback(async (id) => {
        const targetId = id; // Dựa vào ID truyền từ component con
        const removedRequest = friendRequests.find((item) => (item.participantsHash || item.id) === targetId);
        
        setFriendRequests((prev) => prev.filter((item) => (item.participantsHash || item.id) !== targetId));

        try {
            await deleteFriendRequest(targetId);
            showSnackbar("Friend request deleted.", "success");
        } catch (err) {
            console.error("Failed to delete friend request:", err);
            if (removedRequest) {
                setFriendRequests((prev) => [removedRequest, ...prev]);
            }
            showSnackbar("Failed to delete friend request.", "error");
        }
    }, [friendRequests]);

    return (
        <Scene sideMenu={<FriendSideMenu />}>
            <Box
                sx={{
                    width: "100%",
                    maxWidth: 1280,
                    px: { xs: 2, sm: 3, md: 4 },
                    py: { xs: 2, sm: 3 },
                }}
            >
                <Snackbar
                    open={snackbar.open}
                    autoHideDuration={6000}
                    onClose={handleSnackbarClose}
                    anchorOrigin={{ vertical: "top", horizontal: "right" }}
                    sx={{ mt: 8 }}
                >
                    <Alert
                        onClose={handleSnackbarClose}
                        severity={snackbar.severity}
                        sx={{ width: "100%" }}
                    >
                        {snackbar.message}
                    </Alert>
                </Snackbar>

                {loadError ? (
                    <Alert
                        severity="warning"
                        sx={{ mb: 3, borderRadius: 2 }}
                        action={
                            <Button color="inherit" size="small" onClick={loadFriendsData}>
                                Retry
                            </Button>
                        }
                    >
                        {loadError}
                    </Alert>
                ) : null}

                <FriendsContent
                    loading={loading}
                    friends={friendRequests}
                    suggestions={suggestions}
                    onConfirm={handleConfirm}
                    onDelete={handleDelete}
                    onPending={handlePending}
                />
            </Box>
        </Scene>
    );
}