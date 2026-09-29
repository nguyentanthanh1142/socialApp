import React from "react";
import { Card, CardContent, Typography, Box } from "@mui/material";
import ArticleIcon from "@mui/icons-material/Article";

export default function ProfilePosts({ user }) {
  const posts = user?.posts || [];

  if (posts.length === 0) {
    return (
      <Card sx={{ p: 4, textAlign: "center", borderRadius: 3, boxShadow: 1 }}>
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
          <ArticleIcon sx={{ fontSize: 48, color: "text.secondary", opacity: 0.5 }} />
          <Typography variant="h6" color="text.secondary">
            No posts available right now.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            When posts are shared, they will appear here.
          </Typography>
        </Box>
      </Card>
    );
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {posts.map((post) => (
        <Card key={post.id || post.postId} sx={{ borderRadius: 3, boxShadow: 2 }}>
          <CardContent>
            <Typography variant="body1">{post.content}</Typography>
            {post.createdDate && (
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
                {new Date(post.createdDate).toLocaleDateString()}
              </Typography>
            )}
          </CardContent>
        </Card>
      ))}
    </Box>
  );
}
