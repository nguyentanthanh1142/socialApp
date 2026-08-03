import { Card, CardContent, Typography } from "@mui/material";

export default function ProfilePosts() {
  const posts = [
    { id: 1, content: "Hello world! My first post 🚀" },
    { id: 2, content: "Enjoying the sunshine ☀️" },
  ];

  return (
    <>
      {posts.map((post) => (
        <Card key={post.id} sx={{ mb: 2 }}>
          <CardContent>
            <Typography>{post.content}</Typography>
          </CardContent>
        </Card>
      ))}
    </>
  );
}
