import React from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Button,
} from "@mui/material";
import { Link } from "react-router-dom";
import FriendRequestCard from "./FriendRequestCard";
import SuggestionCard from "./SuggestionCard";

function FriendsContent({
  loading,
  friends = [],
  suggestions = [],
  friendsList = [],
  activeTab = "overview",
  onConfirm,
  onDelete,
  onPending,
}) {
  const showRequests = activeTab === "overview" || activeTab === "requests";
  const showSuggestions = activeTab === "overview" || activeTab === "suggestions";
  const showAllFriends = activeTab === "all";

  const renderFriendRequests = () => (
    <Box sx={{ mb: { xs: 4, md: 5 } }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2.5,
        }}
      >
        <Typography variant="h5" fontWeight={700} sx={{ letterSpacing: -0.2 }}>
          Friend Requests ({friends.length})
        </Typography>
        {activeTab === "overview" && friends.length > 4 && (
          <Button
            component={Link}
            to="/friends?tab=requests"
            size="small"
            sx={{
              textTransform: "none",
              fontWeight: 600,
              color: "#1877f2",
              px: 1,
            }}
          >
            See all
          </Button>
        )}
      </Box>

      {friends.length === 0 ? (
        <Typography sx={{ color: "text.secondary", py: 2 }}>
          No friend requests right now.
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
          {(activeTab === "overview" ? friends.slice(0, 8) : friends).map((req) => (
            <Box key={req.id}>
              <FriendRequestCard
                req={{
                  ...req,
                  conversationName: req.conversationName || req.name || "User",
                  avatar: req.avatarUrl || req.avatar || "",
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
  );

  const renderSuggestions = () => (
    <Box sx={{ mb: { xs: 4, md: 5 } }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2.5,
        }}
      >
        <Typography variant="h5" fontWeight={700} sx={{ letterSpacing: -0.2 }}>
          People You May Know ({suggestions.length})
        </Typography>
        {activeTab === "overview" && suggestions.length > 5 && (
          <Button
            component={Link}
            to="/friends?tab=suggestions"
            size="small"
            sx={{
              textTransform: "none",
              fontWeight: 600,
              color: "#1877f2",
              px: 1,
            }}
          >
            See all
          </Button>
        )}
      </Box>

      {suggestions.length === 0 ? (
        <Typography sx={{ color: "text.secondary", py: 2 }}>
          No new suggestions right now.
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
          {(activeTab === "overview" ? suggestions.slice(0, 10) : suggestions).map((req) => (
            <Box key={req.id}>
              <SuggestionCard req={req} onPending={onPending} />
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );

  const renderAllFriends = () => (
    <Box sx={{ mb: { xs: 4, md: 5 } }}>
      <Box sx={{ mb: 2.5 }}>
        <Typography variant="h5" fontWeight={700} sx={{ letterSpacing: -0.2 }}>
          All Friends ({friendsList.length})
        </Typography>
      </Box>

      {friendsList.length === 0 ? (
        <Typography sx={{ color: "text.secondary", py: 2 }}>
          You have no friends in your list yet. Send friend requests from suggestions!
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
          {friendsList.map((friend) => (
            <Box key={friend.id}>
              <FriendRequestCard
                req={{
                  ...friend,
                  conversationName: friend.conversationName || friend.name || [friend.firstname, friend.lastname].filter(Boolean).join(" ") || "Friend",
                  avatar: friend.avatar || "",
                  status: "FRIENDS",
                }}
              />
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );

  return (
    <Box sx={{ maxWidth: 1280, mx: "auto" }}>
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {showRequests && renderFriendRequests()}
          {showSuggestions && renderSuggestions()}
          {showAllFriends && renderAllFriends()}
        </>
      )}
    </Box>
  );
}

export default FriendsContent;