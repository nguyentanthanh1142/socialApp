import httpClient from "../../../api/httpClient";
import { API } from "../../../configurations/configuration";

const executeApi = async (operation, request) => {
    try {
        return await request();
    } catch (error) {
        console.warn(`[friendService] ${operation} failed`, error);
        throw error;
    }
};

export const getMyFriendsList = async () => 
    executeApi("getMyFriendsList", () => httpClient.get(API.MY_FRIENDS));

export const getMyFriendRequest = async () => 
    executeApi("getMyFriendRequest", () => httpClient.get(API.MY_FRIEND_REQUESTS));

export const getFriendsSuggestion = async () => 
    executeApi("getFriendsSuggestion", () => httpClient.get(API.FRIENDS_SUGGESTION));

export const sendFriendsRequest = async (friendId) => 
    executeApi("sendFriendsRequest", () => httpClient.post(API.SEND_FRIEND_REQUEST, {
        status: "PENDING",
        participantIds: [friendId],
    }));

export const acceptFriend = async (relationId) => 
    executeApi("acceptFriend", () => httpClient.put(`${API.ACCEPT_FRIENDS}/${relationId}`, {}));

export const deleteFriendRequest = async (id) => 
    executeApi("deleteFriendRequest", () => httpClient.delete(`${API.MY_FRIEND_REQUESTS}/${id}`));

export const getListContactRelation = async ({ page = 0, size = 10 }) => 
    executeApi("getListContactRelation", () => httpClient.get(`${API.GET_LIST_CONTACT_RELATION}?page=${page}&size=${size}`));

export const sendBatchFriendRequests = async (friendIds) =>
    executeApi("sendBatchFriendRequests", () => httpClient.post(API.SEND_FRIEND_REQUEST, {
        status: "PENDING",
        participantIds: friendIds,
    }));