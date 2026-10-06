import React, { useState } from "react";
import { Box, Avatar, Badge, IconButton, styled } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { getAvatarUrl } from "../utils/avatarUtils";

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

export default function MinimizedChatList({
  minimizedChats,
  onRestore,
  onClose, // Thêm hàm xử lý đóng hẳn khung chat thu nhỏ
  onlineUserIds = [],
}) {
  // Quản lý trạng thái hover theo từng chat ID
  const [hoveredId, setHoveredId] = useState(null);

  if (!minimizedChats || minimizedChats.length === 0) return null;

  return (
    <Box
      sx={{
        position: "fixed",
        bottom: 16,
        right: 16,
        display: "flex",
        gap: 1.5,
        zIndex: 1300,
      }}
    >
      {minimizedChats.map((chat) => {
        const isOnline = chat.participants?.some((p) =>
          onlineUserIds.includes(p.userId)
        );
        const isHovered = hoveredId === chat.id;

        return (
          <Box
            key={chat.id}
            onMouseEnter={() => setHoveredId(chat.id)}
            onMouseLeave={() => setHoveredId(null)}
            sx={{
              position: "relative",
              width: 44, // Thu nhỏ kích thước khung chứa
              height: 44,
              cursor: "pointer",
            }}
          >
            {/* Avatar chính (Đã thu nhỏ từ 56px xuống 44px) */}
            <Box
              onClick={() => onRestore(chat)}
              sx={{ width: "100%", height: "100%" }}
            >
              {isOnline ? (
                <StyledBadge
                  overlap="circular"
                  anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                  variant="dot"
                >
                  <Avatar
                    src={getAvatarUrl(chat.conversationAvatar, chat.gender)}
                    sx={{ width: 44, height: 44, border: "2px solid #1976d2" }}
                  />
                </StyledBadge>
              ) : (
                <Avatar
                  src={getAvatarUrl(chat.conversationAvatar, chat.gender)}
                  sx={{ width: 44, height: 44, border: "2px solid #1976d2" }}
                />
              )}
            </Box>

            {/* Nút dấu X hiện lên khi hover ở góc phải */}
            {isHovered && (
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation(); // Ngăn sự kiện click nhầm vào mở chat
                  onClose(chat.id);
                }}
                sx={{
                  position: "absolute",
                  top: -6,
                  right: -6,
                  backgroundColor: "rgba(0, 0, 0, 0.6)",
                  color: "#fff",
                  padding: "2px",
                  width: 20,
                  height: 20,
                  "&:hover": {
                    backgroundColor: "rgba(0, 0, 0, 0.8)",
                  },
                }}
              >
                <CloseIcon sx={{ fontSize: 14 }} />
              </IconButton>
            )}
          </Box>
        );
      })}
    </Box>
  );
}