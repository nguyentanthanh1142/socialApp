import * as React from "react";
import Divider from "@mui/material/Divider";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import HomeIcon from "@mui/icons-material/Home";
import PeopleIcon from "@mui/icons-material/People";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import PersonSearchIcon from "@mui/icons-material/PersonSearch";
import { Link, useSearchParams } from "react-router-dom";

function FriendSideMenu() {
  const [searchParams] = useSearchParams();
  const currentTab = searchParams.get("tab") || "overview";

  const menuItems = [
    {
      key: "overview",
      label: "Overview",
      icon: <PeopleIcon />,
      to: "/friends",
      isActive: currentTab === "overview",
    },
    {
      key: "requests",
      label: "Friend Requests",
      icon: <PersonAddIcon />,
      to: "/friends?tab=requests",
      isActive: currentTab === "requests",
    },
    {
      key: "suggestions",
      label: "Suggestions",
      icon: <PersonSearchIcon />,
      to: "/friends?tab=suggestions",
      isActive: currentTab === "suggestions",
    },
    {
      key: "all",
      label: "All Friends",
      icon: <PeopleIcon />,
      to: "/friends?tab=all",
      isActive: currentTab === "all",
    },
  ];

  return (
    <Box sx={{ width: "100%", pt: 1 }}>
      <Toolbar />
      <Box sx={{ px: 2, py: 1.5 }}>
        <Typography variant="h6" fontWeight="bold">
          Friends
        </Typography>
      </Box>
      <List sx={{ px: 1 }}>
        <ListItem disablePadding sx={{ mb: 0.5 }}>
          <ListItemButton
            component={Link}
            to="/"
            sx={{
              borderRadius: 2,
            }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>
              <HomeIcon />
            </ListItemIcon>
            <ListItemText
              primary="Home Feed"
              primaryTypographyProps={{ fontSize: "0.95rem" }}
            />
          </ListItemButton>
        </ListItem>

        <Divider sx={{ my: 1 }} />

        {menuItems.map((item) => (
          <ListItem key={item.key} disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton
              component={Link}
              to={item.to}
              selected={item.isActive}
              sx={{
                borderRadius: 2,
                "&.Mui-selected": {
                  backgroundColor: "rgba(24, 119, 242, 0.12)",
                  color: "#1877f2",
                  fontWeight: "bold",
                  "&:hover": {
                    backgroundColor: "rgba(24, 119, 242, 0.18)",
                  },
                  "& .MuiListItemIcon-root": {
                    color: "#1877f2",
                  },
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.label}
                primaryTypographyProps={{
                  fontSize: "0.95rem",
                  fontWeight: item.isActive ? 700 : 500,
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider sx={{ my: 1 }} />
    </Box>
  );
}

export default FriendSideMenu;
