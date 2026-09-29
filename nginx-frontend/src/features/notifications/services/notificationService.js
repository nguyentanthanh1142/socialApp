import httpClient from "../../../api/httpClient";
import { API } from "../../../configurations/configuration";

const executeApi = async (operation, request) => {
  try {
    return await request();
  } catch (error) {
    console.warn(`[notificationService] ${operation} failed`, error);
    throw error;
  }
};

export const getMyNotifications = async (page) => 
  executeApi("getMyNotifications", () => httpClient.get(API.MY_NOTIFICATIONS, {
    params: {
      page: page,
      size: 10,
    },
  }));