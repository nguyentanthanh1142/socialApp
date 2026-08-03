import * as React from "react";
import { useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import Toolbar from "@mui/material/Toolbar";
import { useTheme } from "@mui/material";
import { useLocation } from "react-router-dom";
import Header from "../../components/header/Header";
import FriendsList from "../../components/FriendList";
import NotificationToast from "../../components/NotificationToast";
import { useSocket } from "../providers/useSocket";

const drawerWidth = 300;

function Scene({ sideMenu, children }) {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [isClosing, setIsClosing] = React.useState(false);

  const location = useLocation();
  const theme = useTheme();
  const { socket } = useSocket();

  const handleDrawerClose = () => {
    setIsClosing(true);
    setMobileOpen(false);
  };

  const handleDrawerTransitionEnd = () => {
    setIsClosing(false);
  };

  const handleDrawerToggle = () => {
    if (!isClosing) {
      setMobileOpen((prev) => !prev);
    }
  };

  useEffect(() => {
    if (!socket) return;

    const handleNotification = (notification) => {
      try {
        const messageObject =
          typeof notification === "string" ? JSON.parse(notification) : notification;
        const { actorName, type, content } = messageObject;

        const text =
          type === "LIKE"
            ? `${actorName} đã thích bài viết của bạn`
            : type === "COMMENT"
              ? `${actorName} đã bình luận: "${content}"`
              : "Bạn có một thông báo mới";

        toast(<NotificationToast avatarUrl="" message={text} />, {
          position: "bottom-right",
          className: "fb-toast",
        });
      } catch (err) {
        console.error("❌ Error parsing notification message:", err);
      }
    };

    socket.on("notification_message", handleNotification);

    return () => {
      socket.off("notification_message", handleNotification);
    };
  }, [socket]);

  return (
    <Box sx={{ display: "flex", flexDirection: "column" }}>
      <AppBar
        position="fixed"
        sx={{
          ml: { sm: `${drawerWidth}px` },
          zIndex: theme.zIndex.drawer + 1,
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: "none" } }}
          >
            <MenuIcon />
          </IconButton>
          <Header />
        </Toolbar>
      </AppBar>
      <Box sx={{ display: "flex", flexDirection: "row" }}>
        <Box
          component="nav"
          sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
          aria-label="mailbox folders"
        >
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onTransitionEnd={handleDrawerTransitionEnd}
            onClose={handleDrawerClose}
            ModalProps={{ keepMounted: true }}
            sx={{
              display: { xs: "block", sm: "none" },
              "& .MuiDrawer-paper": {
                boxSizing: "border-box",
                width: drawerWidth,
              },
            }}
          >
            {sideMenu && sideMenu}
          </Drawer>
          <Drawer
            variant="permanent"
            sx={{
              display: { xs: "none", sm: "block" },
              "& .MuiDrawer-paper": {
                boxSizing: "border-box",
                width: drawerWidth,
              },
            }}
            open
          >
            {sideMenu && sideMenu}
          </Drawer>
        </Box>
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            width: {
              xs: "100%",
              sm: `calc(100% - ${drawerWidth}px)`,
              md: `calc(100% - ${drawerWidth * 2}px)`,
            },
          }}
        >
          <Toolbar />
          <Box sx={{ display: "flex", justifyContent: "center", width: "100%", height: "100%" }}>
            {children}
          </Box>
        </Box>
        {location.pathname === "/" && (
          <Box
            sx={{
              display: { xs: "none", md: "block" },
              width: drawerWidth,
              flexShrink: 0,
              position: "sticky",
              top: 64,
              height: "calc(100vh - 64px)",
              overflowY: "auto",
            }}
          >
            <FriendsList />
          </Box>
        )}
      </Box>
      <ToastContainer
        position="bottom-right"
        autoClose={4000}
        hideProgressBar
        closeOnClick
        pauseOnHover
        draggable
      />
    </Box>
  );
}

export default Scene;