import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Box,
  Menu,
  MenuItem,
  CircularProgress,
  Avatar,
  Typography,
  Alert,
  Button,
} from "@mui/material";
import { getMyNotifications } from "../services/notificationService";
import { formatRelativeTime } from "../../../utils/dateUtils";

export default function NotificationMenu({ anchorEl, open, onClose }) {
  const [notifications, setNotifications] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasFetched, setHasFetched] = useState(false);
  const observer = useRef(null);
  const lastElementRef = useRef(null);

  const fetchNotifications = useCallback(async (pageToLoad, replace = false) => {
    setLoading(true);
    setError(null);
    try {
      const response = await getMyNotifications(pageToLoad);
      const result = response?.data?.result;
      const nextNotifications = result?.data || [];
      const nextTotalPages = result?.totalPages || 0;

      setTotalPages(nextTotalPages);
      setNotifications((prev) =>
        replace ? nextNotifications : [...prev, ...nextNotifications]
      );
      setHasFetched(true);
    } catch (err) {
      console.error(err);
      setError("Unable to load notifications right now.");
      if (pageToLoad === 1) {
        setNotifications([]);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    setPage(1);
    fetchNotifications(1, true);
  }, [open, fetchNotifications]);

  useEffect(() => {
    if (!open || page <= 1) return;
    fetchNotifications(page, false);
  }, [page, open, fetchNotifications]);

  useEffect(() => {
    if (!open || loading || page >= totalPages) return undefined;

    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver((entries) => {
      if (entries[0]?.isIntersecting && page < totalPages && !loading) {
        setPage((prevPage) => prevPage + 1);
      }
    });

    if (lastElementRef.current) {
      observer.current.observe(lastElementRef.current);
    }

    return () => {
      if (observer.current) observer.current.disconnect();
    };
  }, [notifications, open, loading, page, totalPages]);

  return (
    <Menu
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
      PaperProps={{
        elevation: 4,
        sx: {
          mt: 1.5,
          minWidth: 340,
          maxHeight: 450,
          overflowY: "auto",
        },
      }}
      anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      transformOrigin={{ vertical: "top", horizontal: "right" }}
    >
      <Box sx={{ px: 2, py: 1.5 }}>
        <Typography variant="subtitle1" fontWeight="bold">
          Notifications
        </Typography>
      </Box>

      {error && !loading && (
        <Box sx={{ px: 2, pb: 1 }}>
          <Alert
            severity="warning"
            action={
              <Button
                color="inherit"
                size="small"
                onClick={() => fetchNotifications(1, true)}
              >
                Retry
              </Button>
            }
          >
            {error}
          </Alert>
        </Box>
      )}

      {hasFetched && notifications.length === 0 && !loading && !error && (
        <MenuItem disabled>No notifications</MenuItem>
      )}

      {notifications.map((noti, index) => (
        <MenuItem
          key={noti.id}
          ref={index === notifications.length - 1 ? lastElementRef : null}
          onClick={onClose}
          sx={{
            display: "flex",
            alignItems: "flex-start",
            gap: 1,
            py: 1,
            whiteSpace: "normal",
          }}
        >
          <Avatar
            src={noti.actor?.avatarUrl || ""}
            alt={noti.actor?.name || "user"}
            sx={{ width: 36, height: 36 }}
          />
          <Box>
            <Typography fontSize={14}>
              <strong>{noti.actor?.name}</strong>{" "}
              {noti.type === "LIKE" && (
                <>
                  liked your post: <i>"{noti.entity?.contentPreview}"</i>
                </>
              )}
              {noti.type === "COMMENT" && (
                <>
                  commented on your post: <i>"{noti.entity?.contentPreview}"</i>
                </>
              )}
            </Typography>
            <Typography fontSize={12} color="gray">
              {formatRelativeTime(noti.createdAt)}
            </Typography>
          </Box>
        </MenuItem>
      ))}

      {loading && (
        <Box sx={{ textAlign: "center", py: 1 }}>
          <CircularProgress size={20} />
        </Box>
      )}
    </Menu>
  );
}
