import { Box, Card, Avatar, Typography } from "@mui/material";

export default function PostCard({ post, isRead, onLike, onOpenComments, onImageClick }) {
  return (
    <Card
      data-id={post.postId}
      className="post-card"
      sx={{
        width: "95%",
        p: 2,
        mb: 2,
        borderRadius: 3,
        boxShadow: 2,
        position: "relative",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
        <Avatar src={post.avatarUrl || ""} alt={post.name} />
        <Box sx={{ ml: 1 }}>
          <Typography fontWeight="bold">{post.name || post.authorName}</Typography>
          <Typography variant="caption" color="text.secondary">
            {post.timestamp || new Date(post.createdDate).toLocaleString()}
          </Typography>
        </Box>
      </Box>

      <Typography sx={{ mb: 1, wordBreak: "break-word" }}>{post.content}</Typography>

      {((post.images && post.images.length > 0) || (post.files && post.files.length > 0)) && (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1, mt: 1 }}>
          {(post.images?.length ? post.images : post.files.map((file) => file.url).filter(Boolean)).map((imageUrl, idx) => (
            <Box
              key={idx}
              component="img"
              src={imageUrl}
              alt={`Ảnh ${idx + 1}`}
              onClick={() =>
                onImageClick(
                  post.images?.length ? post.images : post.files.map((file) => file.url).filter(Boolean),
                  idx
                )
              }
              sx={{
                width: "100%",
                borderRadius: 2,
                objectFit: "cover",
                cursor: "pointer",
                transition: "0.3s",
                "&:hover": { opacity: 0.8 },
              }}
            />
          ))}
        </Box>
      )}

      {isRead && (
        <Typography variant="caption" color="primary" sx={{ position: "absolute", top: 8, right: 12 }}>
          Đã đọc
        </Typography>
      )}

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-around",
          alignItems: "center",
          mt: 1,
          borderTop: "1px solid #eee",
          pt: 1,
        }}
      >
        <Box
          onClick={() => onLike(post.postId)}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.5,
            cursor: "pointer",
            color: post.liked ? "red" : "text.secondary",
            "&:hover": { color: "red" },
          }}
        >
          ❤️
          <Typography variant="body2">{post.likeCount || 0}</Typography>
        </Box>

        <Box
          onClick={() => onOpenComments(post)}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.5,
            cursor: "pointer",
            color: "text.secondary",
            "&:hover": { color: "primary.main" },
          }}
        >
          💬
          <Typography variant="body2">{post.commentCount || 0} bình luận</Typography>
        </Box>
      </Box>
    </Card>
  );
}