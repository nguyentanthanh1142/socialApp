import { useEffect, useState } from "react";
import { Box, Container } from "@mui/material";
import ProfileHeader from "../components/profile/ProfileHeader";
import ProfileTabs from "../components/profile/ProfileTabs";
import ProfilePosts from "../components/profile/ProfilePosts";
import ProfileFriends from "../components/profile/ProfileFriends";
import ProfilePhotos from "../components/profile/ProfilePhotos";
import {
  getProfile,
} from "../services/userService";

export default function Profile() {
  const [tab, setTab] = useState(0);
  const [user,setUser] = useState(null);



  return (
    <Container maxWidth="lg" sx={{ mt: 2 }}>
      {/* Header: Cover + Avatar + Info */}
      <ProfileHeader />

      {/* Tabs điều hướng */}
      <ProfileTabs tab={tab} setTab={setTab} />

      {/* Nội dung theo tab */}
      <Box sx={{ mt: 3 }}>
        {tab === 0 && <ProfilePosts />}
        {tab === 1 && <ProfileFriends />}
        {tab === 2 && <ProfilePhotos />}
        {/* Bạn có thể thêm tab About nữa */}
      </Box>
    </Container>
  );
}
