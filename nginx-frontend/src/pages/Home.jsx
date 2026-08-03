import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Card, Dialog, Snackbar, Alert, Typography } from "@mui/material";
import { isAuthenticated } from "../services/authenticationService";
import Scene from "./Scene";
import { getMyFeed, markReadPosts } from "../services/feedService";
import { createPost, likePost } from "../services/postService";
// import { getCurrentUser } from "../services/userService"; // 👈 Nhớ import hàm lấy user thật của bạn vào đây
import { getMockFeedSnapshot } from "../mockData";
import DraggableDialog from "../components/DialogCreatePost";
import SideMenu from "../components/header/SideMenu";

// Import các component theo đúng kiến trúc phân chia thư mục
import FeedList from "../components/feed/FeedList";
import CommentDialog from "../components/comments/CommentDialog";

export default function Home() {
  const [currentUser, setCurrentUser] = useState(null);
  
  // Đưa hàm normalizePost và buildOptimisticPost vào trong component để truy cập được state `currentUser`
  const normalizePost = (post) => {
    const images = post.images || post.files?.map((file) => file.url).filter(Boolean) || [];
    return {
      ...post,
      postId: post.postId ?? post.id,
      name: post.name || post.authorName || currentUser?.name || "User",
      authorName: post.authorName || post.name || currentUser?.name || "User",
      avatarUrl: post.avatarUrl || post.avatar || currentUser?.avatarUrl || "",
      avatar: post.avatar || post.avatarUrl || currentUser?.avatarUrl || "",
      createdDate: post.createdDate || new Date().toISOString(),
      images,
      files: post.files?.length ? post.files : images.map((url) => ({ url })),
      likeCount: post.likeCount ?? 0,
      commentCount: post.commentCount ?? 0,
      liked: Boolean(post.liked),
    };
  };

  const buildOptimisticPost = (content, imagePreviews = []) => {
    const images = imagePreviews.map((image) => image.preview || image.url || "").filter(Boolean);
    return normalizePost({
      postId: `temp-${Date.now()}`,
      name: currentUser?.name || "User",
      authorName: currentUser?.name || "User",
      avatarUrl: currentUser?.avatarUrl || "",
      avatar: currentUser?.avatarUrl || "",
      timestamp: "Just now",
      createdDate: new Date().toISOString(),
      content,
      images,
      files: images.map((url) => ({ url })),
      likeCount: 0,
      commentCount: 0,
      liked: false,
    });
  };

  const [posts, setPosts] = useState(() => getMockFeedSnapshot().map((p) => ({
    ...p,
    postId: p.postId ?? p.id,
    name: p.name || p.authorName || "User",
    authorName: p.authorName || p.name || "User",
    avatarUrl: p.avatarUrl || p.avatar || "",
    avatar: p.avatar || p.avatarUrl || "",
    createdDate: p.createdDate || new Date().toISOString(),
    images: p.images || p.files?.map((file) => file.url).filter(Boolean) || [],
    files: p.files?.length ? p.files : (p.images || []).map((url) => ({ url })),
    likeCount: p.likeCount ?? 0,
    commentCount: p.commentCount ?? 0,
    liked: Boolean(p.liked),
  })).slice(0, 3));

  const [loading, setLoading] = useState(false);
  const [feedError, setFeedError] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const observer = useRef();
  const [dialogOpen, setDialogOpen] = useState(false);
  const lastPostElementRef = useRef();
  const [newPostContent, setNewPostContent] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [readPosts, setReadPosts] = useState([]);
  const [selectedImages, setSelectedImages] = useState([]);
  const navigate = useNavigate();
  const readQueueRef = useRef([]);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImages, setPreviewImages] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const checkpointRef = useRef(null);

  // Quản lý Dialog Bình luận
  const [commentDialogOpen, setCommentDialogOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate("/login");
      return;
    }

    // Thay thế bằng hàm gọi API lấy thông tin user thật của bạn (ví dụ: getCurrentUser())
    // getCurrentUser()
    //   .then((res) => {
    //     setCurrentUser(res?.data?.result || res?.data);
    //   })
    //   .catch((err) => {
    //     console.error("Không thể lấy thông tin user:", err);
    //   });
  }, [navigate]);

  const handleOpenComments = (post) => {
    setSelectedPost(post);
    setCommentDialogOpen(true);
  };

  const handleCommentAdded = (postId) => {
    setPosts((prevPosts) =>
      prevPosts.map((p) => (p.postId === postId ? { ...p, commentCount: (p.commentCount || 0) + 1 } : p))
    );
  };

  const handleLike = (postId) => {
    setPosts((prevPosts) =>
      prevPosts.map((post) => {
        if (post.postId !== postId) return post;
        const liked = !post.liked;
        return {
          ...post,
          liked,
          likeCount: Math.max(0, (post.likeCount || 0) + (liked ? 1 : -1)),
        };
      })
    );

    likePost(postId).catch((err) => console.error("Error liking post:", err));
  };

  const loadPosts = async (checkpoint) => {
    if (loading) return;
    setLoading(true);
    setFeedError(null);
    try {
      const response = await getMyFeed(checkpoint);
      const result = response?.data?.result || {};
      const incomingPosts = result.data || [];

      setPosts((prevPosts) => {
        const existingIds = new Set(prevPosts.map((p) => p.postId));
        return [...prevPosts, ...incomingPosts.map(normalizePost).filter((p) => !existingIds.has(p.postId))];
      });

      if (result.nextCheckpoint) {
        checkpointRef.current = result.nextCheckpoint;
      }
      setHasMore(Boolean(result.hasMore));
    } catch (error) {
      const allMock = getMockFeedSnapshot().map(normalizePost);
      setPosts((prevPosts) => {
        const existingIds = new Set(prevPosts.map((p) => p.postId));
        const nextMockPosts = allMock.filter((p) => !existingIds.has(p.postId)).slice(0, 3);
        if (nextMockPosts.length === 0) setHasMore(false);
        return [...prevPosts, ...nextMockPosts];
      });
      setFeedError("Đang ngoại tuyến: Hiển thị dữ liệu mẫu.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!hasMore || loading) return;
    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        if (checkpointRef.current) {
          loadPosts(checkpointRef.current);
        } else {
          loadPosts(null);
        }
      }
    });

    if (lastPostElementRef.current) {
      observer.current.observe(lastPostElementRef.current);
    }

    return () => observer.current?.disconnect();
  }, [posts, loading, hasMore]);

  return (
    <Scene sideMenu={<SideMenu />}>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        sx={{ marginTop: "64px" }}
      >
        <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarSeverity} sx={{ width: "100%" }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>

      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%", pb: 4 }}>
        <Card
          sx={{
            minWidth: 300,
            width: "100%",
            maxWidth: 600,
            boxShadow: 3,
            borderRadius: 2,
            mt: "20px",
            padding: "20px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <DraggableDialog
            open={dialogOpen}
            onOpen={() => setDialogOpen(true)}
            onClose={() => setDialogOpen(false)}
            newPostContent={newPostContent}
            setNewPostContent={setNewPostContent}
            setSelectedImages={setSelectedImages}
            selectedImages={selectedImages}
            onPost={(content, files) => {
              const optimisticPost = buildOptimisticPost(content, files);
              setPosts((prev) => [optimisticPost, ...prev]);
              setDialogOpen(false);

              createPost(content, files.map((img) => img.file).filter(Boolean))
                .then(() => {
                  setSnackbarMessage("Post created successfully!");
                  setSnackbarSeverity("success");
                  setSnackbarOpen(true);
                })
                .catch(() => {
                  setSnackbarMessage("Failed to create post.");
                  setSnackbarSeverity("error");
                  setSnackbarOpen(true);
                });
            }}
          />

          <FeedList
            posts={posts}
            loading={loading}
            feedError={feedError}
            readPosts={readPosts}
            onLike={handleLike}
            onOpenComments={handleOpenComments}
            onImageClick={(imgs, idx) => {
              setPreviewImages(imgs);
              setCurrentImageIndex(idx);
              setPreviewOpen(true);
            }}
            lastPostElementRef={lastPostElementRef}
            onRetry={() => loadPosts(checkpointRef.current)}
          />
        </Card>
      </Box>

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
        currentUser={currentUser}
      />
    </Scene>
  );
}