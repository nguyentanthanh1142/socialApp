import React from "react";
import { Grid, Card, CardContent, Avatar, Typography, Box } from "@mui/material";
import PeopleIcon from "@mui/icons-material/People";
import { Link } from "react-router-dom";
import { getAvatarUrl } from "../../../utils/avatarUtils";

export default function ProfileFriends({ user }) {
  const friends = user?.friends || [];

  if (friends.length === 0) {
    return (
      <Card sx={{ p: 4, textAlign: "center", borderRadius: 3, boxShadow: 1 }}>
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
          <PeopleIcon sx={{ fontSize: 48, color: "text.secondary", opacity: 0.5 }} />
          <Typography variant="h6" color="text.secondary">
            No friends to display
          </Typography>
          <Typography variant="body2" color="text.secondary">
            No friends are publicly displayed.
          </Typography>
        </Box>
      </Card>
    );
  }

  return (
    <Grid container spacing={2}>
      {friends.map((f) => {
        const name = f.name || [f.firstname, f.lastname].filter(Boolean).join(" ") || f.username;
        return (
          <Grid item xs={6} sm={4} md={3} key={f.id || f.userId}>
            <Card
              component={Link}
              to={`/u/${f.username || f.id}`}
              sx={{
                textDecoration: "none",
                display: "block",
                transition: "0.2s",
                borderRadius: 3,
                "&:hover": { transform: "translateY(-4px)", boxShadow: 3 },
              }}
            >
              <CardContent sx={{ textAlign: "center" }}>
                <Avatar src={getAvatarUrl(f.avatarUrl || f.avatar, f.gender)} sx={{ width: 80, height: 80, mx: "auto" }}>
                  {!f.avatarUrl && !f.avatar && !f.gender && name?.[0]}
                </Avatar>
                <Typography fontWeight="bold" sx={{ mt: 1, color: "text.primary" }} noWrap>
                  {name}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        );
      })}
    </Grid>
  );
}
