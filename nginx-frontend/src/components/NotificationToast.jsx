import React from "react";

export default function NotificationToast({ avatarUrl, message }) {
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
        src={avatarUrl}
        alt="avatar"
        style={{ width: 40, height: 40, borderRadius: "50%" }}
      />
      <div style={{ fontSize: "15px", fontWeight: 500 }}>{message}</div>
    </div>
  );
}
