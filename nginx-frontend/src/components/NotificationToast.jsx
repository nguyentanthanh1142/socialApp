import React from "react";
import { getAvatarUrl } from "../utils/avatarUtils";

export default function NotificationToast({ avatarUrl, gender, message }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "10px",
        background: "#fff",
        padding: "10px 14px",
        borderRadius: "10px",
        boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
        color: "#333",
      }}
    >
      <img
        src={getAvatarUrl(avatarUrl, gender)}
        alt="avatar"
        style={{ width: 40, height: 40, borderRadius: "50%" }}
      />
      <div style={{ fontSize: "15px", fontWeight: 500 }}>{message}</div>
    </div>
  );
}
