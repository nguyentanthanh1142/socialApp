import httpClient from "../../../api/httpClient";
import { API } from "../../../configurations/configuration";

const executeApi = async (operation, request) => {
    try {
        return await request();
    } catch (error) {
        console.warn(`[userService] ${operation} failed`, error);
        throw error;
    }
};

export const getMyInfo = async () => 
    executeApi("getMyInfo", () => httpClient.get(API.MY_INFO));

export const getProfile = async (username) => 
    executeApi("getProfile", () => httpClient.get(`${API.GET_PUBLIC_INFO}/${username}`));

export const updateProfile = async (profileData) => 
    executeApi("updateProfile", () => httpClient.put(API.UPDATE_PROFILE, profileData, {
        headers: {
            "Content-Type": "application/json",
        },
    }));

export const uploadAvatar = async (formData) => 
    executeApi("uploadAvatar", () => httpClient.put(API.UPDATE_AVATAR, formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    }));

export const search = async (keyword) => 
    executeApi("search", () => httpClient.post(
        API.SEARCH_USER,
        { keyword: keyword },
        {
            headers: {
                "Content-Type": "application/json",
            },
        }
    ));