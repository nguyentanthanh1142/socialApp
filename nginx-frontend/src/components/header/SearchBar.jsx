import React, { useState, useEffect, useRef } from "react";
import { styled, alpha } from "@mui/material/styles";
import {
  InputBase,
  Paper,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Typography,
  CircularProgress,
  Box,
  ClickAwayListener,
  IconButton,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import { useNavigate } from "react-router-dom";
import { search } from "../../features/profile/services/userService";
import { getAvatarUrl } from "../../utils/avatarUtils";

const SearchContainer = styled("div")(({ theme }) => ({
  position: "relative",
  borderRadius: 20,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  "&:hover": {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: "100%",
  maxWidth: 320,
  [theme.breakpoints.up("sm")]: {
    marginLeft: theme.spacing(2),
    width: "280px",
  },
}));

const SearchIconWrapper = styled("div")(({ theme }) => ({
  padding: theme.spacing(0, 1.5),
  height: "100%",
  position: "absolute",
  pointerEvents: "none",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: "inherit",
  width: "100%",
  "& .MuiInputBase-input": {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(3)})`,
    paddingRight: theme.spacing(4),
    fontSize: "0.95rem",
    width: "100%",
  },
}));

export default function SearchBar() {
  const [keyword, setKeyword] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const searchTimeoutRef = useRef(null);

  useEffect(() => {
    const trimmed = keyword.trim();
    if (!trimmed) {
      setResults([]);
      setLoading(false);
      setOpen(false);
      return;
    }

    setLoading(true);
    setOpen(true);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const response = await search(trimmed);
        const data = response?.data?.result || response?.result || [];
        setResults(Array.isArray(data) ? data : []);
      } catch (err) {
        console.warn("Search user failed:", err);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 350);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [keyword]);

  const handleSelectUser = (user) => {
    const targetUsername = user.username || user.userId || user.id;
    if (targetUsername) {
      navigate(`/u/${targetUsername}`);
    }
    setOpen(false);
    setKeyword("");
  };

  const handleClear = () => {
    setKeyword("");
    setResults([]);
    setOpen(false);
  };

  return (
    <ClickAwayListener onClickAway={() => setOpen(false)}>
      <SearchContainer>
        <SearchIconWrapper>
          <SearchIcon sx={{ fontSize: 20 }} />
        </SearchIconWrapper>
        <StyledInputBase
          placeholder="Search..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onFocus={() => {
            if (keyword.trim().length > 0) setOpen(true);
          }}
          inputProps={{ "aria-label": "search" }}
        />
        {keyword && (
          <IconButton
            size="small"
            onClick={handleClear}
            sx={{
              position: "absolute",
              right: 6,
              top: "50%",
              transform: "translateY(-50%)",
              color: "inherit",
              p: 0.5,
            }}
          >
            <ClearIcon sx={{ fontSize: 16 }} />
          </IconButton>
        )}

        {/* Dropdown Results */}
        {open && (
          <Paper
            elevation={6}
            sx={{
              position: "absolute",
              top: "calc(100% + 8px)",
              left: 0,
              right: 0,
              minWidth: { xs: 280, sm: 340 },
              maxHeight: 380,
              overflowY: "auto",
              borderRadius: 3,
              zIndex: 1400,
              backgroundColor: "background.paper",
              border: "1px solid",
              borderColor: "divider",
              boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
            }}
          >
            {loading ? (
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", p: 3, gap: 1.5 }}>
                <CircularProgress size={20} />
                <Typography variant="body2" color="text.secondary">
                  Searching...
                </Typography>
              </Box>
            ) : results.length === 0 ? (
              <Box sx={{ p: 3, textAlign: "center" }}>
                <Typography variant="body2" color="text.secondary">
                  No results found for "<strong>{keyword}</strong>"
                </Typography>
              </Box>
            ) : (
              <List sx={{ p: 1 }}>
                {results.map((user) => {
                  const fullName =
                    [user.firstname, user.lastname].filter(Boolean).join(" ").trim() ||
                    user.name ||
                    user.username;
                  const avatarSrc = getAvatarUrl(user.avatarUrl || user.avatar, user.gender);

                  return (
                    <ListItem
                      key={user.id || user.userId || user.username}
                      button
                      onClick={() => handleSelectUser(user)}
                      sx={{
                        borderRadius: 2,
                        cursor: "pointer",
                        transition: "0.2s",
                        "&:hover": {
                          backgroundColor: "#f0f2f5",
                        },
                        mb: 0.5,
                      }}
                    >
                      <ListItemAvatar>
                        <Avatar src={avatarSrc} alt={fullName}>
                          {!user.avatarUrl && !user.avatar && !user.gender && fullName?.[0]}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Typography variant="subtitle2" fontWeight="bold" color="text.primary">
                            {fullName}
                          </Typography>
                        }
                        secondary={
                          <Typography variant="caption" color="text.secondary">
                            @{user.username} {user.city ? `• ${user.city}` : ""}
                          </Typography>
                        }
                      />
                    </ListItem>
                  );
                })}
              </List>
            )}
          </Paper>
        )}
      </SearchContainer>
    </ClickAwayListener>
  );
}