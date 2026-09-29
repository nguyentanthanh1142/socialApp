import { useEffect, useState, useRef, useCallback, useContext } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Card,
  CircularProgress,
  Typography,
  Avatar,
  Divider,
  TextField,
  Button,
  Snackbar,
  Alert,
  Tooltip,
  Tabs,
  Tab,
  Dialog,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import EditIcon from "@mui/icons-material/Edit";
import ArticleIcon from "@mui/icons-material/Article";
import dayjs from "dayjs";
import {
  getMyInfo,
  updateProfile,
  uploadAvatar,
} from "../services/userService";
import { getMyPosts, likePost } from "../../feed/services/postService";
import { isAuthenticated, logOut } from "../../auth/services/authenticationService";
import SideMenu from "../../../components/header/SideMenu";
import Scene from "../../../components/Scene";
import FeedList from "../../feed/components/FeedList";
import CommentDialog from "../../feed/components/CommentDialog";
import useInfiniteScroll from "../../../shared/hooks/useInfiniteScroll";
import { useUser } from "../../../providers/UserProvider";
import { AuthContext } from "../../../context/AuthContext";
import usePageTitle from "../../../hooks/usePageTitle";

export default function Profile() {
  const navigate = useNavigate();
  const { refreshUser } = useUser();
  const { logout } = useContext(AuthContext);

  const [userDetails, setUserDetails] = useState(null);
  const [firstname, setFirstName] = useState("");
  const [lastname, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("");
  const [birthday, setDob] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);

  const profileTitle = loading
    ? "Loading Profile..."
    : userDetails
    ? [userDetails.firstName || userDetails.firstname, userDetails.lastName || userDetails.lastname].filter(Boolean).join(" ").trim() || userDetails.username || "Profile"
    : "Profile";

  usePageTitle(profileTitle);
  const [profileError, setProfileError] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const fileInputRef = useRef(null);

  // Bài viết người dùng & cuộn vô tận
  const [userPosts, setUserPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [isFetching, setIsFetching] = useState(false);

  // Dialog bình luận & Xem ảnh
  const [commentDialogOpen, setCommentDialogOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImages, setPreviewImages] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const normalizePost = useCallback((post) => {
    const images = post.images || post.files?.map((file) => file.url).filter(Boolean) || [];
    const displayName =
      post.name ||
      post.authorName ||
      [userDetails?.firstname, userDetails?.lastname].filter(Boolean).join(" ") ||
      userDetails?.username ||
      "User";
    const userAvatar = post.avatarUrl || post.avatar || userDetails?.avatar || "";

    return {
      ...post,
      postId: post.postId ?? post.id,
      name: displayName,
      authorName: displayName,
      avatarUrl: userAvatar,
      avatar: userAvatar,
      createdDate: post.createdDate || post.createDate || post.createdAt || new Date().toISOString(),
      images,
      files: post.files?.length ? post.files : images.map((url) => ({ url })),
      likeCount: post.likeCount ?? post.likesCount ?? 0,
      commentCount: post.commentCount ?? (post.comments ? post.comments.length : 0),
      liked: Boolean(post.liked || post.isLiked),
    };
  }, [userDetails]);

  // Gọi API phân trang cho bài viết cá nhân
  const fetchNextPage = async () => {
    if (isFetching || !hasNextPage) return;
    setIsFetching(true);

    try {
      const nextPageNum = page + 1;
      const res = await getMyPosts(nextPageNum);
      const resData = res?.data?.result || res?.result || res?.data || [];
      const incomingPosts = Array.isArray(resData) ? resData : resData?.data || [];

      if (incomingPosts.length > 0) {
        setUserPosts((prev) => {
          const existingIds = new Set(prev.map((p) => p.postId));
          return [
            ...prev,
            ...incomingPosts.map(normalizePost).filter((p) => !existingIds.has(p.postId)),
          ];
        });
        setPage(nextPageNum);
        if (incomingPosts.length < 10) {
          setHasNextPage(false);
        }
      } else {
        setHasNextPage(false);
      }
    } catch (err) {
      console.warn("Failed to load more user posts:", err);
      setHasNextPage(false);
    } finally {
      setIsFetching(false);
    }
  };

  const { lastElementRef } = useInfiniteScroll({
    hasNextPage,
    isFetching,
    fetchNextPage,
  });

  const getUserDetails = async () => {
    try {
      setLoading(true);
      setProfileError(null);
      const response = await getMyInfo();
      const data = response.data;
      const result = data.result || data;

      setUserDetails(result);
      setFirstName(result.firstname || "");
      setLastName(result.lastname || "");
      setEmail(result.email || "");
      setCity(result.city || "");
      setDob(result.birthday ? dayjs(result.birthday) : null);

      // Load trang đầu tiên của bài viết
      try {
        const postRes = await getMyPosts(1);
        const postData = postRes?.data?.result || postRes?.result || postRes?.data || [];
        const initialPosts = Array.isArray(postData) ? postData : postData?.data || [];
        setUserPosts(initialPosts.map(normalizePost));
        setHasNextPage(initialPosts.length >= 10);
      } catch (postErr) {
        console.warn("Error loading user posts:", postErr);
        setUserPosts([]);
        setHasNextPage(false);
      }
    } catch (error) {
      if (error.response?.status === 401) {
        if (typeof logout === "function") {
          logout();
        } else {
          logOut();
        }
        navigate("/login");
      } else {
        console.error("Error loading profile:", error);
        setProfileError("Unable to load your profile right now.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLikePost = (postId) => {
    setUserPosts((posts) =>
      posts.map((post) => {
        if (post.postId !== postId) return post;
        const newLiked = !post.liked;
        return {
          ...post,
          liked: newLiked,
          likeCount: Math.max(0, (post.likeCount || 0) + (newLiked ? 1 : -1)),
        };
      })
    );
    likePost(postId).catch((err) => console.error("Error liking post:", err));
  };

  const handleOpenComments = (post) => {
    setSelectedPost(post);
    setCommentDialogOpen(true);
  };

  const handleCommentAdded = (postId) => {
    setUserPosts((prevPosts) =>
      prevPosts.map((p) =>
        p.postId === postId ? { ...p, commentCount: (p.commentCount || 0) + 1 } : p
      )
    );
  };

  const handleImageClick = (imgs, idx = 0) => {
    const list = Array.isArray(imgs) ? imgs : [imgs];
    setPreviewImages(list);
    setCurrentImageIndex(idx);
    setPreviewOpen(true);
  };

  const handleUpdate = async () => {
    try {
      const profileData = {
        firstname,
        lastname,
        email,
        city,
        birthday: birthday ? birthday.format("YYYY-MM-DD") : null,
      };

      await updateProfile(profileData);
      setUserDetails((prev) => ({ ...prev, ...profileData }));
      refreshUser();
      setSnackbarMessage("Profile updated successfully!");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
    } catch (error) {
      console.error("Error updating profile:", error);
      setSnackbarMessage("Update failed. Please try again.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.match("image.*")) {
      setSnackbarMessage("Please select a valid image file.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("file", file);

      const response = await uploadAvatar(formData);
      const imageUrl = response.data?.result?.avatar || response.data?.result;

      setUserDetails((prev) => ({ ...prev, avatar: imageUrl }));
      refreshUser();
      setSnackbarMessage("Avatar updated successfully!");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
    } catch (error) {
      console.error("Error uploading avatar:", error);
      setSnackbarMessage("Failed to upload image. Please try again.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    } finally {
      setUploading(false);
    }
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === "clickaway") return;
    setSnackbarOpen(false);
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate("/login");
    } else {
      getUserDetails();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  return (
    <Scene sideMenu={<SideMenu />}>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: "100%" }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>

      {loading ? (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: "20px",
            justifyContent: "center",
            alignItems: "center",
            height: "80vh",
          }}
        >
          <CircularProgress />
          <Typography>Loading profile...</Typography>
        </Box>
      ) : profileError ? (
        <Box sx={{ maxWidth: 500, width: "100%", mx: "auto", mt: 5 }}>
          <Alert
            severity="warning"
            action={
              <Button color="inherit" size="small" onClick={getUserDetails}>
                Retry
              </Button>
            }
          >
            {profileError}
          </Alert>
        </Box>
      ) : userDetails ? (
        <Box sx={{ maxWidth: 850, width: "100%", mx: "auto", pb: 5 }}>
          {/* PROFILE HEADER */}
          <Card sx={{ boxShadow: 3, borderRadius: 3, overflow: "hidden", mb: 3 }}>
            <Box
              sx={{
                height: 220,
                backgroundColor: "#1976d2",
                backgroundImage: "linear-gradient(135deg, #1877f2 0%, #00c6ff 100%)",
                position: "relative",
              }}
            />

            <Box
              sx={{
                px: 4,
                pb: 3,
                pt: 1,
                position: "relative",
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                alignItems: { xs: "center", sm: "flex-end" },
                justifyContent: "space-between",
                mt: "-75px",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  flexDirection: { xs: "column", sm: "row" },
                  alignItems: "center",
                  gap: 3,
                  textAlign: { xs: "center", sm: "left" },
                }}
              >
                <Tooltip title="Click to change avatar">
                  <Box sx={{ position: "relative" }}>
                    <Avatar
                      src={userDetails.avatarUrl || userDetails.avatar}
                      sx={{
                        width: 140,
                        height: 140,
                        fontSize: 48,
                        bgcolor: "#fff",
                        color: "#1976d2",
                        border: "4px solid white",
                        boxShadow: 3,
                        cursor: "pointer",
                        "&:hover": { opacity: 0.9 },
                      }}
                      onClick={handleAvatarClick}
                    >
                      {userDetails.firstname?.[0]}
                      {userDetails.lastname?.[0]}
                    </Avatar>

                    <Box
                      onClick={handleAvatarClick}
                      sx={{
                        position: "absolute",
                        bottom: 5,
                        right: 5,
                        backgroundColor: "#f0f2f5",
                        borderRadius: "50%",
                        p: 1,
                        boxShadow: 1,
                        cursor: "pointer",
                        "&:hover": { backgroundColor: "#e4e6eb" },
                      }}
                    >
                      <PhotoCameraIcon sx={{ color: "#333", fontSize: 20 }} />
                    </Box>

                    {uploading && (
                      <Box
                        sx={{
                          position: "absolute",
                          inset: 0,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          borderRadius: "50%",
                          backgroundColor: "rgba(0, 0, 0, 0.4)",
                        }}
                      >
                        <CircularProgress size={36} sx={{ color: "white" }} />
                      </Box>
                    )}
                  </Box>
                </Tooltip>

                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  style={{ display: "none" }}
                  onChange={handleFileSelect}
                />

                <Box sx={{ mt: { xs: 1, sm: "50px" } }}>
                  <Typography variant="h5" fontWeight="bold">
                    {userDetails.firstname || userDetails.lastname
                      ? `${userDetails.firstname || ""} ${userDetails.lastname || ""}`.trim()
                      : userDetails.username}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    @{userDetails.username} • {userDetails.city || "City not set"}
                  </Typography>
                </Box>
              </Box>
            </Box>

            <Divider />
            <Tabs value={tabValue} onChange={handleTabChange} centered sx={{ bgcolor: "#fff" }}>
              <Tab icon={<ArticleIcon />} iconPosition="start" label="My Posts" />
              <Tab icon={<EditIcon />} iconPosition="start" label="Edit Profile" />
            </Tabs>
          </Card>

          {/* TAB 0: HIỂN THỊ BÀI VIẾT KẾT HỢP INFINITE SCROLL */}
          {tabValue === 0 && (
            <FeedList
              posts={userPosts}
              loading={isFetching}
              feedError={null}
              readPosts={[]}
              onLike={handleLikePost}
              onOpenComments={handleOpenComments}
              onImageClick={handleImageClick}
              lastPostElementRef={lastElementRef}
            />
          )}

          {/* TAB 1: FORM CHỈNH SỬA THÔNG TIN */}
          {tabValue === 1 && (
            <Card sx={{ p: 4, boxShadow: 3, borderRadius: 2 }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ mb: 3 }}>
                Edit Personal Profile
              </Typography>

              <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
                <Box sx={{ display: "flex", gap: 2, flexDirection: { xs: "column", sm: "row" } }}>
                  <TextField
                    label="First Name"
                    variant="outlined"
                    fullWidth
                    size="small"
                    value={firstname}
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                  <TextField
                    label="Last Name"
                    variant="outlined"
                    fullWidth
                    size="small"
                    value={lastname}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                </Box>

                <TextField
                  label="Email"
                  variant="outlined"
                  fullWidth
                  size="small"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />

                <TextField
                  label="Current City"
                  variant="outlined"
                  fullWidth
                  size="small"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                />

                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    label="Birthday"
                    value={birthday}
                    onChange={(newValue) => setDob(newValue)}
                    slotProps={{ textField: { size: "small", fullWidth: true } }}
                  />
                </LocalizationProvider>

                <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleUpdate}
                    sx={{ px: 4, py: 1, fontWeight: "bold" }}
                  >
                    Save Changes
                  </Button>
                </Box>
              </Box>
            </Card>
          )}
        </Box>
      ) : null}

      {/* Dialog phóng to ảnh */}
      <Dialog
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { backgroundColor: "black", color: "white", position: "relative" } }}
      >
        {previewImages.length > 0 && (
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", p: 2 }}>
            <Box
              component="img"
              src={previewImages[currentImageIndex]}
              alt="Preview"
              sx={{ width: "100%", height: "auto", maxHeight: "80vh", objectFit: "contain", borderRadius: 2 }}
            />
            <Typography variant="caption" sx={{ mt: 1, opacity: 0.7 }}>
              {currentImageIndex + 1} / {previewImages.length}
            </Typography>
          </Box>
        )}
      </Dialog>

      {/* Dialog Bình luận */}
      <CommentDialog
        open={commentDialogOpen}
        onClose={() => setCommentDialogOpen(false)}
        selectedPost={selectedPost}
        onCommentAdded={handleCommentAdded}
        currentUser={userDetails}
      />
    </Scene>
  );
}