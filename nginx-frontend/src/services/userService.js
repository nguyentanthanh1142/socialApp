import httpClient from "../configurations/httpClient";
import {API} from "../configurations/configuration";
import {getToken} from "./localStorageService";

const buildAuthHeaders = () => ({
    Authorization: `Bearer ${getToken()}`,
});

const withRequestWarning = async (operation, request) => {
  try {
    return await request();
  } catch (error) {
    console.warn(`[userService] ${operation} failed`, error);
    throw error;
  }
};

export const getMyInfo = async () =>{
    return await withRequestWarning("getMyInfo", () => httpClient.get(API.MY_INFO, {
        headers: buildAuthHeaders(),
    }));
};
export const getProfile = async (username) =>{
  return await withRequestWarning("getProfile", () => httpClient.get(API.GET_PUBLIC_INFO, username,{

            headers: buildAuthHeaders(),
  }));
}

export const updateProfile = async (profileData) => {
  return await withRequestWarning("updateProfile", () => httpClient.put(API.UPDATE_PROFILE, profileData, {
    headers: {
      ...buildAuthHeaders(),
      "Content-Type": "application/json",
    },
  }));
};

export const uploadAvatar = async (formData) => {
  return await withRequestWarning("uploadAvatar", () => httpClient.put(API.UPDATE_AVATAR, formData, {
    headers: {
      ...buildAuthHeaders(),
      "Content-Type": "multipart/form-data",
    },
  }));
};
export const search = async (keyword) => {
  return await withRequestWarning("search", () => httpClient.post(
    API.SEARCH_USER,
    { keyword: keyword },
    {
      headers: {
        ...buildAuthHeaders(),
        "Content-Type": "application/json",
      },
    }
  ));
};