import { Box, CircularProgress, Alert, Button } from "@mui/material";
import DynamicFeedOutlinedIcon from "@mui/icons-material/DynamicFeedOutlined";
import PostCard from "./PostCard";
import EmptyState from "../../../components/EmptyState";

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
  onCreatePost,
  onDeletePost,
  onUpdatePost,
  onPrivacyChange,
  onHidePost,
  onReportPost,
  onSavePost,
  onSharePost,
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
        <EmptyState
          icon={DynamicFeedOutlinedIcon}
          title="Your feed is quiet"
          description="When you or your friends share updates, they will show up here. Be the first to post something."
          primaryLabel={onCreatePost ? "Create post" : undefined}
          primaryOnClick={onCreatePost}
          sx={{ width: "100%", py: 4 }}
        />
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
              onDeletePost={onDeletePost}
              onUpdatePost={onUpdatePost}
              onPrivacyChange={onPrivacyChange}
              onHidePost={onHidePost}
              onReportPost={onReportPost}
              onSavePost={onSavePost}
              onSharePost={onSharePost}
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