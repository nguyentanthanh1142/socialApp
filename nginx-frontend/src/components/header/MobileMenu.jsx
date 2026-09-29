// src/components/header/MobileMenu.jsx
import React from "react";
import Badge from "@mui/material/Badge";
import MenuItem from "@mui/material/MenuItem";
import Menu from "@mui/material/Menu";
import IconButton from "@mui/material/IconButton";
import AccountCircle from "@mui/icons-material/AccountCircle";
import MailIcon from "@mui/icons-material/Mail";
import NotificationsIcon from "@mui/icons-material/Notifications";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";

import { useColorMode } from "../../context/ColorModeContext";

export default function MobileMenu({
  anchorEl,
  open,
  onClose,
  onOpenProfile,
  onOpenNotification,
}) {
  const { mode, toggleColorMode } = useColorMode();

  const handleThemeToggle = () => {
    toggleColorMode();
    onClose();
  };

  return (
    <Menu
      anchorEl={anchorEl}
      anchorOrigin={{ vertical: "top", horizontal: "right" }}
      keepMounted
      transformOrigin={{ vertical: "top", horizontal: "right" }}
      open={open}
      onClose={onClose}
    >
      {/* Theme toggle */}
      <MenuItem id="mobile-menu-theme-toggle" onClick={handleThemeToggle}>
        <IconButton size="large" aria-label="toggle colour mode" color="inherit">
          {mode === "dark" ? (
            <LightModeIcon sx={{ color: "#f5a623" }} />
          ) : (
            <DarkModeIcon sx={{ color: "#7986cb" }} />
          )}
        </IconButton>
        <p>{mode === "dark" ? "Light Mode" : "Dark Mode"}</p>
      </MenuItem>

      <MenuItem>
        <IconButton size="large" aria-label="show 2 new mails" color="inherit">
          <Badge badgeContent={2} color="error">
            <MailIcon />
          </Badge>
        </IconButton>
        <p>Messages</p>
      </MenuItem>

      <MenuItem>
        <IconButton
          size="large"
          aria-label="show 4 new notifications"
          color="inherit"
          onClick={onOpenNotification}
        >
          <Badge badgeContent={4} color="error">
            <NotificationsIcon />
          </Badge>
        </IconButton>
        <p>Notifications</p>
      </MenuItem>

      <MenuItem onClick={onOpenProfile}>
        <IconButton
          size="large"
          aria-label="account of current user"
          aria-controls="primary-search-account-menu"
          aria-haspopup="true"
          color="inherit"
        >
          <AccountCircle />
        </IconButton>
        <p>Profile</p>
      </MenuItem>
    </Menu>
  );
}