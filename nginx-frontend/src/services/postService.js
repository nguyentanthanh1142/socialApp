import httpClient from "../configurations/httpClient";
import { API } from "../configurations/configuration";
import { getToken } from "./localStorageService";
import {
  createMockFeedPost,
  toggleMockPostLike,
} from "../mockData";

const USE_MOCK = window._env_?.REACT_APP_USE_MOCK === "true" || false;

const buildAuthHeaders = () => ({
  Authorization: `Bearer ${getToken()}`,
});

const withMockFallback = async (operation, request, fallback) => {
  if (USE_MOCK) {
    return fallback();
  }

  try {
    return await request();
  } catch (error) {
    console.warn(`[postService] ${operation} failed`, error);
    return fallback();
  }
};

export const getMyPosts = async (page) => withMockFallback(
  "getMyPosts",
  () => httpClient.get(API.MY_POST, {
    headers: buildAuthHeaders(),
    params: {
      page,
      size: 10,
    },
  }),
  () => ({
    data: {
      result: [],
    },
  })
);

export const createPost = async (content, files = []) => {
  const formData = new FormData();
  formData.append("content", content);
  files.forEach((file) => {
    formData.append("files", file);
  });

  return withMockFallback(
    "createPost",
    () => httpClient.post(API.CREATE_POST, formData, {
      headers: {
        ...buildAuthHeaders(),
        "Content-Type": "multipart/form-data",
      },
    }),
    () => ({
      data: {
        result: createMockFeedPost(content, files),
      },
    })
  );
};

export const uploadPostImages = async (formData) => withMockFallback(
  "uploadPostImages",
  () => httpClient.put(API.UPDATE_POST_IMAGES, formData, {
    headers: {
      ...buildAuthHeaders(),
      "Content-Type": "multipart/form-data",
    },
  }),
  () => ({
    data: {
      result: formData,
    },
  })
);

export const likePost = async (postId) => withMockFallback(
  "likePost",
  () => httpClient.post(API.LIKE_POST(postId), {}, {
    headers: buildAuthHeaders(),
  }),
  () => ({
    data: {
      result: toggleMockPostLike(postId),
    },
  })
);
