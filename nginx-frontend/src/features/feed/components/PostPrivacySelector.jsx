import React, { useState } from "react";
import {
  Box,
  ButtonBase,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Typography,
  Tooltip,
} from "@mui/material";
import PublicIcon from "@mui/icons-material/Public";
import PeopleIcon from "@mui/icons-material/People";
import LockIcon from "@mui/icons-material/Lock";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import CheckIcon from "@mui/icons-material/Check";

export const PRIVACY_OPTIONS = [
  {
    value: "PUBLIC",
    label: "Public",
    description: "Anyone on or off the app",
    icon: PublicIcon,
  },
  {
    value: "FRIENDS",
    label: "Friends",
    description: "Only your friends on the platform",
    icon: PeopleIcon,
  },
  {
    value: "PRIVATE",
    aliases: ["ONLY_ME"],
    label: "Only me",
    description: "Only you can see this post",
    icon: LockIcon,
  },
];

export const getPrivacyConfig = (privacyValue) => {
  const normalized = (privacyValue || "PUBLIC").toUpperCase();
  return (
    PRIVACY_OPTIONS.find(
      (opt) => opt.value === normalized || opt.aliases?.includes(normalized)
    ) || PRIVACY_OPTIONS[0]
  );
};

export default function PostPrivacySelector({
  privacy = "PUBLIC",
  isOwner = false,
  onChange,
  disabled = false,
  variant = "badge", // "badge" (compact near timestamp) or "selector" (larger for dialogs)
}) {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const currentConfig = getPrivacyConfig(privacy);
  const CurrentIcon = currentConfig.icon;

  const handleClick = (event) => {
    if (!isOwner || disabled) return;
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleClose = (event) => {
    if (event) event.stopPropagation();
    setAnchorEl(null);
  };

  const handleSelect = (optionValue, event) => {
    if (event) event.stopPropagation();
    setAnchorEl(null);
    if (onChange && optionValue !== currentConfig.value) {
      onChange(optionValue);
    }
  };

  // If not owner, display static icon with tooltip
  if (!isOwner) {
    return (
      <Tooltip title={`Shared with: ${currentConfig.label} (${currentConfig.description})`}>
        <Box
          component="span"
          sx={{
            display: "inline-flex",
            alignItems: "center",
            verticalAlign: "middle",
            color: "text.secondary",
            cursor: "default",
          }}
        >
          <CurrentIcon sx={{ fontSize: variant === "selector" ? 18 : 14 }} />
        </Box>
      </Tooltip>
    );
  }

  return (
    <>
      <Tooltip title={isOwner ? "Edit audience" : currentConfig.label}>
        <ButtonBase
          onClick={handleClick}
          aria-haspopup="true"
          aria-expanded={open ? "true" : undefined}
          aria-label={`Audience: ${currentConfig.label}. Click to change.`}
          sx={{
            display: "inline-flex",
            alignItems: "center",
            gap: 0.5,
            px: variant === "selector" ? 1.25 : 0.75,
            py: variant === "selector" ? 0.5 : 0.25,
            borderRadius: variant === "selector" ? 1.5 : 1,
            backgroundColor: variant === "selector" ? "action.hover" : "rgba(0,0,0,0.04)",
            border: variant === "selector" ? "1px solid" : "none",
            borderColor: "divider",
            color: "text.secondary",
            fontSize: variant === "selector" ? "0.8125rem" : "0.75rem",
            fontWeight: 500,
            transition: "all 0.2s ease",
            "&:hover": {
              backgroundColor: "action.selected",
              color: "text.primary",
            },
          }}
        >
          <CurrentIcon sx={{ fontSize: variant === "selector" ? 16 : 13 }} />
          <span>{currentConfig.label}</span>
          <ArrowDropDownIcon sx={{ fontSize: variant === "selector" ? 18 : 14, ml: -0.25 }} />
        </ButtonBase>
      </Tooltip>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        onClick={(e) => e.stopPropagation()}
        transformOrigin={{ horizontal: "left", vertical: "top" }}
        anchorOrigin={{ horizontal: "left", vertical: "bottom" }}
        PaperProps={{
          elevation: 4,
          sx: {
            borderRadius: 2.5,
            minWidth: 260,
            mt: 0.5,
            p: 0.5,
            border: "1px solid",
            borderColor: "divider",
          },
        }}
      >
        <Box sx={{ px: 2, py: 1 }}>
          <Typography variant="subtitle2" fontWeight={700}>
            Select audience
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Who can see this post?
          </Typography>
        </Box>

        {PRIVACY_OPTIONS.map((opt) => {
          const IconComponent = opt.icon;
          const isSelected =
            currentConfig.value === opt.value ||
            currentConfig.aliases?.includes(opt.value);

          return (
            <MenuItem
              key={opt.value}
              onClick={(e) => handleSelect(opt.value, e)}
              selected={isSelected}
              sx={{
                borderRadius: 1.5,
                my: 0.25,
                py: 1,
                px: 1.5,
                display: "flex",
                alignItems: "center",
                gap: 1.5,
              }}
            >
              <ListItemIcon sx={{ minWidth: 32, color: isSelected ? "primary.main" : "text.secondary" }}>
                <IconComponent fontSize="small" />
              </ListItemIcon>
              <ListItemText
                primary={
                  <Typography variant="body2" fontWeight={isSelected ? 700 : 500}>
                    {opt.label}
                  </Typography>
                }
                secondary={
                  <Typography variant="caption" color="text.secondary" display="block">
                    {opt.description}
                  </Typography>
                }
              />
              {isSelected && (
                <CheckIcon sx={{ fontSize: 18, color: "primary.main", ml: "auto" }} />
              )}
            </MenuItem>
          );
        })}
      </Menu>
    </>
  );
}
