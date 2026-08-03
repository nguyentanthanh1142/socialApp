import { Grid, Box } from "@mui/material";

export default function ProfilePhotos() {
  const photos = [
    "https://via.placeholder.com/200",
    "https://via.placeholder.com/201",
    "https://via.placeholder.com/202",
  ];

  return (
    <Grid container spacing={2}>
      {photos.map((p, idx) => (
        <Grid item xs={4} key={idx}>
          <Box
            component="img"
            src={p}
            alt="photo"
            sx={{ width: "100%", borderRadius: 2 }}
          />
        </Grid>
      ))}
    </Grid>
  );
}
