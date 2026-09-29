import httpClient from "../../../api/httpClient";
import { API } from "../../../configurations/configuration";

const executeApi = async (operation, request) => {
  try {
    return await request();
  } catch (error) {
    console.warn(`[chatService] ${operation} failed`, error);
    throw error;
  }
};

export const getMyConversations = async () => 
  executeApi("getMyConversations", () => httpClient.get(API.MY_CONVERSATIONS));

export const createOrGetConversation = async (data) => 
  executeApi("createOrGetConversation", () => httpClient.post(API.CREATE_OR_GET_CONVERSATION, {
    type: data.type,
    participantIds: data.participantIds,
  }));
  
export const createConversation = async (data) => 
  executeApi("createConversation", () => httpClient.post(API.CREATE_CONVERSATION, {
    type: data.type,
    participantIds: data.participantIds,
  }));

export const createMessage = async (data) => 
  executeApi("createMessage", () => httpClient.post(API.CREATE_MESSAGE, {
    conversationId: data.conversationId,
    message: data.message,
  }));

export const getMessages = async (conversationId) => 
  executeApi("getMessages", () => httpClient.get(`${API.GET_CONVERSATION_MESSAGES}?conversationId=${conversationId}`));