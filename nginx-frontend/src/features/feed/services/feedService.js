import httpClient from "../../../api/httpClient";
import { API } from "../../../configurations/configuration";
import { getMockFeedByCheckpoint } from "../../../shared/mockData";

const USE_MOCK = window._env_?.REACT_APP_USE_MOCK === "true";

const executeApi = async (operation, request, fallback) => {
  if (USE_MOCK) {
    return fallback();
  }

  try {
    return await request();
  } catch (error) {
    console.warn(`[feedService] ${operation} failed`, error);
    throw error;
  }
};

export const getMyFeed = async (checkpoint = null) =>
  executeApi(
    "getMyFeed",
    () =>
      httpClient.get(API.MY_FEED, {
        params: { checkpoint, size: 3 },
      }),
    () => getMockFeedByCheckpoint(checkpoint, 3)
  );

export const markReadPosts = async (postIds) =>
  executeApi(
    "markReadPosts",
    () =>
      httpClient.post(API.MARK_READ_POST, postIds, {
        headers: { "Content-Type": "application/json" },
      }),
    () => ({ data: { result: postIds } })
  );

export const updateCheckpoint = async (lastPostId) =>
  executeApi(
    "updateCheckpoint",
    () =>
      httpClient.post(API.UPDATE_CHECKPOINT, null, {
        params: { lastPostId },
      }),
    () => ({ data: { result: { lastPostId } } })
  );
