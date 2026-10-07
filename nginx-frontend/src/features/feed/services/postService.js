import httpClient from "../../../api/httpClient";
import { API } from "../../../configurations/configuration";
import {
  createMockFeedPost,
  toggleMockPostLike,
  deleteMockPost,
  updateMockPost,
  updateMockPostPrivacy,
} from "../../../shared/mockData";

const USE_MOCK = window._env_?.REACT_APP_USE_MOCK === "true";

const executeApi = async (operation, request, fallback) => {
  if (USE_MOCK) {
    return fallback();
  }

  try {
    return await request();
  } catch (error) {
    console.warn(`[postService] ${operation} failed`, error);
    // If backend endpoint is not yet implemented or fails, use fallback if available
    if (fallback) {
      try {
        return fallback();
      } catch (fbError) {
        throw error;
      }
    }
    throw error;
  }
};

export const getMyPosts = async (page) =>
  executeApi(
    "getMyPosts",
    () =>
      httpClient.get(API.MY_POST, {
        params: { page, size: 10 },
      }),
    () => ({ data: { result: [] } })
  );

export const createPost = async (content, files = [], privacy = "PUBLIC") => {
  const formData = new FormData();
  formData.append("content", content);
  if (privacy) {
    formData.append("privacy", privacy);
  }
  files.forEach((file) => {
    formData.append("files", file, file.name);
  });

  return executeApi(
    "createPost",
    () =>
      httpClient.post(API.CREATE_POST, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      }),
    () => ({
      data: {
        result: createMockFeedPost(content, files, privacy),
      },
    })
  );
};

export const uploadPostImages = async (formData) =>
  executeApi(
    "uploadPostImages",
    () =>
      httpClient.put(API.UPDATE_POST_IMAGES, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      }),
    () => ({ data: { result: formData } })
  );

export const likePost = async (postId) =>
  executeApi(
    "likePost",
    () => httpClient.post(API.LIKE_POST(postId), {}),
    () => ({
      data: {
        result: toggleMockPostLike(postId),
      },
    })
  );

export const deletePost = async (postId) =>
  executeApi(
    "deletePost",
    () => httpClient.delete(API.DELETE_POST(postId)),
    () => ({
      data: {
        result: deleteMockPost(postId),
      },
    })
  );

export const updatePost = async (postId, data) => {
  const formData = new FormData();
  formData.append("content", data.content);
  if (data.privacy) {
    formData.append("privacy", data.privacy);
  }
  data.files.forEach((file) => {
    formData.append("files", file, file.name);
  });

  return executeApi(
    "updatePost",
    () =>
      httpClient.put(API.UPDATE_POST(postId), formData, {
        headers: { "Content-Type": "multipart/form-data" },
      }),
    () => ({
      data: {
        result: updateMockPost(postId, data),
      },
    })
  );
}
export const updatePostPrivacy = async (postId, privacy) =>
  executeApi(
    "updatePostPrivacy",
    () => httpClient.put(API.UPDATE_POST_PRIVACY(postId), { privacy }),
    () => ({
      data: {
        result: updateMockPostPrivacy(postId, privacy),
      },
    })
  );

export const hidePost = async (postId) =>
  executeApi(
    "hidePost",
    () => httpClient.post(`/post/${postId}/hide`, {}),
    () => ({ data: { result: { postId, hidden: true } } })
  );

export const reportPost = async (postId, reason = "") =>
  executeApi(
    "reportPost",
    () => httpClient.post(`/post/${postId}/report`, { reason }),
    () => ({ data: { result: { postId, reported: true } } })
  );

export const savePost = async (postId) =>
  executeApi(
    "savePost",
    () => httpClient.post(`/post/${postId}/save`, {}),
    () => ({ data: { result: { postId, saved: true } } })
  );
