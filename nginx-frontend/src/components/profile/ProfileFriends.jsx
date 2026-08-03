import { Grid, Card, CardContent, Avatar, Typography } from "@mui/material";

export default function ProfileFriends() {
  const friends = [
    { id: 1, name: "Trần Văn B", avatar: "https://via.placeholder.com/100" },
    { id: 2, name: "Lê Thị C", avatar: "https://via.placeholder.com/100" },
  ];

  return (
    <Grid container spacing={2}>
      {friends.map((f) => (
        <Grid item xs={6} sm={4} md={3} key={f.id}>
          <Card>
            <CardContent sx={{ textAlign: "center" }}>
              <Avatar src={f.avatar} sx={{ width: 80, height: 80, mx: "auto" }} />
              <Typography sx={{ mt: 1 }}>{f.name}</Typography>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}
