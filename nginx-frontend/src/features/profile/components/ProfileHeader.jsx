import React from "react";
import { Button } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../../providers/UserProvider";
import ProfileCoverLayout from "./ProfileCoverLayout";
import ProfileRelationActions from "./ProfileRelationActions";
import { getAvatarUrl } from "../../../utils/avatarUtils";

export default function ProfileHeader({ user }) {
  const navigate = useNavigate();
  const { currentUser } = useUser();

  const displayName =
    user?.fullName ||
    [user?.firstName || user?.firstname, user?.lastName || user?.lastname].filter(Boolean).join(" ").trim() ||
    user?.name ||
    user?.username ||
    "User";

  const targetUserId = user?.userId || user?.id;
  const city = user?.currentCity || user?.city;

  const isMe =
    user?.isSelf === true ||
    (currentUser &&
      targetUserId &&
      (String(currentUser.id) === String(targetUserId) ||
        String(currentUser.userId) === String(targetUserId) ||
        String(currentUser.username) === String(user?.username)));

  const subtitle = [`@${user?.username}`, city].filter(Boolean).join(" • ");

  return (
    <ProfileCoverLayout
      coverUrl={user?.coverUrl}
      avatarUrl={getAvatarUrl(user?.avatarUrl || user?.avatar, user?.gender)}
      gender={user?.gender}
      displayName={displayName}
      subtitle={subtitle}
      actions={
        isMe ? (
          <Button
            variant="contained"
            startIcon={<EditIcon />}
            onClick={() => navigate("/profile")}
            sx={{ borderRadius: 2, textTransform: "none", fontWeight: 600, px: 2.5 }}
          >
            Edit Profile
          </Button>
        ) : (
          <ProfileRelationActions targetUserId={targetUserId} />
        )
      }
    />
  );
}
