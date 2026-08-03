import httpClient from "../configurations/httpClient";
import { API } from "../configurations/configuration";
import { getToken } from "./localStorageService";

const buildAuthHeaders = () => ({
    Authorization: `Bearer ${getToken()}`,
});

const executeApi = async (operation, request) => {
    try {
        return await request();
    } catch (error) {
        console.warn(`[friendService] ${operation} failed`, error);
        throw error;
    }
};

export const getMyFriendsList = async () => executeApi(
    "getMyFriendsList",
    () => httpClient.get(API.MY_FRIENDS, {
        headers: buildAuthHeaders(),
    })
);

export const getMyFriendRequest = async () => executeApi(
    "getMyFriendRequest",
    () => httpClient.get(API.MY_FRIEND_REQUESTS, {
        headers: buildAuthHeaders(),
    })
);

export const getFriendsSuggestion = async () => executeApi(
    "getFriendsSuggestion",
    () => httpClient.get(API.FRIENDS_SUGGESTION, {
        headers: buildAuthHeaders(),
    })
);

export const sendFriendsRequest = async (friendId) => executeApi(
    "sendFriendsRequest",
    () => httpClient.post(
        API.SEND_FRIEND_REQUEST,
        {
            status: "PENDING",
            participantIds: [friendId],
        },
        {
            headers: {
                ...buildAuthHeaders(),
                "Content-Type": "application/json",
            },
        }
    )
);

export const acceptFriend = async (relationId) => executeApi(
    "acceptFriend",
    () => httpClient.put(
        `${API.ACCEPT_FRIENDS}/${relationId}`,
        {},
        {
            headers: {
                ...buildAuthHeaders(),
                "Content-Type": "application/json",
            },
        }
    )
);

export const createMessage = async (data) => executeApi(
    "createMessage",
    () => httpClient.post(
        API.CREATE_MESSAGE,
        {
            conversationId: data.conversationId,
            message: data.message,
        },
        {
            headers: {
                ...buildAuthHeaders(),
                "Content-Type": "application/json",
            },
        }
    )
);

export const getMessages = async (conversationId) => executeApi(
    "getMessages",
    () => httpClient.get(`${API.GET_CONVERSATION_MESSAGES}?conversationId=${conversationId}`, {
        headers: buildAuthHeaders(),
    })
);

export const deleteFriendRequest = async (id) => executeApi(
    "deleteFriendRequest",
    () => httpClient.delete(`${API.MY_FRIEND_REQUESTS}/${id}`, {
        headers: buildAuthHeaders(),
    })
);