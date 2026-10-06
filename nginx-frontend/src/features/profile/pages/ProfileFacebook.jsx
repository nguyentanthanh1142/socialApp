import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Box,
  Container,
  CircularProgress,
  Typography,
  Alert,
} from "@mui/material";
import ProfileHeader from "../components/ProfileHeader";
import ProfileTabs from "../components/ProfileTabs";
import ProfilePosts from "../components/ProfilePosts";
import ProfileFriends from "../components/ProfileFriends";
import ProfilePhotos from "../components/ProfilePhotos";
import { getProfile } from "../services/userService";
import Scene from "../../../components/Scene";
import usePageTitle from "../../../hooks/usePageTitle";

export default function ProfileFacebook() {
  const { username } = useParams();
  const [tab, setTab] = useState(0);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const profileTitle = loading
    ? "Loading Profile..."
    : user
    ? [user.firstName || user.firstname, user.lastName || user.lastname].filter(Boolean).join(" ").trim() || user.username || "Profile"
    : "Profile";

  usePageTitle(profileTitle);

  useEffect(() => {
    let cancelled = false;

    const fetchProfile = async () => {
      if (!username) return;
      setLoading(true);
      setError(null);
      try {
        const response = await getProfile(username);
        if (!cancelled) {
          setUser(response?.data?.result || null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err?.response?.data?.message || "Failed to load profile");
          setUser(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchProfile();
    return () => {
      cancelled = true;
    };
  }, [username]);

  return (
    <Scene hideSideMenu>
      <Container maxWidth="lg" disableGutters sx={{ mt: { xs: 0, sm: 2 }, mb: 4, px: { xs: 0, sm: 2 } }}>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : !user ? (
          <Typography color="text.secondary">User not found</Typography>
        ) : (
          <>
            <ProfileHeader user={user} />
            <ProfileTabs tab={tab} setTab={setTab} />
            <Box sx={{ mt: 3 }}>
              {tab === 0 && <ProfilePosts user={user} />}
              {tab === 1 && <ProfileFriends user={user} />}
              {tab === 2 && <ProfilePhotos user={user} />}
            </Box>
          </>
        )}
      </Container>
    </Scene>
  );
}
