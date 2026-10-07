import React, { useState } from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  Button,
  Avatar,
  TextField,
  Stack,
  Box,
  IconButton,
  ImageList,
  ImageListItem,
  Typography,
} from "@mui/material";
import Draggable from "react-draggable";
import DeleteIcon from "@mui/icons-material/Delete";

import { useUser } from "../../../providers/UserProvider";
import PostPrivacySelector from "./PostPrivacySelector";

const PaperComponent = React.forwardRef(function PaperComponent(props, ref) {
  const nodeRef = React.useRef(null);
  return (
    <Draggable
      nodeRef={nodeRef}
      handle="#draggable-dialog-title"
      cancel={'[class*="MuiDialogContent-root"]'}
    >
      <Paper ref={nodeRef} {...props} />
    </Draggable>
  );
});

export default function DialogCreatePost({
  open,
  onOpen,
  onClose,
  newPostContent,
  setNewPostContent,
  setSelectedImages,
  selectedImages,
  onPost,
  currentUser: propCurrentUser,
}) {
  const [selectedVideos, setSelectedVideos] = useState([]);
  const [privacy, setPrivacy] = useState("PUBLIC");

  const { currentUser: contextUser } = useUser();
  const currentUser = propCurrentUser || contextUser;

  const displayName =
    currentUser?.name ||
    currentUser?.displayName ||
    [currentUser?.firstname, currentUser?.lastname].filter(Boolean).join(" ") ||
    currentUser?.username ||
    "User";
  const avatarSrc = currentUser?.avatarUrl || currentUser?.avatar || "";

  const handleImageChange = (event) => {
    const files = Array.from(event.target.files);
    const imagePreviews = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    setSelectedImages((prev) => [...prev, ...imagePreviews]);
  };

  const handleVideoChange = (event) => {
    const files = Array.from(event.target.files);
    const videoPreviews = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    setSelectedVideos((prev) => [...prev, ...videoPreviews]);
  };

  const handleRemoveImage = (index) => {
    setSelectedImages((prev) => {
      const newList = [...prev];
      newList.splice(index, 1);
      return newList;
    });
  };

  const handleRemoveVideo = (index) => {
    setSelectedVideos((prev) => {
      const newList = [...prev];
      newList.splice(index, 1);
      return newList;
    });
  };

  const handlePost = () => {
    const files = [
      ...selectedImages.map((i) => i.file),
      ...selectedVideos.map((v) => v.file),
    ];
    onPost(newPostContent, files, privacy);
    setNewPostContent("");
    setSelectedImages([]);
    setSelectedVideos([]);
    setPrivacy("PUBLIC");
  };

  return (
    <>
      <Box display="flex" alignItems="center" gap={1} width="100%" mb={2}>
        <Avatar alt={displayName} src={avatarSrc} />
        <Button
          onClick={onOpen}
          variant="outlined"
          fullWidth
          sx={{ borderRadius: "20px", justifyContent: "flex-start", paddingLeft: 2 }}
        >
          What's on your mind?
        </Button>
      </Box>

      <Dialog
        open={open}
        onClose={onClose}
        PaperComponent={PaperComponent}
        aria-labelledby="draggable-dialog-title"
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle
          style={{ cursor: "move", textAlign: "center", fontWeight: "bold" }}
          id="draggable-dialog-title"
        >
          Create post
        </DialogTitle>

        <DialogContent dividers>
          <Stack direction="row" spacing={1.5} alignItems="center" mb={2}>
            <Avatar alt={displayName} src={avatarSrc} sx={{ width: 44, height: 44 }}>
              {displayName?.[0]}
            </Avatar>
            <Box>
              <Typography variant="subtitle1" fontWeight={700} lineHeight={1.2}>
                {displayName}
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
          </Stack>

          <TextField
            multiline
            fullWidth
            minRows={4}
            maxRows={10}
            placeholder="What's on your mind?"
            variant="outlined"
            value={newPostContent}
            onChange={(e) => setNewPostContent(e.target.value)}
          />

          {selectedImages.length > 0 && (
            <Box mt={2}>
              <ImageList cols={3} gap={8}>
                {selectedImages.map((img, index) => (
                  <ImageListItem key={index} sx={{ position: "relative" }}>
                    <img
                      src={img.preview}
                      alt={`preview-${index}`}
                      style={{
                        width: "100%",
                        height: 120,
                        objectFit: "cover",
                        borderRadius: 8,
                      }}
                    />
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleRemoveImage(index)}
                      sx={{
                        position: "absolute",
                        top: 5,
                        right: 5,
                        backgroundColor: "rgba(255,255,255,0.85)",
                        "&:hover": { backgroundColor: "#fff" },
                      }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </ImageListItem>
                ))}
              </ImageList>
            </Box>
          )}

          {selectedVideos.length > 0 && (
            <Box mt={2}>
              {selectedVideos.map((vid, index) => (
                <Box key={index} sx={{ position: "relative", mb: 1 }}>
                  <video
                    src={vid.preview}
                    controls
                    style={{ width: "100%", maxHeight: 200, borderRadius: 8 }}
                  />
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleRemoveVideo(index)}
                    sx={{
                      position: "absolute",
                      top: 5,
                      right: 5,
                      backgroundColor: "rgba(255,255,255,0.85)",
                      "&:hover": { backgroundColor: "#fff" },
                    }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              ))}
            </Box>
          )}

          <Box mt={2} display="flex" gap={2} justifyContent="flex-start">
            <input
              accept="image/*"
              id="upload-image"
              multiple
              type="file"
              style={{ display: "none" }}
              onChange={handleImageChange}
            />
            <label htmlFor="upload-image">
              <Button
                variant="outlined"
                component="span"
                sx={{ textTransform: "none", borderRadius: "20px" }}
              >
                + Add Image
              </Button>
            </label>

            <input
              accept="video/*"
              id="upload-video"
              multiple
              type="file"
              style={{ display: "none" }}
              onChange={handleVideoChange}
            />
            <label htmlFor="upload-video">
              <Button
                variant="outlined"
                component="span"
                sx={{ textTransform: "none", borderRadius: "20px" }}
              >
                + Add Video
              </Button>
            </label>
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose}>Close</Button>
          <Button
            onClick={handlePost}
            disabled={!newPostContent?.trim() && selectedImages.length === 0 && selectedVideos.length === 0}
            variant="contained"
          >
            Post
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}