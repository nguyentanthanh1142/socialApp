import httpClient from "../configurations/httpClient";
import { API } from "../configurations/configuration";

const withRequestWarning = async (operation, request) => {
  try {
    return await request();
  } catch (error) {
    console.warn(`[chatService] ${operation} failed`, error);
    throw error;
  }
};

export const getMyConversations = async () => {
  return await withRequestWarning("getMyConversations", () => 
    httpClient.get(API.MY_CONVERSATIONS)
  );
};
export const createConversation = async (data) => {
  return await withRequestWarning("createConversation", () => 
    httpClient.post(API.CREATE_CONVERSATION, {
      type: data.type,
      participantIds: data.participantIds,
    })
  );
};


export const createMessage = async (data) => {
  return await withRequestWarning("createMessage", () => 
    httpClient.post(API.CREATE_MESSAGE, {
      conversationId: data.conversationId,
      message: data.message,
    })
  );
};

export const getMessages = async (conversationId) => {
  return await withRequestWarning("getMessages", () => 
    httpClient.get(`${API.GET_CONVERSATION_MESSAGES}?conversationId=${conversationId}`)
  );
};