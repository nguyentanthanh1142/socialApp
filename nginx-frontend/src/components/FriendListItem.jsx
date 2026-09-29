import React from "react";
import { ListItem, ListItemButton, ListItemText, Avatar, Badge, styled } from "@mui/material";
import { useFriendPresence } from "../features/chat/hooks/useFriendPresence";

const StyledBadge = styled(Badge)(({ theme }) => ({
  "& .MuiBadge-badge": {
    backgroundColor: "#44b700",
    color: "#44b700",
    boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
    "&::after": {
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      borderRadius: "50%",
      animation: "ripple 1.2s infinite ease-in-out",
      border: "1px solid currentColor",
      content: '""',
    },
  },
  "@keyframes ripple": {
    "0%": { transform: "scale(.8)", opacity: 1 },
    "100%": { transform: "scale(2.4)", opacity: 0 },
  },
}));

export const FriendListItem = ({ conversation, onClick, lastElementRef }) => {
  // Tách biệt hoàn toàn logic lấy trạng thái online thông qua custom hook
  const { isOnline } = useFriendPresence(conversation);

  return (
    <ListItem disablePadding ref={lastElementRef}>
      <ListItemButton onClick={onClick}>
        {isOnline ? (
          <StyledBadge
            overlap="circular"
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            variant="dot"
          >
            <Avatar src={conversation.conversationAvatar} />
          </StyledBadge>
        ) : (
          <Badge
            color="error"
            badgeContent={conversation.unread}
            invisible={conversation.unread === 0}
          >
            <Avatar src={conversation.conversationAvatar} />
          </Badge>
        )}

        <ListItemText
          primary={conversation.conversationName}
          secondary={
            conversation.lastMessage || "No messages"
          }
          primaryTypographyProps={{ pl: 3, fontSize: 14 }}
          secondaryTypographyProps={{ pl: 3, fontSize: 12 }}
        />
      </ListItemButton>
    </ListItem>
  );
};