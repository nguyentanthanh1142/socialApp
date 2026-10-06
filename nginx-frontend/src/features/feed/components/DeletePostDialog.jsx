import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  CircularProgress,
  Box,
  Typography,
} from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";

export default function DeletePostDialog({
  open,
  loading = false,
  onClose,
  onConfirm,
}) {
  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      aria-labelledby="delete-dialog-title"
      aria-describedby="delete-dialog-description"
      PaperProps={{
        sx: {
          borderRadius: 3,
          p: 1,
          maxWidth: 440,
          boxShadow: "0 10px 40px rgba(0,0,0,0.15)",
        },
      }}
    >
      <DialogTitle
        id="delete-dialog-title"
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          pb: 1,
          fontWeight: 700,
        }}
      >
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: "50%",
            backgroundColor: "error.light",
            color: "error.main",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <WarningAmberRoundedIcon />
        </Box>
        <Box>
          <Typography variant="h6" fontWeight={700} component="div">
            Delete post?
          </Typography>
          <Typography variant="caption" color="text.secondary">
            This action cannot be undone
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ pt: 1, pb: 2 }}>
        <DialogContentText id="delete-dialog-description" sx={{ color: "text.primary" }}>
          Are you sure you want to delete this post? It will be permanently removed from your profile and the feed for everyone.
        </DialogContentText>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
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
          onClick={onConfirm}
          disabled={loading}
          variant="contained"
          color="error"
          startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <DeleteOutlineIcon />}
          sx={{
            borderRadius: 2,
            textTransform: "none",
            fontWeight: 700,
            px: 2.5,
            boxShadow: "none",
            "&:hover": {
              boxShadow: "0 4px 12px rgba(211, 47, 47, 0.3)",
            },
          }}
        >
          {loading ? "Deleting..." : "Delete"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
