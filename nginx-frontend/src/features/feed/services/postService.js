import httpClient from "../../../api/httpClient";
import { API } from "../../../configurations/configuration";
import {
  createMockFeedPost,
  toggleMockPostLike,
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

export const createPost = async (content, files = []) => {
  const formData = new FormData();
  formData.append("content", content);
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
        result: createMockFeedPost(content, files),
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
