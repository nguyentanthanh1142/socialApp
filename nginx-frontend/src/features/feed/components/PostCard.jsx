import React from "react";
import { Box, Card, Avatar, Typography } from "@mui/material";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import { useNavigate } from "react-router-dom";

export default function PostCard({ post, isRead, onLike, onOpenComments, onImageClick }) {
  const navigate = useNavigate();

  const authorName = post.name || post.authorName || "User";
  const authorAvatar = post.avatarUrl || post.avatar || "";

  // Xử lý lấy danh sách media thông minh: hỗ trợ cả file tạm (blob) lẫn file từ server
  // Đồng thời gắn nhãn chuẩn type="video" hoặc "image" để không bị phụ thuộc vào đuôi tên file URL
  const mediaList =
    post.files?.length > 0
      ? post.files.map((file) => {
        if (typeof file === "string") {
          const isVid = /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(file) || file.includes("/video/upload/");
          return { url: file, type: isVid ? "video" : "image" };
        }
        const url = file.url || file.preview || (file.file ? URL.createObjectURL(file.file) : null);
        const rawFile = file.file || (file instanceof File ? file : null);
        const mimeType = rawFile?.type || file.type || "";
        const isVid =
          file.type === "video" ||
          mimeType.startsWith("video/") ||
          (url && (url.startsWith("blob:") || url.includes("/video/upload/") || /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(url)));

        return {
          url,
          type: isVid ? "video" : "image",
          ...file,
        };
      }).filter((item) => item.url)
      : (post.images || []).map((url) => {
        const isVid = /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(url) || url.includes("/video/upload/");
        return { url, type: isVid ? "video" : "image" };
      });

  const handleAuthorClick = () => {
    const target = post.username || post.authorUsername || post.userId;
    if (target) {
      navigate(`/u/${target}`);
    }
  };

  return (
    <Card
      data-id={post.postId}
      className="post-card"
      sx={{
        width: "100%",
        maxWidth: 580,
        p: 2.5,
        mb: 2.5,
        borderRadius: 3,
        boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
        border: "1px solid",
        borderColor: "rgba(0,0,0,0.06)",
        position: "relative",
        transition: "box-shadow 0.2s ease-in-out",
        "&:hover": {
          boxShadow: "0 4px 16px rgba(0,0,0,0.09)",
        },
      }}
    >
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", mb: 1.5 }}>
        <Avatar
          src={authorAvatar}
          alt={authorName}
          onClick={handleAuthorClick}
          sx={{
            width: 42,
            height: 42,
            cursor: "pointer",
            transition: "opacity 0.2s",
            "&:hover": { opacity: 0.85 },
          }}
        >
          {authorName?.[0]}
        </Avatar>
        <Box sx={{ ml: 1.5 }}>
          <Typography
            fontWeight={700}
            fontSize="0.95rem"
            onClick={handleAuthorClick}
            sx={{
              cursor: "pointer",
              "&:hover": { textDecoration: "underline" },
            }}
          >
            {authorName}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {post.timestamp ||
              (post.createdDate ? new Date(post.createdDate).toLocaleString() : "Just now")}
          </Typography>
        </Box>
      </Box>

      {/* Content */}
      <Typography
        sx={{
          mb: 1.5,
          wordBreak: "break-word",
          fontSize: "0.95rem",
          lineHeight: 1.5,
          whiteSpace: "pre-line",
        }}
      >
        {post.content}
      </Typography>

      {/* Media Gallery (Images & Videos) */}
      {mediaList.length > 0 && (
        <Box
          sx={{
            display: "grid",
            gap: 1,
            mt: 1,
            mb: 1.5,
            borderRadius: 2,
            overflow: "hidden",
            gridTemplateColumns:
              mediaList.length === 1
                ? "1fr"
                : mediaList.length === 2
                  ? "repeat(2, 1fr)"
                  : "repeat(3, 1fr)",
          }}
        >
          {mediaList.map((media, idx) => {
            const mediaUrl = media.url;
            const isVideo = media.type === "video";

            const commonSx = {
              width: "100%",
              height: mediaList.length === 1 ? 360 : 200,
              borderRadius: 1.5,
              objectFit: "cover",
              cursor: "pointer",
              transition: "transform 0.2s ease, opacity 0.2s ease",
              "&:hover": { opacity: 0.9, transform: "scale(1.01)" },
            };

            const rawUrls = mediaList.map((m) => m.url);

            return isVideo ? (
              <Box
                key={idx}
                component="video"
                src={mediaUrl}
                controls
                onClick={() => onImageClick(rawUrls, idx)}
                sx={commonSx}
              />
            ) : (
              <Box
                key={idx}
                component="img"
                src={mediaUrl}
                alt={`Media ${idx + 1}`}
                onClick={() => onImageClick(rawUrls, idx)}
                sx={commonSx}
              />
            );
          })}
        </Box>
      )}

      {isRead && (
        <Typography
          variant="caption"
          color="primary"
          sx={{
            position: "absolute",
            top: 12,
            right: 14,
            fontSize: "0.75rem",
            fontWeight: 600,
          }}
        >
          Seen
        </Typography>
      )}

      {/* Actions */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-around",
          alignItems: "center",
          mt: 1,
          borderTop: "1px solid #f0f2f5",
          pt: 1,
        }}
      >
        <Box
          onClick={() => onLike(post.postId)}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.8,
            cursor: "pointer",
            px: 2,
            py: 0.5,
            borderRadius: 2,
            color: post.liked ? "#e53e3e" : "text.secondary",
            transition: "all 0.2s ease",
            "&:hover": {
              backgroundColor: "#fee2e2",
              color: "#e53e3e",
            },
          }}
        >
          {post.liked ? (
            <FavoriteIcon sx={{ fontSize: 20, color: "#e53e3e" }} />
          ) : (
            <FavoriteBorderIcon sx={{ fontSize: 20 }} />
          )}
          <Typography variant="body2" fontWeight={600}>
            {post.likeCount || 0}
          </Typography>
        </Box>

        <Box
          onClick={() => onOpenComments(post)}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.8,
            cursor: "pointer",
            px: 2,
            py: 0.5,
            borderRadius: 2,
            color: "text.secondary",
            transition: "all 0.2s ease",
            "&:hover": {
              backgroundColor: "#eff6ff",
              color: "#1877f2",
            },
          }}
        >
          <ChatBubbleOutlineIcon sx={{ fontSize: 20 }} />
          <Typography variant="body2" fontWeight={600}>
            {post.commentCount || 0} {post.commentCount === 1 ? "comment" : "comments"}
          </Typography>
        </Box>
      </Box>
    </Card>
  );
}