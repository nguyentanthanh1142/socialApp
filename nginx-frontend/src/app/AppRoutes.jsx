import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "../components/auth/ProtectedRoute";
import Login from "../features/auth/pages/Login";
import Register from "../features/auth/pages/Register";
import Authenticate from "../features/auth/components/Authenticate";
import Home from "../features/feed/pages/Home";
import Profile from "../features/profile/pages/Profile";
import ProfileFacebook from "../features/profile/pages/ProfileFacebook";
import Friends from "../features/friends/pages/Friends";
import FriendsList from "../features/friends/components/FriendsList";
import Chat from "../features/chat/pages/Chat";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/authenticated" element={<Authenticate />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<Home />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/friends" element={<Friends />}>
          <Route index element={<Navigate to="list" replace />} />
          <Route path="list" element={<FriendsList />} />
        </Route>
        <Route path="/:username" element={<ProfileFacebook />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;