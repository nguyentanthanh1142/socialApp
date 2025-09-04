import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Card,
  CircularProgress,
  Typography,
  Fab,
  Popover,
  TextField,
  Button,
  Snackbar,
  Alert,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { isAuthenticated, logOut } from "../services/authenticationService";
import Scene from "./Scene";
import Post from "../components/header/Post";
import FriendList from "../components/FriendList";
import { getMyPosts, createPost } from "../services/postService";
import DraggableDialog from "../components/DialogCreatePost";

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const observer = useRef();
  const [dialogOpen, setDialogOpen] = useState(false);
  const lastPostElementRef = useRef();
  const [anchorEl, setAnchorEl] = useState(null);
  const [newPostContent, setNewPostContent] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [open, setOpen] = useState(false);

  const navigate = useNavigate();

  // Handle opening the popover
  const handleCreatePostClick = (event) => {
    setDialogOpen(true);
  };

  // Handle closing the popover
  const handleCloseDialog = () => {
    setDialogOpen(false);
    setNewPostContent("");
  };

  // Handle Snackbar close
  const handleSnackbarClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbarOpen(false);
  };

  // Handle posting new content
  const handlePostContent = () => {
    console.log("New post content:", newPostContent);
    handleCloseDialog();

    createPost(newPostContent)
      .then((response) => {
        console.log("Post created successfully:", response.data);
        setPosts((prevPosts) => [response.data.result, ...prevPosts]);
        setNewPostContent("");
        setSnackbarMessage("Post created successfully!");
        setSnackbarSeverity("success");
        setSnackbarOpen(true);
      })
      .catch((error) => {
        console.error("Error creating post:", error);
        setSnackbarMessage("Failed to create post. Please try again.");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
      });
  };



  useEffect(() => {
    if (!isAuthenticated()) {
      navigate("/login");
    } else {
      loadPosts(page);
    }
  }, [navigate, page]);

  const loadPosts = (page) => {
    console.log(`loading posts for page ${page}`);
    setLoading(true);
    getMyPosts(page)
      .then((response) => {
        setTotalPages(response.data.result.totalPages);
        setPosts((prevPosts) => [...prevPosts, ...response.data.result.data]);
        setHasMore(response.data.result.data.length > 0);
        console.log("loaded posts:", response.data.result);
      })
      .catch((error) => {
        if (error.response.status === 401) {
          logOut();
          navigate("/login");
        }
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    if (!hasMore) return;

    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        if (page < totalPages) {
          setPage((prevPage) => prevPage + 1);
        }
      }
    });
    if (lastPostElementRef.current) {
      observer.current.observe(lastPostElementRef.current);
    }

    setHasMore(false);
  }, [hasMore]);

  return (
    <Scene>
      {" "}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        sx={{ marginTop: "64px" }} // Position below the header
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbarSeverity}
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
      <Card
        sx={{
          minWidth: 500,
          maxWidth: 600,
          boxShadow: 3,
          borderRadius: 2,
          mt: "20px",
          padding: "20px",
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            width: "100%",
            gap: "10px",
            justifyContent: "center",
          }}
        >

          <DraggableDialog
            open={dialogOpen}
            onOpen={handleCreatePostClick}
            onClose={handleCloseDialog}
            newPostContent={newPostContent}
            setNewPostContent={setNewPostContent}
            onPost={handlePostContent}
          />

          <Typography
            sx={{
              fontSize: 18,
              mb: "10px",
            }}
          >
       
          </Typography>
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "flex-start",
              width: "100%", // Ensure content takes full width
            }}
          ></Box>
          {/* {posts.map((post, index) => {
            if (posts.length === index + 1) {
              return (
                <Post ref={lastPostElementRef} key={post.id} post={post} />
              );
            } else {
              return <Post key={post.id} post={post} />;
            }
          })} */}
          {posts.map((post, index) => {
            const isLast = posts.length === index + 1;

            const PostCard = (
              <Card key={post.id} sx={{
                width: "95%",
                p: 2,
                mb: 2,
                borderRadius: 3,
                boxShadow: 2,
              }}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                  {/* <Avatar /> */}
                  <Box sx={{ ml: 1 }}>
                    <Typography fontWeight="bold">Người dùng</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {/* {formatTime(post.createdDate)} */}
                    </Typography>
                  </Box>
                </Box>

                <Typography sx={{ mb: 1 }}>{post.content}</Typography>

                {post.image && (
                  <Box
                    component="img"
                    src={post.image}
                    alt="Ảnh bài viết"
                    sx={{ width: "100%", borderRadius: 2, objectFit: "cover", mt: 1 }}
                  />
                )}

                <Box sx={{ width: "100%", display: "flex", justifyContent: "space-between", mt: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    👍 {post.likes || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    💬 {post.comments?.length || 0} bình luận
                  </Typography>
                </Box>
              </Card>
            );
            return isLast ? (
              <div style={{ width: "100%" }} ref={lastPostElementRef}>{PostCard}</div>
            ) : (
              PostCard
            );
          })}

          {loading && (
            <Box
              sx={{ display: "flex", justifyContent: "center", width: "100%" }}
            >
              <CircularProgress size="24px" />
            </Box>
          )}
        </Box>
      </Card>

    </Scene>
  );
}