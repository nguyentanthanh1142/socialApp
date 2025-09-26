import { redirect } from "react-router-dom";

export const CONFIG = {
  API_GATEWAY:
    window._env_?.REACT_APP_API_GATEWAY || "http://localhost:8888/api/v1",
};
export const OAuthConfig = {
  clientId:
    window._env_?.REACT_APP_CLIENT_ID ||
    "681874681914-2v5tnop8tehclnvfmasmnou3qqn5b45v.apps.googleusercontent.com",
  redirectUri:
    window._env_?.REACT_APP_AUTH_REDIRECT_URL ||
    "http://localhost:3000/authenticated",
  authUri: "https://accounts.google.com/o/oauth2/auth"
}


export const API = {
  LOGIN: "/identity/auth/token",
  OUTBOUND_AUTHENTICAIe: "identity/auth/outbound/authentication",
  REGISTER: "/identity/users/registration",
  MY_INFO: "/profile/users/my-profile",
  MY_POST: "/post/my-posts",
  CREATE_POST: "/post/create",
  UPDATE_PROFILE: "/profile/users/my-profile",
  UPDATE_AVATAR: "/profile/users/avatar",
  SEARCH_USER: "/profile/users/search",
  MY_CONVERSATIONS: "/chat/conversations/my-conversations",
  CREATE_CONVERSATION: "/chat/conversations/create",
  CREATE_MESSAGE: "/chat/messages/create",
  GET_CONVERSATION_MESSAGES: "/chat/messages",
  SEND_FRIEND_REQUEST: "/relation/pending",
  MY_FRIEND_REQUESTS: "relation/m",
  ACCEPT_FRIENDS: "/relation/accept",
  MY_FRIENDS: "/relation/my-friends",
  FRIENDS_SUGGESTION: "/relation/friends-suggestion",
  MY_FEED: "/feed/my-feed",
};

