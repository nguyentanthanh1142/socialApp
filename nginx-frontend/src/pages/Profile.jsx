import { useEffect, useState, useRef } from "react";
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
import { isAuthenticated, logOut } from "../services/authenticationService";
import SideMenu from "../components/header/SideMenu";
import Scene from "./Scene";
import FeedList from "../components/feed/FeedList";
import useInfiniteScroll from "../components/hooks/useInfiniteScroll"; // Đường dẫn đến hook của bạn

export default function Profile() {
  const navigate = useNavigate();
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
  const [profileError, setProfileError] = useState(null);
  const [tabValue, setTabValue] = useState(0); 
  const fileInputRef = useRef(null);

  // === DỮ LIỆU MẪU NHIỀU TRANG (6 TRANG, 18 BÀI VIẾT) ĐỂ TEST INFINITE SCROLL ===
  const [userPosts, setUserPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [isFetching, setIsFetching] = useState(false);

  const mockDatabasePages = {
    1: [
      {
        postId: 1,
        content: "Chào mừng đến với trang cá nhân mạng xã hội của tôi! Đây là bài viết khởi đầu.",
        createdAt: "2 tuần trước",
        likesCount: 12,
        isLiked: false,
        comments: [{ id: 101, author: "Minh Quân", text: "Tuyệt vời quá bạn ơi!" }]
      },
      {
        postId: 2,
        content: "Đang hoàn thiện những bước cuối cùng cho đồ án tốt nghiệp ReactJS & Spring Boot!",
        createdAt: "1 tuần trước",
        likesCount: 25,
        isLiked: true,
        comments: [{ id: 102, author: "Thầy Hùng", text: "Cố lên em, sắp bảo vệ rồi!" }]
      },
      {
        postId: 3,
        content: "Hôm nay thời tiết ở thành phố thật đẹp, thích hợp để ngồi coder cả ngày 💻✨",
        createdAt: "Hôm qua",
        likesCount: 8,
        isLiked: false,
        comments: []
      }
    ],
    2: [
      {
        postId: 4,
        content: "Vừa tối ưu xong custom hook `useInfiniteScroll`, code gọn hơn hẳn mọi người ạ!",
        createdAt: "3 ngày trước",
        likesCount: 41,
        isLiked: true,
        comments: [{ id: 103, author: "Gia Hân", text: "Xin ké chút source code với ô ơi 😎" }]
      },
      {
        postId: 5,
        content: "Chia sẻ một chút kinh nghiệm cấu hình Material UI v5 kết hợp với Emotion cho các dự án lớn.",
        createdAt: "5 ngày trước",
        likesCount: 19,
        isLiked: false,
        comments: []
      },
      {
        postId: 6,
        content: "Chạy bộ buổi sáng giúp tinh thần sảng khoái và tập trung code tốt hơn rất nhiều.",
        createdAt: "6 ngày trước",
        likesCount: 30,
        isLiked: true,
        comments: []
      }
    ],
    3: [
      {
        postId: 7,
        content: "Đã fix xong bug liên quan đến phân quyền JWT Authentication trong Spring Security. Quá đã!",
        createdAt: "1 tuần trước",
        likesCount: 55,
        isLiked: true,
        comments: [{ id: 104, author: "Admin", text: "Xuất sắc!" }]
      },
      {
        postId: 8,
        content: "Đang tìm hiểu thêm về Docker và cách deploy ứng dụng Fullstack lên VPS riêng.",
        createdAt: "2 tuần trước",
        likesCount: 14,
        isLiked: false,
        comments: []
      },
      {
        postId: 9,
        content: "Hôm nay thử nghiệm Redux Toolkit cho Global State Management, code clean hơn Context API kha khá.",
        createdAt: "2 tuần trước",
        likesCount: 22,
        isLiked: false,
        comments: []
      }
    ],
    4: [
      {
        postId: 10,
        content: "Tips nhỏ: Luôn nhớ sử dụng `useCallback` và `useMemo` đúng chỗ để tránh re-render không cần thiết cho ứng dụng React.",
        createdAt: "3 tuần trước",
        likesCount: 67,
        isLiked: true,
        comments: [{ id: 105, author: "Hoàng Long", text: "Bài viết rất hữu ích, cảm ơn chủ thớt!" }]
      },
      {
        postId: 11,
        content: "Tham gia một workshop công nghệ về AI Agents và LLM ứng dụng vào phần mềm thực tế. Mở mang tầm mắt thực sự!",
        createdAt: "3 tuần trước",
        likesCount: 45,
        isLiked: false,
        comments: []
      },
      {
        postId: 12,
        content: "Cấu hình thành công CI/CD pipeline với GitHub Actions cho dự án cá nhân. Tự động hóa build và test cực mượt.",
        createdAt: "1 tháng trước",
        likesCount: 38,
        isLiked: true,
        comments: []
      }
    ],
    5: [
      {
        postId: 13,
        content: "Review nhẹ chiếc bàn phím cơ custom mới tậu: Gõ êm, âm thock nghe rất thích tai cho anh em dev.",
        createdAt: "1 tháng trước",
        likesCount: 89,
        isLiked: true,
        comments: [{ id: 106, author: "Tuấn Anh", text: "Cho xin mã switch với bạn ơi!" }]
      },
      {
        postId: 14,
        content: "Viết Unit Test cho Component với React Testing Library và Jest. Đảm bảo chất lượng code trước khi release.",
        createdAt: "1 tháng trước",
        likesCount: 21,
        isLiked: false,
        comments: []
      },
      {
        postId: 15,
        content: "Học thêm một ngôn ngữ lập trình mới mỗi năm là cách tốt nhất để giữ lửa đam mê công nghệ.",
        createdAt: "1 tháng trước",
        likesCount: 50,
        isLiked: true,
        comments: []
      }
    ],
    6: [
      {
        postId: 16,
        content: "Chia sẻ tài liệu học thiết kế hệ thống (System Design) cho các bạn chuẩn bị phỏng vấn vị trí Mid/Senior.",
        createdAt: "2 tháng trước",
        likesCount: 120,
        isLiked: true,
        comments: [{ id: 107, author: "Thanh Trúc", text: "Tuyệt vời, đánh dấu để đọc dần!" }]
      },
      {
        postId: 17,
        content: "Làm việc nhóm hiệu quả hơn nhờ Git Workflow chuẩn Git Flow kết hợp Pull Request Review nghiêm ngặt.",
        createdAt: "2 tháng trước",
        likesCount: 33,
        isLiked: false,
        comments: []
      },
      {
        postId: 18,
        content: "Kết thúc chuỗi bài viết mô phỏng trang cá nhân ở đây. Chúc mọi người một ngày làm việc năng suất và tràn đầy năng lượng! 🚀",
        createdAt: "2 tháng trước",
        likesCount: 150,
        isLiked: true,
        comments: [{ id: 108, author: "Minh Quân", text: "Đỉnh chóp bạn tôi ơi 👏👏👏" }]
      }
    ]
  };

  // Hàm giả lập gọi API phân trang
  const fetchNextPage = async () => {
    if (isFetching || !hasNextPage) return;

    setIsFetching(true);
    
    // Giả lập độ trễ mạng 1 giây
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const nextPageNum = page + 1;
    const nextData = mockDatabasePages[nextPageNum];

    if (nextData) {
      setUserPosts((prev) => [...prev, ...nextData]);
      setPage(nextPageNum);
      if (nextPageNum >= 6) {
        setHasNextPage(false); // Dừng lại sau trang 6
      }
    } else {
      setHasNextPage(false);
    }

    setIsFetching(false);
  };

  // Tích hợp custom hook cuộn vô tận của bạn
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

      setUserDetails(data.result);
      setFirstName(data.result.firstname || "");
      setLastName(data.result.lastname || "");
      setEmail(data.result.email || "");
      setCity(data.result.city || "");
      setDob(data.result.birthday ? dayjs(data.result.birthday) : null);
      
      // Khởi tạo trang đầu tiên cho danh sách bài viết
      setUserPosts(mockDatabasePages[1] || []);
    } catch (error) {
      if (error.response?.status === 401) {
        logOut();
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
    setUserPosts(posts =>
      posts.map(post => {
        if (post.postId === postId) {
          const newIsLiked = !post.isLiked;
          return {
            ...post,
            isLiked: newIsLiked,
            likesCount: newIsLiked ? post.likesCount + 1 : post.likesCount - 1
          };
        }
        return post;
      })
    );
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
      setUserDetails({ ...userDetails, ...profileData });
      setSnackbarMessage("Cập nhật thông tin thành công!");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
    } catch (error) {
      console.error("Error updating profile:", error);
      setSnackbarMessage("Cập nhật thất bại. Vui lòng thử lại.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current.click();
  };

  const handleFileSelect = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.match("image.*")) {
      setSnackbarMessage("Vui lòng chọn một file hình ảnh hợp lệ.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("file", file);

      const response = await uploadAvatar(formData);
      const imageUrl = response.data.result.avatar;

      setUserDetails({ ...userDetails, avatar: imageUrl });
      setSnackbarMessage("Cập nhật ảnh đại diện thành công!");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
    } catch (error) {
      console.error("Error uploading avatar:", error);
      setSnackbarMessage("Tải ảnh lên thất bại. Vui lòng thử lại.");
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
        <Box sx={{ display: "flex", flexDirection: "column", gap: "30px", justifyContent: "center", alignItems: "center", height: "80vh" }}>
          <CircularProgress />
          <Typography>Đang tải trang cá nhân...</Typography>
        </Box>
      ) : profileError ? (
        <Box sx={{ maxWidth: 500, width: "100%", mx: "auto", mt: 5 }}>
          <Alert severity="warning" action={<Button color="inherit" size="small" onClick={getUserDetails}>Thử lại</Button>}>
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
                backgroundImage: "linear-gradient(135deg, #1976d2 0%, #64b5f6 100%)",
                position: "relative",
              }}
            />

            <Box sx={{ px: 4, pb: 3, pt: 1, position: "relative", display: "flex", flexDirection: { xs: "column", sm: "row" }, alignItems: { xs: "center", sm: "flex-end" }, justifyContent: "space-between", mt: "-75px" }}>
              <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, alignItems: "center", gap: 3, textAlign: { xs: "center", sm: "left" } }}>
                <Tooltip title="Bấm để đổi ảnh đại diện">
                  <Box sx={{ position: "relative" }}>
                    <Avatar
                      src={userDetails.avatar}
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
                        "&:hover": { backgroundColor: "#e4e6eb" }
                      }}
                    >
                      <PhotoCameraIcon sx={{ color: "#333", fontSize: 20 }} />
                    </Box>

                    {uploading && (
                      <Box sx={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "50%", backgroundColor: "rgba(0, 0, 0, 0.4)" }}>
                        <CircularProgress size={36} sx={{ color: "white" }} />
                      </Box>
                    )}
                  </Box>
                </Tooltip>
                
                <input type="file" accept="image/*" ref={fileInputRef} style={{ display: "none" }} onChange={handleFileSelect} />

                <Box sx={{ mt: { xs: 1, sm: "50px" } }}>
                  <Typography variant="h5" fontWeight="bold">
                    {userDetails.firstname || userDetails.lastname 
                      ? `${userDetails.firstname || ""} ${userDetails.lastname || ""}`.trim() 
                      : userDetails.username}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    @{userDetails.username} • {userDetails.city || "Chưa cập nhật thành phố"}
                  </Typography>
                </Box>
              </Box>
            </Box>

            <Divider />
            <Tabs value={tabValue} onChange={handleTabChange} centered sx={{ bgcolor: "#fff" }}>
              <Tab icon={<ArticleIcon />} iconPosition="start" label="Bài viết của tôi" />
              <Tab icon={<EditIcon />} iconPosition="start" label="Chỉnh sửa thông tin" />
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
              onOpenComments={(post) => console.log("Mở bình luận:", post)}
              onImageClick={(img) => console.log("Xem ảnh:", img)}
              lastPostElementRef={lastElementRef}
            />
          )}

          {/* TAB 1: FORM CHỈNH SỬA THÔNG TIN */}
          {tabValue === 1 && (
            <Card sx={{ p: 4, boxShadow: 3, borderRadius: 2 }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ mb: 3 }}>
                Chỉnh sửa thông tin cá nhân
              </Typography>

              <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
                <Box sx={{ display: "flex", gap: 2, flexDirection: { xs: "column", sm: "row" } }}>
                  <TextField
                    label="Tên (First Name)"
                    variant="outlined"
                    fullWidth
                    size="small"
                    value={firstname}
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                  <TextField
                    label="Họ (Last Name)"
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
                  label="Thành phố đang sống"
                  variant="outlined"
                  fullWidth
                  size="small"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                />

                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    label="Ngày sinh"
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
                    Lưu thay đổi
                  </Button>
                </Box>
              </Box>
            </Card>
          )}

        </Box>
      ) : null}
    </Scene>
  );
}