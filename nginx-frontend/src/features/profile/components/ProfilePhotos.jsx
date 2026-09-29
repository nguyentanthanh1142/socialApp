import React from "react";
import { Grid, Box, Card, Typography } from "@mui/material";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";

export default function ProfilePhotos({ user }) {
  const photos = user?.photos || (user?.avatarUrl || user?.avatar ? [user.avatarUrl || user.avatar] : []);

  if (photos.length === 0) {
    return (
      <Card sx={{ p: 4, textAlign: "center", borderRadius: 3, boxShadow: 1 }}>
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
          <PhotoCameraIcon sx={{ fontSize: 48, color: "text.secondary", opacity: 0.5 }} />
          <Typography variant="h6" color="text.secondary">
            No photos available
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Uploaded photos will appear here.
          </Typography>
        </Box>
      </Card>
    );
  }

  return (
    <Grid container spacing={2}>
      {photos.map((p, idx) => (
        <Grid item xs={6} sm={4} md={3} key={idx}>
          <Box
            component="img"
            src={p}
            alt={`photo-${idx}`}
            sx={{
              width: "100%",
              height: 180,
              objectFit: "cover",
              borderRadius: 2,
              boxShadow: 1,
              transition: "0.2s",
              "&:hover": { transform: "scale(1.02)" },
            }}
          />
        </Grid>
      ))}
    </Grid>
  );
}
