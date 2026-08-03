import * as React from "react";
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

} from "@mui/material";
import Draggable from "react-draggable";
import DeleteIcon from "@mui/icons-material/Delete";

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

export default function DialogCreatePost({ open,
  onOpen,
  onClose,
  newPostContent,
  setNewPostContent,
  setSelectedImages,
  selectedImages,
  onPost, }) {




  const handleImageChange = (event) => {
    const files = Array.from(event.target.files);
    const imagePreviews = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    setSelectedImages((prev) => [...prev, ...imagePreviews]);
  };


  const handleRemoveImage = (index) => {
    setSelectedImages((prev) => {
      const newList = [...prev];
      newList.splice(index, 1);
      return newList;
    });
  };


  const handlePost = () => {
    onPost(newPostContent, selectedImages.map((i) => i.file));
    setSelectedImages([]);
  };


  return (
    <>
      <Box display="flex" alignItems="center" gap={1} width="100%">
        <Avatar alt="User" src="/static/avatar.png" />
        <Button
          onClick={onOpen}
          variant="outlined"
          fullWidth
          sx={{ borderRadius: "20px", justifyContent: "flex-start", paddingLeft: 2 }}
        >
          What's on your mind
        </Button>
      </Box>

      {/* Dialog */}
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
          <Stack direction="row" spacing={2} alignItems="center" mb={2}>
            <Avatar alt="User" src="/static/avatar.png" />
            <strong>Nguyễn Tấn Thành</strong>
          </Stack>

          {/* Ô nhập nội dung */}
          <TextField
            multiline
            fullWidth
            minRows={4}
            placeholder="What's on your mind?"
            variant="outlined"
            value={newPostContent}
            onChange={(e) => setNewPostContent(e.target.value)}
          />

          {/* 📸 Hiển thị ảnh ngay dưới text */}
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
                        backgroundColor: "rgba(255,255,255,0.7)",
                      }}
                    >
                      {/* <DeleteIcon fontSize="small" /> */}
                    </IconButton>
                  </ImageListItem>
                ))}
              </ImageList>
            </Box>
          )}

          {/* 📎 Nút thêm ảnh */}
          <Box mt={2} display="flex" justifyContent="flex-start">
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
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose}>Close</Button>
          <Button
            // onClick={onPost}
            onClick={handlePost}
            disabled={!newPostContent?.trim()}
            variant="contained"
          >
            Post
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
