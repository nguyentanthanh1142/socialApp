import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Card, Dialog, Snackbar, Alert, Typography } from "@mui/material";
import { isAuthenticated } from "../../auth/services/authenticationService";
import Scene from "../../../components/Scene";
import { getMyFeed } from "../services/feedService";
import { createPost, likePost } from "../services/postService";
import DraggableDialog from "../components/DialogCreatePost";
import SideMenu from "../../../components/header/SideMenu";

import FeedList from "../components/FeedList";
import CommentDialog from "../components/CommentDialog";
import { useUser } from "../../../providers/UserProvider";
import usePageTitle from "../../../hooks/usePageTitle";
import { formatRelativeTime, parseValidDate } from "../../../utils/dateUtils";

export default function Home() {
  usePageTitle("Home");

  const { currentUser, loading: userLoading } = useUser();
  console.log("Current User Object:", currentUser);

  const [posts, setPosts] = useState([]);
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
  const [readPosts] = useState([]);
  const [selectedImages, setSelectedImages] = useState([]);
  const navigate = useNavigate();
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImages, setPreviewImages] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const checkpointRef = useRef(null);

  const [commentDialogOpen, setCommentDialogOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate("/login");
    }
  }, [navigate]);

  const normalizePost = (post) => {
    const images = post.images || post.files?.map((file) => file.url).filter(Boolean) || [];
    const rawCreated =
      post.createdDate || post.createDate || post.createdAt || new Date().toISOString();
    const parsed = parseValidDate(rawCreated);
    const createdDate = parsed ? parsed.toISOString() : new Date().toISOString();
    return {
      ...post,
      postId: post.postId ?? post.id,
      name: post.name || post.authorName || currentUser?.name || "User",
      authorName: post.authorName || post.name || currentUser?.name || "User",
      avatarUrl: post.avatarUrl || post.avatar || currentUser?.avatarUrl || "",
      avatar: post.avatar || post.avatarUrl || currentUser?.avatarUrl || "",
      createdDate,
      timestamp: formatRelativeTime(rawCreated),
      images,
      files: post.files?.length ? post.files : images.map((url) => ({ url })),
      likeCount: post.likeCount ?? 0,
      commentCount: post.commentCount ?? 0,
      liked: Boolean(post.liked),
      privacy: post.privacy || "PUBLIC",
      actions: post.actions || undefined,
    };
  };

  const buildOptimisticPost = (content, imagePreviews = [], privacy = "PUBLIC") => {
    const list = Array.isArray(imagePreviews) ? imagePreviews : [imagePreviews];

    const files = list.map((item) => {
      if (!item) return null;
      if (typeof item === "string") return { url: item };

      const rawFile = item instanceof File ? item : item.file;
      const url = item.url || item.preview || (rawFile ? URL.createObjectURL(rawFile) : null);

      if (!url) return null;

      const mimeType = rawFile?.type || item.type || "";
      const isVideo = mimeType.startsWith("video/") || url.includes("data:video") || /\.(mp4|webm|ogg|mov)$/i.test(rawFile?.name || url);

      return {
        url,
        file: rawFile || item,
        type: isVideo ? "video" : "image",
        fileType: isVideo ? "video" : "image",
        mediaType: isVideo ? "video" : "image"
      };
    }).filter(Boolean);

    const images = files.filter(f => f.type === "image").map(f => f.url);

    return normalizePost({
      postId: `temp-${Date.now()}`,
      name: currentUser?.name || "User",
      authorName: currentUser?.name || "User",
      avatarUrl: currentUser?.avatarUrl || "",
      avatar: currentUser?.avatarUrl || "",
      createdDate: new Date().toISOString(),
      content,
      images,
      files,
      likeCount: 0,
      commentCount: 0,
      liked: false,
      privacy: privacy || "PUBLIC",
    });
  };

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

  const handleDeletePost = (postId) => {
    setPosts((prevPosts) => prevPosts.filter((p) => p.postId !== postId));
    setSnackbarMessage("Post deleted successfully!");
    setSnackbarSeverity("success");
    setSnackbarOpen(true);
  };

  const handleUpdatePost = (updatedPost) => {
    setPosts((prevPosts) =>
      prevPosts.map((p) => (p.postId === updatedPost.postId ? { ...p, ...updatedPost } : p))
    );
    setSnackbarMessage("Post updated successfully!");
    setSnackbarSeverity("success");
    setSnackbarOpen(true);
  };

  const handlePrivacyChange = (postId, privacy) => {
    setPosts((prevPosts) =>
      prevPosts.map((p) => (p.postId === postId ? { ...p, privacy } : p))
    );
  };

  const handleHidePost = (postId) => {
    setPosts((prevPosts) => prevPosts.filter((p) => p.postId !== postId));
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
      console.error("Failed to load feed:", error);
      setFeedError("Unable to load feed. Please try again.");
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated()) return;
    loadPosts(null);
  }, []);

  useEffect(() => {
    if (!hasMore || loading) return;
    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        if (checkpointRef.current) {
          loadPosts(checkpointRef.current);
        }
      }
    });

    if (lastPostElementRef.current) {
      observer.current.observe(lastPostElementRef.current);
    }

    return () => observer.current?.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [posts, loading, hasMore]);

  return (
    <Scene sideMenu={<SideMenu />}>
      {userLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "60vh", width: "100%" }}>
          <Typography>Loading user profile...</Typography>
        </Box>
      ) : (
        <>
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
                currentUser={currentUser}
                onOpen={() => setDialogOpen(true)}
                onClose={() => setDialogOpen(false)}
                newPostContent={newPostContent}
                setNewPostContent={setNewPostContent}
                setSelectedImages={setSelectedImages}
                selectedImages={selectedImages}
                onPost={(content, files, privacy) => {
                  const tempId = `temp-${Date.now()}`;
                  const optimisticPost = buildOptimisticPost(content, files, privacy);
                  optimisticPost.postId = tempId;

                  setPosts((prev) => [optimisticPost, ...prev]);
                  setDialogOpen(false);

                  createPost(content, files, privacy)
                    .then((response) => {
                      const realPost = normalizePost(response?.data?.result || response?.data);

                      setPosts((prev) =>
                        prev.map((p) => (p.postId === tempId ? realPost : p))
                      );

                      setSnackbarMessage("Post created successfully!");
                      setSnackbarSeverity("success");
                      setSnackbarOpen(true);
                    })
                    .catch(() => {
                      setPosts((prev) => prev.filter((p) => p.postId !== tempId));
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
                onCreatePost={() => setDialogOpen(true)}
                onDeletePost={handleDeletePost}
                onUpdatePost={handleUpdatePost}
                onPrivacyChange={handlePrivacyChange}
                onHidePost={handleHidePost}
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
        </>
      )}
    </Scene>
  );
}