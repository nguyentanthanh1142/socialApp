import { Card, CardMedia, Typography, Box, Button } from "@mui/material";

import FriendActionButton from "./FriendActionButton";

export default function SuggestionCard({ req, onPending }) {
  return (
    <Card
      sx={{
        p: 1.5,
        borderRadius: 3,
        border: "1px solid",
        borderColor: "#e5e7eb",
        bgcolor: "#fff",
        color: "text.primary",
        boxShadow: "0 1px 2px rgba(0, 0, 0, 0.06)",
        height: "100%", 
        display: "flex",
        flexDirection: "column",
        transition: "all 0.2s ease",
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: "0 8px 20px rgba(0, 0, 0, 0.1)",
        },
      }}>
      <CardMedia
        component="img"
        image={req.avatar}
        alt={req.username}
        sx={{
          width: "100%",
          height: { xs: 130, sm: 150 },
          borderRadius: 2.5,
          objectFit: "cover",
        }}
      />
      <Box sx={{ mt: 1.5, px: 0.5, display: "flex", flexDirection: "column", gap: 0.5 }}>
        <Typography fontWeight={700} fontSize={16} noWrap>
          {req.username}
        </Typography>

        {req.mutualFriends && (
          <Typography variant="body2" sx={{ color: "text.secondary", fontSize: 13 }}>
            {req.mutualFriends} mutual friend{req.mutualFriends > 1 ? "s" : ""}
          </Typography>
        )}
        <FriendActionButton
          label="Add Friend"
          sx={{ mt: 1.5 }}
          onClick={() => onPending(req.userId)}
        />
      </Box>
    </Card>
  );
}
