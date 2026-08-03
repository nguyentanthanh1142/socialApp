import React from "react";
import { Menu, MenuItem } from "@mui/material";
import { logOut } from "../../services/authenticationService";

export default function ProfileMenu({ anchorEl, open, onClose }) {

  const handleLogout = () => {
    onClose();
    logOut();
    window.location.href = "/login";
  };

  const handleOpenProfile = () => {
    onClose();
    window.location.href = "/profile";
  };

  return (
    <Menu
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
      anchorOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
      transformOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
    >
      <MenuItem onClick={handleOpenProfile}>Profile</MenuItem>
      <MenuItem onClick={onClose}>Settings</MenuItem>
      <MenuItem onClick={handleLogout}>Log Out</MenuItem>
    </Menu>
  );
}