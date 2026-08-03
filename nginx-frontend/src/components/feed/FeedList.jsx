import { Box, CircularProgress, Typography, Alert, Button } from "@mui/material";
import PostCard from "./PostCard";

export default function FeedList({
  posts,
  loading,
  feedError,
  readPosts,
  onLike,
  onOpenComments,
  onImageClick,
  lastPostElementRef,
  onRetry,
}) {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%", gap: "10px" }}>
      {feedError && !loading && (
        <Alert
          severity="warning"
          sx={{ mb: 2, width: "100%" }}
          action={
            onRetry && (
              <Button color="inherit" size="small" onClick={onRetry}>
                Retry
              </Button>
            )
          }
        >
          {feedError}
        </Alert>
      )}

      {!feedError && !loading && posts.length === 0 && (
        <Box sx={{ p: 2, textAlign: "center", width: "100%" }}>
          <Typography color="text.secondary">No posts available right now.</Typography>
        </Box>
      )}

      {posts.map((post, index) => {
        const isLast = posts.length === index + 1;
        const isRead = readPosts.includes(post.postId?.toString());

        return (
          <Box
            key={post.postId}
            ref={isLast ? lastPostElementRef : null} // 👈 Đưa ref ra bọc bên ngoài bài viết cuối cùng tại đây
            sx={{ width: "100%", display: "flex", justifyContent: "center" }}
          >
            <PostCard
              post={post}
              isRead={isRead}
              onLike={onLike}
              onOpenComments={onOpenComments}
              onImageClick={onImageClick}
            />
          </Box>
        );
      })}

      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", width: "100%", my: 2 }}>
          <CircularProgress size="24px" />
        </Box>
      )}
    </Box>
  );
}