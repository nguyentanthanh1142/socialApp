import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Avatar,
  Box,
  Typography,
  IconButton,
  CircularProgress,
  Stack,
  Tooltip,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import PostPrivacySelector from "./PostPrivacySelector";

export default function EditPostDialog({
  open,
  post,
  loading = false,
  onClose,
  onSave,
}) {
  const [content, setContent] = useState("");
  const [privacy, setPrivacy] = useState("PUBLIC");
  const [mediaList, setMediaList] = useState([]);

  useEffect(() => {
    if (post && open) {
      setContent(post.content || "");
      setPrivacy(post.privacy || "PUBLIC");

      // Normalize media list from post
      const initialMedia = (post.files || []).map((file, idx) => {
        if (typeof file === "string") {
          return { id: idx, url: file, type: "image" };
        }
        return {
          id: idx,
          url: file.url || file.preview,
          type: file.type || "image",
          ...file,
        };
      });

      if (initialMedia.length === 0 && post.images?.length > 0) {
        setMediaList(
          post.images.map((url, idx) => ({ id: idx, url, type: "image" }))
        );
      } else {
        setMediaList(initialMedia.filter((m) => m.url));
      }
    }
  }, [post, open]);

  const handleRemoveMedia = (indexToRemove) => {
    setMediaList((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSave = () => {
    if (!content.trim() && mediaList.length === 0) return;
    onSave({
      postId: post.postId,
      content,
      privacy,
      files: mediaList,
      images: mediaList.map((m) => m.url),
    });
  };

  const authorName = post?.name || post?.authorName || "User";
  const authorAvatar = post?.avatarUrl || post?.avatar || "";

  const canSave = Boolean(content.trim() || mediaList.length > 0) && !loading;

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      maxWidth="sm"
      fullWidth
      aria-labelledby="edit-post-dialog-title"
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: "0 10px 40px rgba(0,0,0,0.15)",
        },
      }}
    >
      <DialogTitle
        id="edit-post-dialog-title"
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          pb: 1.5,
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Typography variant="h6" fontWeight={700}>
          Edit post
        </Typography>
        <IconButton
          onClick={onClose}
          disabled={loading}
          size="small"
          aria-label="close"
          sx={{
            color: "text.secondary",
            "&:hover": { backgroundColor: "action.hover" },
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 2.5, pb: 2 }}>
        {/* Author Header with embedded Privacy Selector */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
          <Avatar src={authorAvatar} alt={authorName} sx={{ width: 44, height: 44 }}>
            {authorName?.[0]}
          </Avatar>
          <Box>
            <Typography variant="subtitle1" fontWeight={700} lineHeight={1.2}>
              {authorName}
            </Typography>
            <Box sx={{ mt: 0.5 }}>
              <PostPrivacySelector
                privacy={privacy}
                isOwner={true}
                onChange={(newPrivacy) => setPrivacy(newPrivacy)}
                variant="selector"
              />
            </Box>
          </Box>
        </Box>

        {/* Post Text Input */}
        <TextField
          multiline
          fullWidth
          minRows={4}
          maxRows={10}
          placeholder="What's on your mind?"
          variant="standard"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          InputProps={{
            disableUnderline: true,
            sx: {
              fontSize: "1rem",
              lineHeight: 1.6,
              px: 0.5,
            },
          }}
        />

        {/* Existing Media Thumbnails */}
        {mediaList.length > 0 && (
          <Box sx={{ mt: 2, pt: 1, borderTop: "1px dashed", borderColor: "divider" }}>
            <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ mb: 1, display: "block" }}>
              Attached Media ({mediaList.length})
            </Typography>
            <Stack direction="row" spacing={1.5} sx={{ overflowX: "auto", pb: 1 }}>
              {mediaList.map((media, idx) => (
                <Box
                  key={media.id || idx}
                  sx={{
                    position: "relative",
                    width: 100,
                    height: 100,
                    borderRadius: 2,
                    overflow: "hidden",
                    border: "1px solid",
                    borderColor: "divider",
                    flexShrink: 0,
                  }}
                >
                  {media.type === "video" ? (
                    <Box
                      component="video"
                      src={media.url}
                      sx={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  ) : (
                    <Box
                      component="img"
                      src={media.url}
                      alt={`Thumbnail ${idx + 1}`}
                      sx={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  )}
                  <Tooltip title="Remove media">
                    <IconButton
                      size="small"
                      onClick={() => handleRemoveMedia(idx)}
                      sx={{
                        position: "absolute",
                        top: 4,
                        right: 4,
                        backgroundColor: "rgba(0, 0, 0, 0.6)",
                        color: "white",
                        p: 0.5,
                        "&:hover": { backgroundColor: "rgba(0, 0, 0, 0.85)" },
                      }}
                    >
                      <DeleteOutlineIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  </Tooltip>
                </Box>
              ))}
            </Stack>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5, pt: 1.5, borderTop: "1px solid", borderColor: "divider" }}>
        <Button
          onClick={onClose}
          disabled={loading}
          variant="outlined"
          color="inherit"
          sx={{
            borderRadius: 2,
            textTransform: "none",
            fontWeight: 600,
            px: 2.5,
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          disabled={!canSave}
          variant="contained"
          color="primary"
          startIcon={loading ? <CircularProgress size={16} color="inherit" /> : null}
          sx={{
            borderRadius: 2,
            textTransform: "none",
            fontWeight: 700,
            px: 3,
            boxShadow: "none",
          }}
        >
          {loading ? "Saving..." : "Save changes"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
