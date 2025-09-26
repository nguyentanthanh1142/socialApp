import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Home from "../pages/Home";
import Profile from "../pages/Profile";
import Authenticate from "../components/header/Authenticate";
import FriendsList from "../components/friends/FriendsList";
import Friends from "../pages/Friends";
import Profilefb from "../pages/ProfileFacebook";
import Chat from "../pages/Chat";

const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<Home />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/authenticated" element={<Authenticate />} />
        {/* <Route path="/friends" element={<Friends />} />
        <Route path="/friends/list" element={<Friends />} /> */}
        <Route path="/friends" element={<Friends />}>
          <Route path="list" element={<FriendsList />} />
          {/* <Route path="sugges0.t" element={<FriendsSuggest />} />
          <Route path="requests" element={<FriendsRequest />} /> */}
        </Route>
        <Route path="/:username" element={<Profilefb />} />
      </Routes>
    </Router>
  );
};

export default AppRoutes;
