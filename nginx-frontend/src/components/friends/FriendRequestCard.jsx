import { Card, CardMedia, Typography, Box } from "@mui/material";
import FriendActionButton from "./FriendActionButton";

export default function FriendRequestCard({ req, onConfirm, onDelete }) {
  const isFriends = req.status === "FRIENDS";

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
      }}
    >
      <CardMedia
        component="img"
        image={req.avatar}
        alt={req.conversationName}
        sx={{
          width: "100%",
          height: { xs: 130, sm: 150 },
          borderRadius: 2.5,
          objectFit: "cover",
        }}
      />
      <Box sx={{ mt: 1.5, px: 0.5 }}>
        <Typography fontWeight={700} fontSize={16} noWrap>
          {req.conversationName}
        </Typography>

        {req.mutualFriends && (
          <Typography variant="body2" sx={{ color: "text.secondary", fontSize: 13 }}>
            {req.mutualFriends} mutual friend
            {req.mutualFriends > 1 ? "s" : ""}
          </Typography>
        )}

        {req.followed && (
          <Typography variant="body2" sx={{ color: "text.secondary", fontSize: 13 }}>
            Followed by {req.followed}
          </Typography>
        )}

        {isFriends ? (
          <FriendActionButton
            label="Đã là bạn bè"
            disabled
            sx={{
              mt: 1.5,
              bgcolor: "#e4e6eb !important",
              color: "#050505 !important",
              fontWeight: 600,
              textTransform: "none",
            }}
          />
        ) : (
          <>
            <FriendActionButton
              label="Confirm"
              sx={{ mt: 1.5 }}
              onClick={() => onConfirm(req)}
            />
            <FriendActionButton
              label="Delete"
              variant="outlined"
              sx={{
                mt: 1,
                borderColor: "#ced0d4",
                color: "#050505",
                fontWeight: 600,
                textTransform: "none",
                "&:hover": {
                  bgcolor: "#f0f2f5",
                  borderColor: "#bbb",
                },
              }}
              onClick={() => onDelete(req.id)}
            />
          </>
        )}
      </Box>
    </Card>
  );
}