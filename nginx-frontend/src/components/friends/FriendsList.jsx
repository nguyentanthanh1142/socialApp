import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Alert, Box, Button, CircularProgress, Grid } from "@mui/material";
import { getMyFriendsList } from "../../services/friendService";
import { isAuthenticated } from "../../services/authenticationService";
import FriendRequestCard from "./FriendRequestCard";

function FriendsList() {
    const [friends, setFriends] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const loadFriends = async () => {
        try {
            setLoading(true);
            setError(null);
            const res = await getMyFriendsList();
            setFriends(res?.data?.result || []);
        } catch (err) {
            console.error(err);
            setFriends([]);
            setError("Unable to load friends right now.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!isAuthenticated()) {
            navigate("/login");
            return;
        }

        loadFriends();
    }, [navigate]);

    return (
        <Box>
            {loading ? (
                <CircularProgress />
            ) : error ? (
                <Alert
                    severity="warning"
                    action={
                        <Button color="inherit" size="small" onClick={loadFriends}>
                            Retry
                        </Button>
                    }
                >
                    {error}
                </Alert>
            ) : (
                <Grid container spacing={2}>
                    {friends.map((friend) => (
                        <Grid item xs={12} sm={6} md={3} key={friend.id}>
                            <FriendRequestCard req={friend} />
                        </Grid>
                    ))}
                </Grid>
            )}
        </Box>
    );
}

export default FriendsList;