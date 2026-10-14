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
  Grid,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import EditIcon from "@mui/icons-material/Edit";
import ArticleIcon from "@mui/icons-material/Article";
import CollectionsIcon from "@mui/icons-material/Collections";
import PersonIcon from "@mui/icons-material/Person";
import LocationCityIcon from "@mui/icons-material/LocationCity";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import EmailIcon from "@mui/icons-material/Email";
import CakeIcon from "@mui/icons-material/Cake";
import WcIcon from "@mui/icons-material/Wc";
import SaveIcon from "@mui/icons-material/Save";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import dayjs from "dayjs";
import {
  getMyInfo,
  updateProfile,
  uploadAvatar,
} from "../services/userService";
import { getMyPosts, likePost } from "../../feed/services/postService";
import { isAuthenticated, logOut } from "../../auth/services/authenticationService";
import Scene from "../../../components/Scene";
import ProfileCoverLayout from "../components/ProfileCoverLayout";
import FeedList from "../../feed/components/FeedList";
import CommentDialog from "../../feed/components/CommentDialog";
import useInfiniteScroll from "../../../shared/hooks/useInfiniteScroll";
import { useUser } from "../../../providers/UserProvider";
import { AuthContext } from "../../../context/AuthContext";
import usePageTitle from "../../../hooks/usePageTitle";
import { getAvatarUrl } from "../../../utils/avatarUtils";
import { formatRelativeTime, parseValidDate } from "../../../utils/dateUtils";

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
  const [updateLoading, setUpdateLoading] = useState(false);

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
    const userAvatar = getAvatarUrl(post.avatarUrl || post.avatar || userDetails?.avatar, post.gender || userDetails?.gender);

    const rawCreated =
      post.createdDate || post.createDate || post.createdAt || new Date().toISOString();
    const parsed = parseValidDate(rawCreated);
    const createdDate = parsed ? parsed.toISOString() : new Date().toISOString();

    return {
      ...post,
      postId: post.postId ?? post.id,
      name: displayName,
      authorName: displayName,
      avatarUrl: userAvatar,
      avatar: userAvatar,
      createdDate,
      timestamp: formatRelativeTime(rawCreated),
      images,
      files: post.files?.length ? post.files : images.map((url) => ({ url })),
      likeCount: post.likeCount ?? post.likesCount ?? 0,
      commentCount: post.commentCount ?? (post.comments ? post.comments.length : 0),
      liked: Boolean(post.liked || post.isLiked),
      privacy: post.privacy || "PUBLIC",
      actions: post.actions || ["EDIT", "DELETE", "SAVE", "SHARE"],
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
    setUpdateLoading(true);
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
    } finally {
      setUpdateLoading(false);
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
    <Scene hideSideMenu>
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
        <Box sx={{ maxWidth: 1100, width: "100%", mx: "auto", pb: 5, px: { xs: 0, sm: 2 } }}>
          <ProfileCoverLayout
            coverUrl={userDetails.coverUrl}
            avatarUrl={getAvatarUrl(userDetails.avatarUrl || userDetails.avatar, userDetails.gender)}
            gender={userDetails.gender}
            displayName={
              userDetails.firstName || userDetails.lastName
                ? `${userDetails.firstName || userDetails.firstname || ""} ${userDetails.lastName || userDetails.lastname || ""}`.trim()
                : userDetails.username
            }
            subtitle={`@${userDetails.username} • ${userDetails.city || userDetails.currentCity || "City not set"}`}
            avatarSlot={
              <Tooltip title="Click to change avatar">
                <Box sx={{ position: "relative" }}>
                  <Avatar
                    src={getAvatarUrl(userDetails.avatarUrl || userDetails.avatar, userDetails.gender)}
                    sx={{
                      width: { xs: 128, sm: 152, md: 168 },
                      height: { xs: 128, sm: 152, md: 168 },
                      fontSize: { xs: 40, md: 52 },
                      bgcolor: "primary.main",
                      border: "4px solid",
                      borderColor: "background.paper",
                      boxShadow: 2,
                      cursor: "pointer",
                      "&:hover": { opacity: 0.92 },
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
                      bottom: 8,
                      right: 8,
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
            }
          />

          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            style={{ display: "none" }}
            onChange={handleFileSelect}
          />

          <Card sx={{ boxShadow: 1, borderRadius: 3, overflow: "hidden", mb: 3, border: "1px solid", borderColor: "divider" }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              variant="scrollable"
              scrollButtons="auto"
              sx={{ bgcolor: "#fff", px: 1 }}
            >
              <Tab icon={<ArticleIcon />} iconPosition="start" label="My Posts" />
              <Tab icon={<CollectionsIcon />} iconPosition="start" label="Photos" />
              <Tab icon={<EditIcon />} iconPosition="start" label="Edit Profile" />
            </Tabs>
          </Card>

          {tabValue === 0 && (() => {
            // ── Trích ảnh xem trước cho sidebar ──
            const sidebarPhotos = userPosts.flatMap((post) => {
              const files = post.files || [];
              const images = post.images || [];
              const fromFiles = files
                .filter((f) => {
                  const url = typeof f === "string" ? f : f.url || "";
                  const type = typeof f === "string" ? "" : f.type || "";
                  return type !== "video" && !/\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(url);
                })
                .map((f) => (typeof f === "string" ? f : f.url));
              const fromImages = images.filter(
                (url) => !/\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(url)
              );
              return [...new Set([...fromFiles, ...fromImages])].filter(Boolean);
            }).slice(0, 9);

            const infoRows = [
              {
                icon: <LocationOnIcon sx={{ color: "text.secondary", fontSize: 20 }} />,
                label: userDetails?.city || userDetails?.currentCity || null,
                placeholder: "Thêm thành phố",
              },
              {
                icon: <CakeIcon sx={{ color: "text.secondary", fontSize: 20 }} />,
                label: userDetails?.birthday
                  ? dayjs(userDetails.birthday).format("DD/MM/YYYY")
                  : null,
                placeholder: "Thêm ngày sinh",
              },
              {
                icon: <EmailIcon sx={{ color: "text.secondary", fontSize: 20 }} />,
                label: userDetails?.email || null,
                placeholder: "Thêm email",
              },
              {
                icon: <WcIcon sx={{ color: "text.secondary", fontSize: 20 }} />,
                label: userDetails?.gender
                  ? userDetails.gender === "MALE"
                    ? "Nam"
                    : userDetails.gender === "FEMALE"
                    ? "Nữ"
                    : userDetails.gender
                  : null,
                placeholder: "Thêm giới tính",
              },
            ];

            return (
              <Grid container spacing={2.5} alignItems="flex-start">
                {/* ── Cột trái: Sidebar ── */}
                <Grid item xs={12} md={4}>
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>

                    {/* Card Giới thiệu */}
                    <Card
                      sx={{
                        borderRadius: 3,
                        boxShadow: "0 2px 10px rgba(0,0,0,0.07)",
                        border: "1px solid",
                        borderColor: "divider",
                        p: 2.5,
                      }}
                    >
                      <Typography fontWeight={700} fontSize="1.05rem" mb={2}>
                        Giới thiệu
                      </Typography>

                      <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                        {infoRows.map((row, idx) => (
                          <Box
                            key={idx}
                            sx={{ display: "flex", alignItems: "center", gap: 1.25 }}
                          >
                            {row.icon}
                            {row.label ? (
                              <Typography variant="body2" sx={{ lineHeight: 1.4 }}>
                                {row.label}
                              </Typography>
                            ) : (
                              <Typography
                                variant="body2"
                                color="text.disabled"
                                sx={{
                                  fontStyle: "italic",
                                  cursor: "pointer",
                                  "&:hover": { textDecoration: "underline" },
                                }}
                                onClick={() => setTabValue(2)}
                              >
                                {row.placeholder}
                              </Typography>
                            )}
                          </Box>
                        ))}
                      </Box>

                      <Divider sx={{ my: 2 }} />
                      <Button
                        fullWidth
                        variant="outlined"
                        size="small"
                        startIcon={<EditIcon />}
                        onClick={() => setTabValue(2)}
                        sx={{
                          textTransform: "none",
                          fontWeight: 600,
                          borderRadius: 2,
                          borderColor: "divider",
                          color: "text.primary",
                          "&:hover": { bgcolor: "action.hover", borderColor: "text.secondary" },
                        }}
                      >
                        Chỉnh sửa thông tin
                      </Button>
                    </Card>

                    {/* Card Ảnh xem trước */}
                    <Card
                      sx={{
                        borderRadius: 3,
                        boxShadow: "0 2px 10px rgba(0,0,0,0.07)",
                        border: "1px solid",
                        borderColor: "divider",
                        p: 2.5,
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          mb: 1.5,
                        }}
                      >
                        <Typography fontWeight={700} fontSize="1.05rem">
                          Ảnh
                        </Typography>
                        <Button
                          size="small"
                          endIcon={<ChevronRightIcon />}
                          onClick={() => setTabValue(1)}
                          sx={{
                            textTransform: "none",
                            fontWeight: 600,
                            color: "primary.main",
                            fontSize: "0.8rem",
                          }}
                        >
                          Xem tất cả
                        </Button>
                      </Box>

                      {sidebarPhotos.length === 0 ? (
                        <Box
                          sx={{
                            py: 3,
                            textAlign: "center",
                            border: "1px dashed",
                            borderColor: "divider",
                            borderRadius: 2,
                          }}
                        >
                          <CollectionsIcon sx={{ fontSize: 36, color: "text.disabled", mb: 0.5 }} />
                          <Typography variant="caption" color="text.disabled" display="block">
                            Chưa có ảnh nào
                          </Typography>
                        </Box>
                      ) : (
                        <Box
                          sx={{
                            display: "grid",
                            gridTemplateColumns: "repeat(3, 1fr)",
                            gap: 0.75,
                          }}
                        >
                          {sidebarPhotos.map((url, idx) => (
                            <Box
                              key={idx}
                              onClick={() => handleImageClick(sidebarPhotos, idx)}
                              sx={{
                                aspectRatio: "1 / 1",
                                borderRadius: 1.5,
                                overflow: "hidden",
                                cursor: "pointer",
                                position: "relative",
                                "&:hover img": { transform: "scale(1.08)", opacity: 0.85 },
                              }}
                            >
                              <Box
                                component="img"
                                src={url}
                                alt={`photo-${idx}`}
                                sx={{
                                  width: "100%",
                                  height: "100%",
                                  objectFit: "cover",
                                  display: "block",
                                  transition: "transform 0.3s ease, opacity 0.3s ease",
                                }}
                              />
                            </Box>
                          ))}
                        </Box>
                      )}
                    </Card>
                  </Box>
                </Grid>

                {/* ── Cột phải: Feed ── */}
                <Grid item xs={12} md={8}>
                  <Box
                    sx={{
                      "& .post-card": {
                        maxWidth: "100% !important",
                        width: "100% !important",
                      },
                    }}
                  >
                    <FeedList
                      posts={userPosts}
                      loading={isFetching}
                      feedError={null}
                      readPosts={[]}
                      fullWidth
                      onLike={handleLikePost}
                      onOpenComments={handleOpenComments}
                      onImageClick={handleImageClick}
                      lastPostElementRef={lastElementRef}
                      onDeletePost={(postId) =>
                        setUserPosts((prev) => prev.filter((p) => p.postId !== postId))
                      }
                      onUpdatePost={(up) =>
                        setUserPosts((prev) =>
                          prev.map((p) => (p.postId === up.postId ? { ...p, ...up } : p))
                        )
                      }
                      onPrivacyChange={(postId, privacy) =>
                        setUserPosts((prev) =>
                          prev.map((p) => (p.postId === postId ? { ...p, privacy } : p))
                        )
                      }
                    />
                  </Box>
                </Grid>
              </Grid>
            );
          })()}

          {/* ── Photos Tab ──────────────────────────────────────────────── */}
          {tabValue === 1 && (() => {
            const allPhotos = userPosts.flatMap((post) => {
              const files = post.files || [];
              const images = post.images || [];
              const fromFiles = files
                .filter((f) => {
                  const url = typeof f === "string" ? f : f.url || "";
                  const type = typeof f === "string" ? "" : f.type || "";
                  return type !== "video" && !/\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(url);
                })
                .map((f) => (typeof f === "string" ? f : f.url));
              const fromImages = images.filter(
                (url) => !/\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(url)
              );
              const merged = [...new Set([...fromFiles, ...fromImages])].filter(Boolean);
              return merged.map((url) => ({ url, postId: post.postId }));
            });

            return allPhotos.length === 0 ? (
              <Card
                sx={{
                  p: 6,
                  textAlign: "center",
                  borderRadius: 3,
                  border: "1px dashed",
                  borderColor: "divider",
                  boxShadow: 0,
                }}
              >
                <CollectionsIcon sx={{ fontSize: 56, color: "text.disabled", mb: 1.5 }} />
                <Typography variant="h6" color="text.secondary" fontWeight={600}>
                  No photos yet
                </Typography>
                <Typography variant="body2" color="text.disabled" mt={0.5}>
                  Photos from your posts will appear here.
                </Typography>
              </Card>
            ) : (
              <Box>
                <Typography
                  variant="subtitle1"
                  fontWeight={700}
                  sx={{ mb: 2, color: "text.secondary", letterSpacing: 0.3 }}
                >
                  {allPhotos.length} photo{allPhotos.length !== 1 ? "s" : ""}
                </Typography>
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: {
                      xs: "repeat(2, 1fr)",
                      sm: "repeat(3, 1fr)",
                      md: "repeat(4, 1fr)",
                    },
                    gap: 1.25,
                  }}
                >
                  {allPhotos.map((photo, idx) => (
                    <Box
                      key={`${photo.postId}-${idx}`}
                      onClick={() => handleImageClick(allPhotos.map((p) => p.url), idx)}
                      sx={{
                        aspectRatio: "1 / 1",
                        borderRadius: 2.5,
                        overflow: "hidden",
                        cursor: "pointer",
                        position: "relative",
                        bgcolor: "grey.100",
                        "&:hover .photo-overlay": { opacity: 1 },
                        "&:hover img": { transform: "scale(1.07)" },
                      }}
                    >
                      <Box
                        component="img"
                        src={photo.url}
                        alt={`Photo ${idx + 1}`}
                        sx={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          display: "block",
                          transition: "transform 0.35s ease",
                        }}
                      />
                      <Box
                        className="photo-overlay"
                        sx={{
                          position: "absolute",
                          inset: 0,
                          bgcolor: "rgba(0,0,0,0.28)",
                          opacity: 0,
                          transition: "opacity 0.25s ease",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <CollectionsIcon sx={{ color: "white", fontSize: 30, opacity: 0.9 }} />
                      </Box>
                    </Box>
                  ))}
                </Box>
              </Box>
            );
          })()}

          {/* ── Edit Profile Tab ─────────────────────────────────────────── */}
          {tabValue === 2 && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
              {/* ── Card 1: Basic Information ── */}
              <Card
                sx={{
                  borderRadius: 3,
                  boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
                  border: "1px solid",
                  borderColor: "divider",
                  overflow: "visible",
                }}
              >
                <Box
                  sx={{
                    px: 3,
                    pt: 2.5,
                    pb: 1,
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    borderBottom: "1px solid",
                    borderColor: "divider",
                  }}
                >
                  <PersonIcon sx={{ color: "primary.main", fontSize: 22 }} />
                  <Typography fontWeight={700} fontSize="0.95rem" color="primary.main">
                    Basic Information
                  </Typography>
                </Box>

                <Box
                  sx={{
                    px: 3,
                    pt: 3,
                    pb: 3,
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                    gap: 2.5,
                  }}
                >
                  <TextField
                    label="First Name"
                    variant="outlined"
                    fullWidth
                    size="small"
                    value={firstname}
                    onChange={(e) => setFirstName(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <PersonIcon sx={{ color: "text.disabled", fontSize: 18, mr: 0.75 }} />
                      ),
                    }}
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                  />
                  <TextField
                    label="Last Name"
                    variant="outlined"
                    fullWidth
                    size="small"
                    value={lastname}
                    onChange={(e) => setLastName(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <PersonIcon sx={{ color: "text.disabled", fontSize: 18, mr: 0.75 }} />
                      ),
                    }}
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                  />
                </Box>
              </Card>

              {/* ── Card 2: Contact & Details ── */}
              <Card
                sx={{
                  borderRadius: 3,
                  boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
                  border: "1px solid",
                  borderColor: "divider",
                  overflow: "visible",
                }}
              >
                <Box
                  sx={{
                    px: 3,
                    pt: 2.5,
                    pb: 1,
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    borderBottom: "1px solid",
                    borderColor: "divider",
                  }}
                >
                  <EmailIcon sx={{ color: "primary.main", fontSize: 22 }} />
                  <Typography fontWeight={700} fontSize="0.95rem" color="primary.main">
                    Contact &amp; Details
                  </Typography>
                </Box>

                <Box
                  sx={{
                    px: 3,
                    pt: 3,
                    pb: 3,
                    display: "flex",
                    flexDirection: "column",
                    gap: 2.5,
                  }}
                >
                  <TextField
                    label="Email"
                    variant="outlined"
                    fullWidth
                    size="small"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <EmailIcon sx={{ color: "text.disabled", fontSize: 18, mr: 0.75 }} />
                      ),
                    }}
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                  />

                  <TextField
                    label="Current City"
                    variant="outlined"
                    fullWidth
                    size="small"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <LocationCityIcon sx={{ color: "text.disabled", fontSize: 18, mr: 0.75 }} />
                      ),
                    }}
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                  />

                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      label="Birthday"
                      value={birthday}
                      onChange={(newValue) => setDob(newValue)}
                      slotProps={{
                        textField: {
                          size: "small",
                          fullWidth: true,
                          InputProps: {
                            startAdornment: (
                              <CakeIcon sx={{ color: "text.disabled", fontSize: 18, mr: 0.75 }} />
                            ),
                          },
                          sx: { "& .MuiOutlinedInput-root": { borderRadius: 2 } },
                        },
                      }}
                    />
                  </LocalizationProvider>
                </Box>
              </Card>

              {/* ── Save Button Row ── */}
              <Box sx={{ display: "flex", justifyContent: "flex-end", pt: 0.5 }}>
                <Button
                  variant="contained"
                  size="large"
                  onClick={handleUpdate}
                  disabled={updateLoading}
                  startIcon={
                    updateLoading ? (
                      <CircularProgress size={18} sx={{ color: "inherit" }} />
                    ) : (
                      <SaveIcon />
                    )
                  }
                  sx={{
                    px: 4,
                    py: 1.25,
                    fontWeight: 700,
                    fontSize: "0.92rem",
                    borderRadius: 2.5,
                    textTransform: "none",
                    background: "linear-gradient(135deg, #1877f2 0%, #42a5f5 100%)",
                    boxShadow: "0 4px 14px rgba(24,119,242,0.35)",
                    transition: "all 0.2s ease",
                    "&:hover": {
                      background: "linear-gradient(135deg, #166fe5 0%, #1e88e5 100%)",
                      boxShadow: "0 6px 20px rgba(24,119,242,0.45)",
                      transform: "translateY(-1px)",
                    },
                    "&:active": { transform: "translateY(0px)" },
                    "&.Mui-disabled": { opacity: 0.7 },
                  }}
                >
                  {updateLoading ? "Saving..." : "Save Changes"}
                </Button>
              </Box>
            </Box>
          )}
        </Box>
      ) : null}

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