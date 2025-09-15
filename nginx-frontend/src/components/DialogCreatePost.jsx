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
} from "@mui/material";
import Draggable from "react-draggable";

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
  onPost, }) {

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
          <TextField
            multiline
            fullWidth
            minRows={4}
            placeholder="What's your minhd?"
            variant="outlined"
            value={newPostContent}
            onChange={(e) => setNewPostContent(e.target.value)}
          />
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose}>Close</Button>
          <Button
            onClick={onPost}
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
