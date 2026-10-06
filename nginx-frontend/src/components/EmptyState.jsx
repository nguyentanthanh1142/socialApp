import React from "react";
import { Box, Typography, Button } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";

/**
 * Compact empty placeholder for sidebars, lists, and panels.
 */
export default function EmptyState({
  icon: Icon,
  title,
  description,
  primaryLabel,
  primaryOnClick,
  primaryTo,
  secondaryLabel,
  secondaryOnClick,
  secondaryTo,
  sx,
}) {
  return (
    <Box
      sx={{
        px: 2.5,
        py: 3,
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 1,
        ...sx,
      }}
    >
      {Icon && (
        <Box
          sx={{
            width: 56,
            height: 56,
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: "action.hover",
            mb: 0.5,
          }}
        >
          <Icon sx={{ fontSize: 28, color: "text.secondary", opacity: 0.85 }} />
        </Box>
      )}
      <Typography variant="subtitle1" fontWeight={600} color="text.primary">
        {title}
      </Typography>
      {description && (
        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 280, lineHeight: 1.5 }}>
          {description}
        </Typography>
      )}
      {(primaryLabel || secondaryLabel) && (
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 1,
            justifyContent: "center",
            mt: 1.5,
            width: "100%",
          }}
        >
          {primaryLabel && (
            <Button
              variant="contained"
              size="small"
              component={primaryTo ? RouterLink : "button"}
              to={primaryTo}
              onClick={primaryOnClick}
              sx={{ textTransform: "none", fontWeight: 600, borderRadius: 2, px: 2 }}
            >
              {primaryLabel}
            </Button>
          )}
          {secondaryLabel && (
            <Button
              variant="outlined"
              size="small"
              component={secondaryTo ? RouterLink : "button"}
              to={secondaryTo}
              onClick={secondaryOnClick}
              sx={{ textTransform: "none", fontWeight: 600, borderRadius: 2, px: 2 }}
            >
              {secondaryLabel}
            </Button>
          )}
        </Box>
      )}
    </Box>
  );
}
