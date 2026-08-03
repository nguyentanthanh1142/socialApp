import httpClient from "../configurations/httpClient";
import { API } from "../configurations/configuration";
import { getToken } from "./localStorageService";
import {
  getMockFeedByCheckpoint,
  getMockFeedSnapshot,
} from "../mockData";

const USE_MOCK = window._env_?.REACT_APP_USE_MOCK === "true" || false;

const buildAuthHeaders = () => ({
  Authorization: `Bearer ${getToken()}`,
});

const createFeedResponse = (data) => ({
  data: {
    result: {
      data,
    },
  },
});

const withMockFallback = async (operation, request, fallback) => {
  if (USE_MOCK) {
    return fallback();
  }

  try {
    return await request();
  } catch (error) {
    console.warn(`[feedService] ${operation} failed`, error);
    return fallback();
  }
};

export const getMyFeed = async (checkpoint = null) => withMockFallback(
  "getMyFeed",
  () => httpClient.get(API.MY_FEED, {
    headers: buildAuthHeaders(),
    params: {
      checkpoint,
      size: 3,
    },
  }),
  () => getMockFeedByCheckpoint(checkpoint, 3)
  // () => createFeedResponse(getMockFeedSnapshot())
);

export const markReadPosts = async (postIds) => withMockFallback(
  "markReadPosts",
  () => httpClient.post(API.MARK_READ_POST, postIds, {
    headers: {
      ...buildAuthHeaders(),
      "Content-Type": "application/json",
    },
  }),
  () => ({
    data: {
      result: postIds,
    },
  })
);

export const updateCheckpoint = async (lastPostId) => withMockFallback(
  "updateCheckpoint",
  () => httpClient.post(
    API.UPDATE_CHECKPOINT,
    null,
    {
      headers: {
        ...buildAuthHeaders(),
      },
      params: {
        lastPostId,
      },
    }
  ),
  () => ({
    data: {
      result: {
        lastPostId,
      },
    },
  })
);