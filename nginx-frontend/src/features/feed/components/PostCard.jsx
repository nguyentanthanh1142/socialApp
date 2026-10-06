import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  Avatar,
  Typography,
  Snackbar,
  Alert,
  Button,
} from "@mui/material";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import { useNavigate } from "react-router-dom";
import { getPostDisplayTime } from "../../../utils/dateUtils";
import { useUser } from "../../../providers/UserProvider";
import {
  deletePost,
  updatePost,
  updatePostPrivacy,
  savePost,
  hidePost,
} from "../services/postService";
import PostPrivacySelector from "./PostPrivacySelector";
import PostActionMenu from "./PostActionMenu";
import DeletePostDialog from "./DeletePostDialog";
import EditPostDialog from "./EditPostDialog";

export default function PostCard({
  post,
  isRead,
  onLike,
  onOpenComments,
  onImageClick,
  onDeletePost,
  onUpdatePost,
  onPrivacyChange,
  onHidePost,
  onReportPost,
  onSavePost,
  onSharePost,
}) {
  const navigate = useNavigate();
  const { currentUser } = useUser();

  const [currentPost, setCurrentPost] = useState(post);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);

  // Snackbar notification feedback
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const showToast = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  useEffect(() => {
    setCurrentPost(post);
  }, [post]);

  const authorName = currentPost.name || currentPost.authorName || "User";
  const authorAvatar = currentPost.avatarUrl || currentPost.avatar || "";

  // Ownership calculation
  const isOwner = Boolean(
    currentPost.isMine ||
    currentPost.isOwner ||
    (currentUser?.userId && (currentPost.userId === currentUser.userId || currentPost.authorId === currentUser.userId)) ||
    (currentUser?.name && (currentPost.name === currentUser.name || currentPost.authorName === currentUser.name)) ||
    (Array.isArray(currentPost.actions) &&
      currentPost.actions.some((a) => String(a).toUpperCase() === "EDIT"))
  );

  // Media list formatting
  const mediaList =
    currentPost.files?.length > 0
      ? currentPost.files
          .map((file) => {
            if (typeof file === "string") {
              const isVid =
                /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(file) ||
                file.includes("/video/upload/");
              return { url: file, type: isVid ? "video" : "image" };
            }
            const url =
              file.url ||
              file.preview ||
              (file.file ? URL.createObjectURL(file.file) : null);
            const rawFile = file.file || (file instanceof File ? file : null);
            const mimeType = rawFile?.type || file.type || "";
            const isVid =
              file.type === "video" ||
              mimeType.startsWith("video/") ||
              (url &&
                (url.startsWith("blob:") ||
                  url.includes("/video/upload/") ||
                  /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(url)));

            return {
              url,
              type: isVid ? "video" : "image",
              ...file,
            };
          })
          .filter((item) => item.url)
      : (currentPost.images || []).map((url) => {
          const isVid =
            /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(url) ||
            url.includes("/video/upload/");
          return { url, type: isVid ? "video" : "image" };
        });

  const handleAuthorClick = () => {
    const target =
      currentPost.username || currentPost.authorUsername || currentPost.userId;
    if (target) {
      navigate(`/u/${target}`);
    }
  };

  // Privacy change handler
  const handlePrivacyChange = async (newPrivacy) => {
    const prevPrivacy = currentPost.privacy;
    setCurrentPost((prev) => ({ ...prev, privacy: newPrivacy }));
    showToast(`Privacy updated to ${newPrivacy.toLowerCase()}`);

    try {
      await updatePostPrivacy(currentPost.postId, newPrivacy);
      if (onPrivacyChange) {
        onPrivacyChange(currentPost.postId, newPrivacy);
      }
    } catch (err) {
      console.error("Privacy update error:", err);
      setCurrentPost((prev) => ({ ...prev, privacy: prevPrivacy }));
      showToast("Failed to update privacy", "error");
    }
  };

  // Actions click handler from 3-dot menu
  const handleActionClick = (actionKey) => {
    switch (actionKey) {
      case "EDIT":
        setEditDialogOpen(true);
        break;
      case "DELETE":
        setDeleteDialogOpen(true);
        break;
      case "SAVE":
        handleToggleSave();
        break;
      case "HIDE":
        handleHidePost();
        break;
      case "REPORT":
        handleReportPost();
        break;
      case "SHARE":
        handleSharePost();
        break;
      default:
        console.info("Action triggered:", actionKey);
    }
  };

  const handleToggleSave = async () => {
    const nextSaved = !currentPost.isSaved;
    setCurrentPost((prev) => ({ ...prev, isSaved: nextSaved }));
    showToast(nextSaved ? "Post saved to your bookmarks" : "Post removed from bookmarks");
    try {
      await savePost(currentPost.postId);
      if (onSavePost) {
        onSavePost(currentPost.postId, nextSaved);
      }
    } catch (err) {
      console.error("Save post error:", err);
    }
  };

  const handleHidePost = async () => {
    setIsHidden(true);
    showToast("Post hidden from feed");
    try {
      await hidePost(currentPost.postId);
      if (onHidePost) {
        onHidePost(currentPost.postId);
      }
    } catch (err) {
      console.error("Hide post error:", err);
    }
  };

  const handleReportPost = () => {
    showToast("Thank you for your report. Our team will review this post.");
    if (onReportPost) {
      onReportPost(currentPost.postId);
    }
  };

  const handleSharePost = async () => {
    const shareUrl = `${window.location.origin}/post/${currentPost.postId}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${authorName}'s post`,
          text: currentPost.content,
          url: shareUrl,
        });
        showToast("Post shared successfully");
        if (onSharePost) onSharePost(currentPost);
        return;
      } catch (err) {
        if (err.name === "AbortError") return;
      }
    }

    try {
      await navigator.clipboard.writeText(shareUrl);
      showToast("Link copied to clipboard!");
      if (onSharePost) onSharePost(currentPost);
    } catch {
      showToast("Failed to copy link to clipboard", "error");
    }
  };

  // Delete modal confirm
  const handleConfirmDelete = async () => {
    setDeleteLoading(true);
    try {
      await deletePost(currentPost.postId);
      setDeleteDialogOpen(false);
      showToast("Post deleted successfully");
      if (onDeletePost) {
        onDeletePost(currentPost.postId);
      } else {
        setIsDeleted(true);
      }
    } catch (err) {
      console.error("Failed to delete post:", err);
      showToast("Failed to delete post. Please try again.", "error");
    } finally {
      setDeleteLoading(false);
    }
  };

  // Edit modal save
  const handleSaveEdit = async (updatedData) => {
    setEditLoading(true);
    try {
      const res = await updatePost(currentPost.postId, updatedData);
      const serverResult = res?.data?.result || updatedData;
      const merged = {
        ...currentPost,
        ...updatedData,
        ...(typeof serverResult === "object" ? serverResult : {}),
      };

      setCurrentPost(merged);
      setEditDialogOpen(false);
      showToast("Post updated successfully");
      if (onUpdatePost) {
        onUpdatePost(merged);
      }
    } catch (err) {
      console.error("Failed to update post:", err);
      showToast("Failed to update post. Please try again.", "error");
    } finally {
      setEditLoading(false);
    }
  };

  if (isDeleted) {
    return null;
  }

  if (isHidden) {
    return (
      <Card
        sx={{
          width: "100%",
          maxWidth: 580,
          p: 2,
          mb: 2.5,
          borderRadius: 3,
          boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
          border: "1px solid",
          borderColor: "divider",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Typography variant="body2" color="text.secondary">
          Post hidden from your feed.
        </Typography>
        <Button
          size="small"
          onClick={() => setIsHidden(false)}
          sx={{ textTransform: "none", fontWeight: 600 }}
        >
          Undo
        </Button>
      </Card>
    );
  }

  return (
    <>
      <Card
        data-id={currentPost.postId}
        className="post-card"
        sx={{
          width: "100%",
          maxWidth: 580,
          p: 3,
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
        {/* Header: Author + Timestamp/Privacy on left, Seen + 3-Dot Menu on right */}
        <Box
          sx={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 1.5,
            mb: 2,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, minWidth: 0, flex: 1 }}>
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
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography
                fontWeight={700}
                fontSize="0.95rem"
                onClick={handleAuthorClick}
                noWrap
                sx={{
                  cursor: "pointer",
                  lineHeight: 1.3,
                  mb: 0.25,
                  "&:hover": { textDecoration: "underline" },
                }}
              >
                {authorName}
              </Typography>

              {/* Subtitle: Timestamp + Privacy Indicator / Selector */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 0.75,
                  flexWrap: "wrap",
                  lineHeight: 1.4,
                }}
              >
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ lineHeight: 1 }}
                >
                  {getPostDisplayTime(currentPost)}
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ lineHeight: 1 }}
                >
                  •
                </Typography>
                <PostPrivacySelector
                  privacy={currentPost.privacy}
                  isOwner={isOwner}
                  onChange={handlePrivacyChange}
                />
              </Box>
            </Box>
          </Box>

          {/* Right Header: Seen badge and 3-Dot Action Menu */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexShrink: 0 }}>
            {isRead && (
              <Typography
                variant="caption"
                color="primary"
                sx={{
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  bgcolor: "primary.lighter",
                  px: 0.75,
                  py: 0.2,
                  borderRadius: 1,
                }}
              >
                Seen
              </Typography>
            )}

            <PostActionMenu
              actions={currentPost.actions}
              isOwner={isOwner}
              isSaved={currentPost.isSaved}
              onActionClick={handleActionClick}
            />
          </Box>
        </Box>

        {/* Content */}
        <Typography
          sx={{
            mb: 2,
            wordBreak: "break-word",
            fontSize: "0.95rem",
            lineHeight: 1.6,
            whiteSpace: "pre-line",
            px: 0.25,
          }}
        >
          {currentPost.content}
        </Typography>

        {/* Media Gallery (Images & Videos) */}
        {mediaList.length > 0 && (
          <Box
            sx={{
              display: "grid",
              gap: 1.25,
              mt: 0.5,
              mb: 2,
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
                  onClick={() => onImageClick?.(rawUrls, idx)}
                  sx={commonSx}
                />
              ) : (
                <Box
                  key={idx}
                  component="img"
                  src={mediaUrl}
                  alt={`Media ${idx + 1}`}
                  onClick={() => onImageClick?.(rawUrls, idx)}
                  sx={commonSx}
                />
              );
            })}
          </Box>
        )}

        {/* Actions: Like & Comments */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-around",
            alignItems: "center",
            mt: 0.5,
            borderTop: "1px solid #f0f2f5",
            pt: 1.25,
            pb: 0.25,
          }}
        >
          <Box
            onClick={() => onLike?.(currentPost.postId)}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.8,
              cursor: "pointer",
              px: 2,
              py: 0.5,
              borderRadius: 2,
              color: currentPost.liked ? "#e53e3e" : "text.secondary",
              transition: "all 0.2s ease",
              "&:hover": {
                backgroundColor: "#fee2e2",
                color: "#e53e3e",
              },
            }}
          >
            {currentPost.liked ? (
              <FavoriteIcon sx={{ fontSize: 20, color: "#e53e3e" }} />
            ) : (
              <FavoriteBorderIcon sx={{ fontSize: 20 }} />
            )}
            <Typography variant="body2" fontWeight={600}>
              {currentPost.likeCount || 0}
            </Typography>
          </Box>

          <Box
            onClick={() => onOpenComments?.(currentPost)}
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
              {currentPost.commentCount || 0}{" "}
              {currentPost.commentCount === 1 ? "comment" : "comments"}
            </Typography>
          </Box>
        </Box>
      </Card>

      {/* Delete Confirmation Modal */}
      <DeletePostDialog
        open={deleteDialogOpen}
        loading={deleteLoading}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
      />

      {/* Edit Post Modal */}
      <EditPostDialog
        open={editDialogOpen}
        post={currentPost}
        loading={editLoading}
        onClose={() => setEditDialogOpen(false)}
        onSave={handleSaveEdit}
      />

      {/* Feedback Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: "100%", borderRadius: 2 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}