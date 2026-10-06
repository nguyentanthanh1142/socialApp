import httpClient from "../../../api/httpClient";
import { API } from "../../../configurations/configuration";
import { getCurrentUserId } from "../../auth/services/authenticationService";

export function buildParticipantsHash(targetUserId) {
  const currentUserId = getCurrentUserId();
  if (!currentUserId || !targetUserId) return null;
  return [String(currentUserId), String(targetUserId)].sort().join("-");
}

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

export const getRelationshipStatus = async (targetUserId) =>
    executeApi("getRelationshipStatus", () => httpClient.get(API.RELATION_STATUS(targetUserId)));

export const acceptFriendByTarget = async (targetUserId) => {
    const hash = buildParticipantsHash(targetUserId);
    return executeApi("acceptFriendByTarget", () => httpClient.put(`${API.ACCEPT_FRIENDS}/${hash}`, {}));
};

export const rejectFriendByTarget = async (targetUserId) => {
    const hash = buildParticipantsHash(targetUserId);
    return executeApi("rejectFriendByTarget", () => httpClient.put(`${API.REFUSE_FRIEND}/${hash}`, {}));
};

export const cancelFriendRequestByTarget = async (targetUserId) =>
    executeApi("cancelFriendRequestByTarget", () => httpClient.put(API.CANCEL_FRIEND_REQUEST(targetUserId), {}));

export const unfriendUser = async (targetUserId) =>
    executeApi("unfriendUser", () => httpClient.put(API.UNFRIEND_USER(targetUserId), {}));

export const blockUser = async (targetUserId) =>
    executeApi("blockUser", () => httpClient.post(API.BLOCK_USER, {
        participantIds: [targetUserId],
    }));

export const unblockUser = async (targetUserId) =>
    executeApi("unblockUser", () => httpClient.put(API.UNBLOCK_USER(targetUserId), {}));