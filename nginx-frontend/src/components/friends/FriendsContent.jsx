import React from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Button,
} from "@mui/material";
import FriendRequestCard from "./FriendRequestCard";
import SuggestionCard from "./SuggestionCard";


function FriendsContent({ loading, friends, suggestions, onConfirm, onDelete, onPending }) {
  return (
    <Box sx={{ maxWidth: 1280, mx: "auto" }}>
      <Box sx={{ mb: { xs: 4, md: 6 } }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2.5,
          }}
        >
          <Typography variant="h5" fontWeight={700} sx={{ letterSpacing: -0.2 }}>
            Friend Requests
          </Typography>
          <Button
            size="small"
            sx={{
              textTransform: "none",
              fontWeight: 600,
              color: "#1877f2",
              minWidth: "unset",
              px: 1,
            }}
          >
            See all
          </Button>
        </Box>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
            <CircularProgress />
          </Box>
        ) : friends.length === 0 ? (
          <Typography sx={{ color: "text.secondary", textAlign: "center", mt: 2 }}>
            No friend requests
          </Typography>
        ) : (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(2, minmax(0, 1fr))",
                md: "repeat(3, minmax(0, 1fr))",
                lg: "repeat(4, minmax(0, 1fr))",
              },
              gap: 2,
            }}
          >
            {friends.map((req) => (
              <Box key={req.id}>
                <FriendRequestCard
                  req={{
                    ...req,
                    avatar: req.avatar || req.avatar,
                    status: req.status || "PENDING",
                  }}
                  onConfirm={onConfirm}
                  onDelete={onDelete}
                />
              </Box>
            ))}
          </Box>
        )}
      </Box>
      <Box>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2.5,
          }}
        >
          <Typography variant="h5" fontWeight={700} sx={{ letterSpacing: -0.2 }}>
            People you may know
          </Typography>
          <Button
            size="small"
            sx={{
              textTransform: "none",
              fontWeight: 600,
              color: "#1877f2",
              minWidth: "unset",
              px: 1,
            }}
          >
            See all
          </Button>
        </Box>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
            <CircularProgress />
          </Box>
        ) : suggestions.length === 0 ? (
          <Typography sx={{ color: "text.secondary", textAlign: "center", mt: 2 }}>
            No suggestions
          </Typography>
        ) : (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "repeat(2, minmax(0, 1fr))",
                sm: "repeat(3, minmax(0, 1fr))",
                md: "repeat(4, minmax(0, 1fr))",
                lg: "repeat(5, minmax(0, 1fr))",
              },
              gap: 2,
            }}
          >
            {suggestions.map((req) => (
              <Box key={req.id}>
                <SuggestionCard req={req} onPending={onPending} />
              </Box>
            ))}
          </Box>
        )}
      </Box>
    </Box>
  );
}
export default FriendsContent;