import httpClient from "../api/httpClient";
import { API } from "../configurations/configuration"; 

const executeApi = async (operation, request) => {
  try {
    return await request();
  } catch (error) {
    console.warn(`[presenceService] ${operation} failed`, error);
    throw error;
  }
};

export const getPresencesBatch = async (userIds) => 
  executeApi("getPresencesBatch", () => httpClient.post(
    API.PRESENCE_BATCH, 
    userIds,
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  ));