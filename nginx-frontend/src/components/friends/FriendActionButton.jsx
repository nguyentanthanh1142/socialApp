import { Button } from "@mui/material";

export default function FriendActionButton({ 
  label,
  variant = "contained",
  color = "#2374e1",
  onClick,
  sx = {},
}) {
  return (
    <Button
      variant={variant}
      fullWidth
      onClick={onClick}
      sx={{
        mt: 1,
        borderRadius: 2,
        textTransform: "none",
        fontWeight: 600,
        fontSize: 14,
        boxShadow: "none",
        bgcolor: variant === "contained" ? color : "#fff",
        color: variant === "contained" ? "#fff" : "#050505",
        borderColor: variant === "outlined" ? "#ced0d4" : "transparent",
        "&:hover": {
          bgcolor:
            variant === "contained"
              ? "#1b63c5"
              : "#f0f2f5",
          borderColor: variant === "outlined" ? "#bbb" : "transparent",
          boxShadow: "none",
        },
        ...sx, 
      }}
    >
      {label}
    </Button>
  );
}