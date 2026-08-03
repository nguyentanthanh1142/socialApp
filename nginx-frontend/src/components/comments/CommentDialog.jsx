import { useState, useEffect } from "react";
import { Box, Dialog, Typography, Avatar, Button, CircularProgress } from "@mui/material";
import { getMockCommentsByPostId, addMockComment, getMockCurrentUser } from "../../mockData";


export default function CommentDialog({ open, onClose, selectedPost, onCommentAdded, currentUser }) {
  const [comments, setComments] = useState([]);
  const [commentPage, setCommentPage] = useState(1);
  const [hasMoreComments, setHasMoreComments] = useState(true);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [newCommentContent, setNewCommentContent] = useState("");

  useEffect(() => {
    if (open && selectedPost) {
      setCommentPage(1);
      setComments([]);
      fetchComments(selectedPost.postId, 1);
    }
  }, [open, selectedPost]);

  const fetchComments = async (postId, pageToLoad) => {
    setIsLoadingComments(true);
    try {
      const response = await getMockCommentsByPostId(postId, pageToLoad, 3);
      const { result, hasMore } = response.data;

      setComments((prev) => (pageToLoad === 1 ? result : [...prev, ...result]));
      setHasMoreComments(hasMore);
    } catch (error) {
      console.error("Failed to load comments:", error);
    } finally {
      setIsLoadingComments(false);
    }
  };

  const handleLoadMore = () => {
    if (isLoadingComments || !hasMoreComments || !selectedPost) return;
    const nextPage = commentPage + 1;
    setCommentPage(nextPage);
    fetchComments(selectedPost.postId, nextPage);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = newCommentContent.trim();
    if (!trimmed || !selectedPost) return;

    const optimisticComment = {
      commentId: `temp-${Date.now()}`,
      postId: selectedPost.postId,
      authorName: currentUser.name,
      avatar: currentUser.avatarUrl,
      content: trimmed,
      timestamp: "Just now",
    };

    setComments((prev) => [...prev, optimisticComment]);
    setNewCommentContent("");

    if (onCommentAdded) {
      onCommentAdded(selectedPost.postId);
    }

    try {
      addMockComment(selectedPost.postId, trimmed);
    } catch (err) {
      console.error("Failed to add comment:", err);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: { borderRadius: 3, height: "80vh", display: "flex", flexDirection: "column" },
      }}
    >
      {selectedPost && (
        <Box sx={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
          <Box sx={{ p: 2, borderBottom: "1px solid #eee", flexShrink: 0 }}>
            <Typography fontWeight="bold">{selectedPost.name}</Typography>
            <Typography variant="body2" sx={{ mt: 0.5 }}>{selectedPost.content}</Typography>
          </Box>

          <Box sx={{ flex: 1, overflowY: "auto", p: 2, display: "flex", flexDirection: "column", gap: 2 }}>
            {comments.length === 0 && !isLoadingComments ? (
              <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 4 }}>
                Chưa có bình luận nào. Hãy là người đầu tiên bình luận!
              </Typography>
            ) : (
              comments.map((comment) => (
                <Box key={comment.commentId} sx={{ display: "flex", gap: 1.5, alignItems: "flex-start" }}>
                  <Avatar src={comment.avatar} alt={comment.authorName} sx={{ width: 32, height: 32 }} />
                  <Box sx={{ backgroundColor: "#f0f2f5", p: 1.5, borderRadius: 2, flex: 1 }}>
                    <Typography variant="subtitle2" fontWeight="bold">{comment.authorName}</Typography>
                    <Typography variant="body2" sx={{ wordBreak: "break-word", mt: 0.5 }}>{comment.content}</Typography>
                  </Box>
                </Box>
              ))
            )}

            {hasMoreComments && (
              <Box sx={{ textAlign: "center", my: 1 }}>
                <Button size="small" onClick={handleLoadMore} disabled={isLoadingComments} sx={{ textTransform: "none" }}>
                  {isLoadingComments ? <CircularProgress size={20} /> : "Xem thêm bình luận cũ hơn"}
                </Button>
              </Box>
            )}
          </Box>

          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{ display: "flex", gap: 1, p: 2, borderTop: "1px solid #eee", backgroundColor: "background.paper", flexShrink: 0 }}
          >
            <input
              value={newCommentContent}
              onChange={(e) => setNewCommentContent(e.target.value)}
              placeholder="Viết bình luận..."
              style={{ flex: 1, padding: "10px 14px", borderRadius: "20px", border: "1px solid #ccc", outline: "none" }}
            />
            <Button type="submit" variant="contained" sx={{ backgroundColor: "#1877f2", color: "white", borderRadius: "20px", textTransform: "none", px: 3 }}>
              Gửi
            </Button>
          </Box>
        </Box>
      )}
    </Dialog>
  );
}