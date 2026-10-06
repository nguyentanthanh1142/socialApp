import React from "react";
import {
  Box,
  Typography,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
  Badge,
  CircularProgress,
  Alert,
  Stack,
  Avatar,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RefreshIcon from "@mui/icons-material/Refresh";
import NewChatPopover from "./NewChatPopover";
import { getAvatarUrl } from "../../../utils/avatarUtils";
import { formatLocaleDate } from "../../../utils/dateUtils";
import EmptyState from "../../../components/EmptyState";
import ChatBubbleOutlineOutlinedIcon from "@mui/icons-material/ChatBubbleOutlineOutlined";

export default function ConversationList({
  conversations,
  selectedConversation,
  onSelectConversation,
  loading,
  error,
  onRefresh,
  newChatAnchorEl,
  onNewChatClick,
  onCloseNewChat,
  onSelectNewChatUser,
}) {
  return (
    <Box
      sx={{
        width: 300,
        borderRight: 1,
        borderColor: "divider",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box
        sx={{
          p: 2,
          borderBottom: 1,
          borderColor: "divider",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h6">Chats</Typography>
        <IconButton
          color="primary"
          size="small"
          onClick={onNewChatClick}
          sx={{
            bgcolor: "primary.light",
            color: "white",
            "&:hover": { bgcolor: "primary.main" },
          }}
        >
          <AddIcon fontSize="small" />
        </IconButton>
        <NewChatPopover
          anchorEl={newChatAnchorEl}
          open={Boolean(newChatAnchorEl)}
          onClose={onCloseNewChat}
          onSelectUser={onSelectNewChatUser}
        />
      </Box>

      <Box sx={{ flexGrow: 1, overflowY: "auto" }}>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
            <CircularProgress size={28} />
          </Box>
        ) : error ? (
          <Box sx={{ p: 2 }}>
            <Alert
              severity="error"
              sx={{ mb: 2 }}
              action={
                <IconButton color="inherit" size="small" onClick={onRefresh}>
                  <RefreshIcon fontSize="small" />
                </IconButton>
              }
            >
              {error}
            </Alert>
          </Box>
        ) : !conversations || conversations.length === 0 ? (
          <EmptyState
            icon={ChatBubbleOutlineOutlinedIcon}
            title="No conversations yet"
            description="Pick someone to message or start a new chat from the button above."
            primaryLabel="New chat"
            primaryOnClick={onNewChatClick}
          />
        ) : (
          <List sx={{ width: "100%" }}>
            {conversations.map((conversation) => (
              <React.Fragment key={conversation.id}>
                <ListItem
                  alignItems="flex-start"
                  onClick={() => onSelectConversation(conversation)}
                  sx={{
                    cursor: "pointer",
                    bgcolor:
                      selectedConversation?.id === conversation.id
                        ? "rgba(0, 0, 0, 0.04)"
                        : "transparent",
                    "&:hover": { bgcolor: "rgba(0, 0, 0, 0.08)" },
                  }}
                >
                  <ListItemAvatar>
                    <Badge
                      color="error"
                      badgeContent={conversation.unread}
                      invisible={conversation.unread === 0}
                      overlap="circular"
                    >
                      <Avatar src={getAvatarUrl(conversation.conversationAvatar, conversation.gender)} />
                    </Badge>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Stack
                        direction="row"
                        display={"flex"}
                        justifyContent="space-between"
                        alignItems="center"
                      >
                        <Typography
                          component="span"
                          variant="body2"
                          color="text.primary"
                          noWrap
                          sx={{ display: "inline" }}
                        >
                          {conversation.conversationName}
                        </Typography>
                        <Typography
                          component="span"
                          variant="body2"
                          color="text.secondary"
                          sx={{ display: "inline", fontSize: "0.7rem" }}
                        >
                          {formatLocaleDate(
                            conversation.modifiedDate,
                            {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            },
                            ""
                          ) || "—"}
                        </Typography>
                      </Stack>
                    }
                    secondary={
                      <Typography
                        sx={{ display: "inline" }}
                        component="span"
                        variant="body2"
                        color="text.primary"
                        noWrap
                      >
                        {conversation.lastMessage || "Start a conversation"}
                      </Typography>
                    }
                    primaryTypographyProps={{
                      fontWeight:
                        conversation.unread > 0 ? "bold" : "normal",
                    }}
                    sx={{
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      pr: 1,
                    }}
                  />
                </ListItem>
                <Divider variant="inset" component="li" />
              </React.Fragment>
            ))}
          </List>
        )}
      </Box>
    </Box>
  );
}