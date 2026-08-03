import * as React from "react";

import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";

import Badge from "@mui/material/Badge";
import MenuItem from "@mui/material/MenuItem";
import Menu from "@mui/material/Menu";

import AccountCircle from "@mui/icons-material/AccountCircle";
import MailIcon from "@mui/icons-material/Mail";
import NotificationsIcon from "@mui/icons-material/Notifications";
import MoreIcon from "@mui/icons-material/MoreVert";
import { logOut } from "../../services/authenticationService";
import NotificationMenu from "../../components/notifications/NotificationMenu";
import SearchBar from "./SearchBar";
import ProfileMenu from "./ProfileMenu";
import MobileMenu from "./MobileMenu";






export default function Header() {
  const [profileAnchor, setProfileAnchor] = React.useState(null);
  const [mobileMoreAnchorEl, setMobileMoreAnchorEl] = React.useState(null);
  const [notificationAnchorEl, setNotificationAnchorEl] = React.useState(null);
  
  // const isNotificationOpen = Boolean(notificationAnchorEl);
  // const isMenuOpen = Boolean(profileAnchor);
  // const isMobileMenuOpen = Boolean(mobileMoreAnchorEl);


  const handleNotificationOpen = (event) => {
    setNotificationAnchorEl(event.currentTarget);
  };

  const handleNotificationClose = () => {
    setNotificationAnchorEl(null);
  };

  const handleProfileMenuOpen = (event) => {
    setProfileAnchor(event.currentTarget);
  };

  const handleProfileMenuMenuClose = () => {
    setProfileAnchor(null);
    handleMobileMenuClose();
  };

  const handleMobileMenuOpen = (event) => {
    setMobileMoreAnchorEl(event.currentTarget);
  };

  const handleMobileMenuClose = () => {
    setMobileMoreAnchorEl(null);
  };


  // const menuId = "primary-search-account-menu";
  // const mobileMenuId = "primary-search-account-menu-mobile";    

  

  // <NotificationMenu
  //   anchorEl={notificationAnchorEl}
  //   open={isNotificationOpen}
  //   onClose={handleNotificationClose}
  // />
  // const notifications = [
  //   { id: 1, text: "Nguyễn Văn A đã thích bài viết của bạn", time: "2 phút trước" },
  //   { id: 2, text: "Trần Thị B đã bình luận: 'Tuyệt vời!'", time: "5 phút trước" },
  //   { id: 3, text: "Bạn có 3 lời mời kết bạn mới", time: "10 phút trước" },
  //   { id: 4, text: "Hệ thống: Tính năng mới đã được cập nhật!", time: "1 giờ trước" },
  // ];
  // const renderNotificationMenu = (
  //   <Menu
  //     anchorEl={notificationAnchorEl}
  //     open={isNotificationOpen}
  //     onClose={handleNotificationClose}
  //     PaperProps={{
  //       elevation: 3,
  //       sx: {
  //         mt: 1.5,
  //         minWidth: 320,
  //         maxHeight: 400,
  //         overflowY: "auto",
  //         "&::-webkit-scrollbar": { width: "6px" },
  //         "&::-webkit-scrollbar-thumb": {
  //           backgroundColor: "#ccc",
  //           borderRadius: "3px",
  //         },
  //       },
  //     }}
  //     anchorOrigin={{
  //       vertical: "bottom",
  //       horizontal: "right",
  //     }}
  //     transformOrigin={{
  //       vertical: "top",
  //       horizontal: "right",
  //     }}
  //   >
  //     <Box sx={{ px: 2, py: 1 }}>
  //       <strong>Notifications</strong>
  //     </Box>
  //     {notifications.length === 0 ? (
  //       <MenuItem disabled>Không có thông báo nào</MenuItem>
  //     ) : (
  //       notifications.map((noti) => (
  //         <MenuItem
  //           key={noti.id}
  //           onClick={handleNotificationClose}
  //           sx={{
  //             whiteSpace: "normal",
  //             alignItems: "flex-start",
  //             flexDirection: "column",
  //             py: 1,
  //             "&:hover": { backgroundColor: "rgba(0,0,0,0.05)" },
  //           }}
  //         >
  //           <Box sx={{ fontSize: 14 }}>{noti.text}</Box>
  //           <Box sx={{ fontSize: 12, color: "gray" }}>{noti.time}</Box>
  //         </MenuItem>
  //       ))
  //     )}
  //     <Box
  //       sx={{
  //         textAlign: "center",
  //         py: 1,
  //         borderTop: "1px solid #eee",
  //         cursor: "pointer",
  //         "&:hover": { backgroundColor: "rgba(0,0,0,0.04)" },
  //       }}
  //       onClick={() => {
  //         handleNotificationClose();
  //         window.location.href = "/notifications";
  //       }}
  //     >
  //       See previous notifications
  //     </Box>
  //   </Menu>
  // );
  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="fixed">
        <Toolbar>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="open drawer"
            sx={{ mr: 2 }}
          >
            <Box
              component={"img"}
              style={{
                width: "35px",
                height: "35px",
                borderRadius: 6,
              }}
              src="/logo/social-logo.png"
            ></Box>
          </IconButton>
          <SearchBar />
          {/* <Search>
            <SearchIconWrapper>
              <SearchIcon />
            </SearchIconWrapper>
            <StyledInputBase
              placeholder="Search…"
              inputProps={{ "aria-label": "search" }}
            />
          </Search> */}
          <Box sx={{ flexGrow: 1 }} />
          <Box sx={{ display: { xs: "none", md: "flex" } }}>
            <IconButton
              size="large"
              aria-label="show 4 new mails"
              color="inherit"
            >
              <Badge badgeContent={4} color="error">
                <MailIcon />
              </Badge>
            </IconButton>
            <IconButton
              size="large"
              aria-label="show 17 new notifications"
              color="inherit"
              onClick={handleNotificationOpen}
            >
              <Badge badgeContent={17} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>
            <IconButton
              size="large"
              edge="end"
              aria-label="account of current user"
              // aria-controls={menuId}
              aria-haspopup="true"
              onClick={handleProfileMenuOpen}
              color="inherit"
            >
              <AccountCircle />
            </IconButton>
          </Box>
          <Box sx={{ display: { xs: "flex", md: "none" } }}>
            <IconButton
              size="large"
              aria-label="show more"
              // aria-controls={mobileMenuId}
              aria-haspopup="true"
              onClick={handleMobileMenuOpen}
              color="inherit"
            >
              <MoreIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>
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
      {/* {renderNotificationMenu} */}
      <NotificationMenu
        anchorEl={notificationAnchorEl}
        open={Boolean(notificationAnchorEl)}
        onClose={handleNotificationClose}
      />
    </Box>
  );
}
