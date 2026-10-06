// src/components/header/Header.jsx
import * as React from "react";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Badge from "@mui/material/Badge";
import AccountCircle from "@mui/icons-material/AccountCircle";
import Avatar from "@mui/material/Avatar";
import MailIcon from "@mui/icons-material/Mail";
import NotificationsIcon from "@mui/icons-material/Notifications";
import MoreIcon from "@mui/icons-material/MoreVert";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import Tooltip from "@mui/material/Tooltip";

import NotificationMenu from "../../features/notifications/components/NotificationMenu";
import MessageMenu from "../../features/chat/components/MessageMenu";
import SearchBar from "./SearchBar";
import ProfileMenu from "./ProfileMenu";
import MobileMenu from "./MobileMenu";
import { useUser } from "../../providers/UserProvider";
import { useColorMode } from "../../context/ColorModeContext";
import { getAvatarUrl } from "../../utils/avatarUtils";

export default function Header() {
  const [profileAnchor, setProfileAnchor] = React.useState(null);
  const [mobileMoreAnchorEl, setMobileMoreAnchorEl] = React.useState(null);
  const [notificationAnchorEl, setNotificationAnchorEl] = React.useState(null);
  const [messageAnchorEl, setMessageAnchorEl] = React.useState(null);

  const { currentUser } = useUser();
  const { mode, toggleColorMode } = useColorMode();

  const handleNotificationOpen = (event) => {
    setNotificationAnchorEl(event.currentTarget);
  };

  const handleNotificationClose = () => {
    setNotificationAnchorEl(null);
  };

  const handleMessageOpen = (event) => {
    setMessageAnchorEl(event.currentTarget);
  };

  const handleMessageClose = () => {
    setMessageAnchorEl(null);
  };

  const handleProfileMenuOpen = (event) => {
    setProfileAnchor(event.currentTarget);
  };

  const handleMobileMenuOpen = (event) => {
    setMobileMoreAnchorEl(event.currentTarget);
  };

  const handleMobileMenuClose = () => {
    setMobileMoreAnchorEl(null);
  };

  return (
    <Box sx={{ flexGrow: 1, display: "flex", alignItems: "center" }}>
      <IconButton size="large" edge="start" color="inherit" aria-label="logo" sx={{ mr: 1 }}>
        <Box
          component="img"
          sx={{ width: 35, height: 35, borderRadius: 1 }}
          src="/logo/social-logo.png"
          alt="logo"
        />
      </IconButton>
      <SearchBar />
      <Box sx={{ flexGrow: 1 }} />

      {/* ── Desktop action buttons ─────────────────────────────────────── */}
      <Box sx={{ display: { xs: "none", md: "flex" }, alignItems: "center" }}>
        {/* Dark / Light mode toggle */}
        <Tooltip title={mode === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}>
          <IconButton
            id="header-theme-toggle"
            size="large"
            aria-label="toggle colour mode"
            color="inherit"
            onClick={toggleColorMode}
          >
            {mode === "dark" ? (
              <LightModeIcon sx={{ color: "#f5a623" }} />
            ) : (
              <DarkModeIcon sx={{ color: "#7986cb" }} />
            )}
          </IconButton>
        </Tooltip>

        <IconButton size="large" aria-label="messages" color="inherit" onClick={handleMessageOpen}>
          <Badge color="error">
            <MailIcon />
          </Badge>
        </IconButton>
        <IconButton
          size="large"
          aria-label="notifications"
          color="inherit"
          onClick={handleNotificationOpen}
        >
          <Badge color="error">
            <NotificationsIcon />
          </Badge>
        </IconButton>
        <IconButton
          size="small"
          edge="end"
          aria-label="account"
          aria-haspopup="true"
          onClick={handleProfileMenuOpen}
          color="inherit"
          sx={{ ml: 1 }}
        >
          {currentUser?.avatarUrl || currentUser?.gender ? (
            <Avatar
              src={getAvatarUrl(currentUser.avatarUrl , currentUser.gender)}
              alt={currentUser.name}
              sx={{ width: 34, height: 34 }}
            />
          ) : currentUser?.name ? (
            <Avatar sx={{ width: 34, height: 34, fontSize: 14 }}>
            </Avatar>
          ) : (
            <AccountCircle sx={{ fontSize: 32 }} />
          )}
        </IconButton>
      </Box>

      {/* ── Mobile "more" button ───────────────────────────────────────── */}
      <Box sx={{ display: { xs: "flex", md: "none" } }}>
        <IconButton
          size="large"
          aria-label="more"
          aria-haspopup="true"
          onClick={handleMobileMenuOpen}
          color="inherit"
        >
          <MoreIcon />
        </IconButton>
      </Box>

      <MobileMenu
        anchorEl={mobileMoreAnchorEl}
        open={Boolean(mobileMoreAnchorEl)}
        onClose={handleMobileMenuClose}
        onOpenProfile={handleProfileMenuOpen}
        onOpenNotification={handleNotificationOpen}
      />
      <ProfileMenu
        anchorEl={profileAnchor}
        open={Boolean(profileAnchor)}
        onClose={() => setProfileAnchor(null)}
      />
      <NotificationMenu
        anchorEl={notificationAnchorEl}
        open={Boolean(notificationAnchorEl)}
        onClose={handleNotificationClose}
      />
      <MessageMenu
        anchorEl={messageAnchorEl}
        open={Boolean(messageAnchorEl)}
        onClose={handleMessageClose}
      />
    </Box>
  );
}
