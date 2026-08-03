import { Box, Avatar, Typography, Button } from "@mui/material";

export default function ProfileHeader() {
  return (
    <Box sx={{ position: "relative" }}>
      {/* Cover photo */}
      <Box
        component="img"
        src="https://via.placeholder.com/900x300"
        alt="cover"
        sx={{ width: "100%", height: 300, objectFit: "cover", borderRadius: 2 }}
      />

      {/* Avatar */}
      <Avatar
        src="https://via.placeholder.com/150"
        sx={{
          width: 150,
          height: 150,
          position: "absolute",
          bottom: -75,
          left: 40,
          border: "4px solid white",
        }}
      />

      {/* Name + actions */}
      <Box sx={{ mt: 10, ml: 2 }}>
        <Typography variant="h5" fontWeight="bold">
          Nguyễn Văn A
        </Typography>
        <Typography color="text.secondary">1000 friends</Typography>
        <Box sx={{ mt: 2, display: "flex", gap: 2 }}>
          <Button variant="contained">Add Friend</Button>
          <Button variant="outlined">Message</Button>
        </Box>
      </Box>
    </Box>
  );
}
