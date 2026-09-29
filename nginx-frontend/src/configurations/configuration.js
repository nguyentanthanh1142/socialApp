export const CONFIG = {
  API_GATEWAY:
    window._env_?.REACT_APP_API_GATEWAY || "http://localhost:8888/api/v1",
  SOCKET_URL:
    window._env_?.REACT_APP_SOCKET_URL ||
    process.env.REACT_APP_SOCKET_URL ||
    "http://localhost:8888",
};

export const OAuthConfig = {
  clientId:
    window._env_?.REACT_APP_CLIENT_ID ||
    "681874681914-2v5tnop8tehclnvfmasmnou3qqn5b45v.apps.googleusercontent.com",
  redirectUri:
    window._env_?.REACT_APP_AUTH_REDIRECT_URL || "http://localhost:3000/authenticated",
  authUri: "https://accounts.google.com/o/oauth2/auth",
};

export const API = {
  LOGIN: "/identity/auth/token",
  OUTBOUND_AUTHENTICATION: "/identity/auth/outbound/authentication",
  REGISTER: "/identity/auth/registration",
  RESEND_VERIFICATION: "/identity/auth/resend-verification",
  MY_INFO: "/profile/users/my-profile",
  GET_PUBLIC_INFO: "/profile/users/profile",
  MY_POST: "/post/my-posts",
  CREATE_POST: "/post/create",
  UPDATE_PROFILE: "/profile/users/my-profile",
  COMPLETE_ONBOARDING: "/profile/users/onboarding",
  CHECK_AUTH: "/identity/auth/check-auth",
  UPDATE_AVATAR: "/profile/users/avatar",
  SEARCH_USER: "/profile/users/search",
  MY_CONVERSATIONS: "/chat/conversations/my-conversations",
  CREATE_OR_GET_CONVERSATION: "/chat/conversations/create-or-get",
  CREATE_CONVERSATION: "/chat/conversations/create",
  CREATE_MESSAGE: "/chat/messages/create",
  GET_CONVERSATION_MESSAGES: "/chat/messages/get",
  SEND_FRIEND_REQUEST: "/relation/pending",
  MY_FRIEND_REQUESTS: "/relation/my-friend-requests",
  ACCEPT_FRIENDS: "/relation/accept",
  MY_FRIENDS: "/relation/my-friends",
  FRIENDS_SUGGESTION: "/relation/friends-suggestion",
  MY_FEED: "/feed/my-feed",
  MARK_READ_POST: "/feed/read",
  UPDATE_CHECKPOINT: "/feed/checkpoint",
  UPDATE_POST_IMAGES: "/profile/users/avatar",
  LIKE_POST: (postId) => `/post/${postId}/like`,
  MY_NOTIFICATIONS: "/notification/notifications",
  GET_LIST_CONTACT_RELATION: "/relation/contact",
  PRESENCE_BATCH: "/ws/presence/batch",

  ADMIN: {
    LOGIN: "/admin/auth/login",
    LOGOUT: "/admin/auth/logout",
    CHECK_AUTH: "/admin/auth/check-auth",
    DASHBOARD_STATS: "/admin/api/stats",
    USERS: "/admin/api/users",
    BAN_USER: (userId) => `/admin/api/users/${userId}/ban`,
    UNBAN_USER: (userId) => `/admin/api/users/${userId}/unban`,
    POSTS: "/admin/api/posts",
    DELETE_POST: (postId) => `/admin/api/posts/${postId}`,
    AUDIT_LOGS: "/admin/api/recent-audits",
  },
};

