import React from "react";
import { Box, Avatar, Typography } from "@mui/material";
import { getAvatarUrl } from "../../../utils/avatarUtils";

/**
 * Facebook-style cover + overlapping avatar shell for profile pages.
 */
export default function ProfileCoverLayout({
  coverUrl,
  avatarUrl,
  gender,
  displayName,
  subtitle,
  actions,
  avatarSlot,
}) {
  return (
    <Box
      sx={{
        borderRadius: { xs: 0, sm: 3 },
        overflow: "hidden",
        bgcolor: "background.paper",
        boxShadow: { xs: 0, sm: "0 1px 2px rgba(0,0,0,0.08)" },
        border: { xs: "none", sm: "1px solid" },
        borderColor: "divider",
        mb: 3,
      }}
    >
      <Box
        sx={{
          width: "100%",
          height: { xs: 200, sm: 280, md: 320 },
          backgroundColor: "#1877f2",
          backgroundImage: coverUrl
            ? `url(${coverUrl})`
            : "linear-gradient(135deg, #1877f2 0%, #42b0ff 100%)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />

      <Box
        sx={{
          px: { xs: 2, sm: 3, md: 4 },
          pb: { xs: 2.5, sm: 3 },
          pt: 0,
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            alignItems: { xs: "center", md: "flex-end" },
            justifyContent: "space-between",
            gap: { xs: 2, md: 3 },
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              alignItems: { xs: "center", md: "flex-end" },
              gap: { xs: 1.5, md: 2.5 },
              width: { md: "100%" },
              flex: 1,
              minWidth: 0,
            }}
          >
            <Box
              sx={{
                mt: { xs: -7, md: -10 },
                flexShrink: 0,
                alignSelf: { xs: "center", md: "flex-start" },
              }}
            >
              {avatarSlot || (
                <Avatar
                  src={getAvatarUrl(avatarUrl, gender)}
                  alt={displayName}
                  sx={{
                    width: { xs: 128, sm: 152, md: 168 },
                    height: { xs: 128, sm: 152, md: 168 },
                    border: "4px solid",
                    borderColor: "background.paper",
                    boxShadow: 2,
                    bgcolor: "primary.main",
                    fontSize: { xs: 40, md: 52 },
                  }}
                >
                  {displayName?.[0]}
                </Avatar>
              )}
            </Box>

            <Box
              sx={{
                textAlign: { xs: "center", md: "left" },
                pt: { md: 1 },
                minWidth: 0,
              }}
            >
              <Typography
                variant="h4"
                fontWeight={700}
                sx={{ fontSize: { xs: "1.5rem", sm: "1.75rem", md: "2rem" }, lineHeight: 1.2 }}
              >
                {displayName}
              </Typography>
              {subtitle && (
                <Typography color="text.secondary" sx={{ mt: 0.75, fontSize: "0.95rem" }}>
                  {subtitle}
                </Typography>
              )}
            </Box>
          </Box>

          {actions && (
            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                gap: 1,
                justifyContent: { xs: "center", md: "flex-end" },
                pb: { md: 0.5 },
                flexShrink: 0,
              }}
            >
              {actions}
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
}
