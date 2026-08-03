import httpClient from "../configurations/httpClient";
import {API} from "../configurations/configuration"
import {getToken} from "./localStorageService"

const buildAuthHeaders = () => ({
  Authorization: `Bearer ${getToken()}`,
});

const withRequestWarning = async (operation, request) => {
  try {
    return await request();
  } catch (error) {
    console.warn(`[notificationService] ${operation} failed`, error);
    throw error;
  }
};

export const getMyNotifications = async (page)  =>{
  return await withRequestWarning("getMyNotifications", () => httpClient.get(API.MY_NOTIFICATIONS,{
    headers: buildAuthHeaders(),
    params:{
      page: page,
      size: 10,
    }
  }));
}
export const createPost = async (content,files = []) => {

  const formData = new FormData();
  formData.append("content",content);
  files.forEach((file)=> {
    formData.append("files",file);
  });
  return await withRequestWarning("createPost", () => httpClient.post(
    API.CREATE_POST,
    formData,
    {
      headers: {
        ...buildAuthHeaders(),
        "Content-Type": "multipart/form-data",
      },
    }
  ));
  
};
export const uploadPostImages = async (formData) => {
  return await withRequestWarning("uploadPostImages", () => httpClient.put(API.UPDATE_AVATAR, formData, {
    headers: {
      ...buildAuthHeaders(),
      "Content-Type": "multipart/form-data",
    },
  }));
};
export const likePost = async (postId) => {
  return await withRequestWarning("likePost", () => httpClient.post(API.LIKE_POST(postId), {},{
    headers: buildAuthHeaders(),
  }));
};
