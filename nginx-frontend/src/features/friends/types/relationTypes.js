/**
 * @typedef {'NONE' | 'PENDING' | 'ACCEPTED' | 'BLOCKED'} RelationStatus
 * 
 * @typedef {'SEND_REQUEST' | 'CANCEL_REQUEST' | 'ACCEPT_REQUEST' | 'REJECT_REQUEST' | 'UNFRIEND' | 'BLOCK' | 'UNBLOCK'} RelationAction
 * 
 * @typedef {Object} RelationStatusResponse
 * @property {string} targetUserId
 * @property {RelationStatus} status
 * @property {boolean} isIssuer
 * @property {boolean} isFollowing
 * @property {boolean} isBlocked
 * @property {string} updatedAt
 * @property {RelationAction[]} availableActions
 * 
 * @typedef {Object} Participant
 * @property {string} userId
 * @property {string} username
 * @property {string} firstname
 * @property {string} lastname
 * @property {string} avatar
 * 
 * @typedef {Object} RelationResponse
 * @property {string} id
 * @property {string} status
 * @property {string} participantsHash
 * @property {string} conversationAvatar
 * @property {string} conversationName
 * @property {Participant[]} participants
 * @property {string} createdDate
 * @property {string} modifiedDate
 * 
 * @typedef {Object} SuggestionResponse
 * @property {string} userId
 * @property {string} username
 * @property {string} fullName
 * @property {string} avatarUrl
 * @property {number} mutualFriendsCount
 * @property {string[]} mutualFriendNames
 * @property {string} headline
 * @property {string} suggestionReason
 */

export const RELATION_STATUS = {
  NONE: "NONE",
  PENDING: "PENDING",
  ACCEPTED: "ACCEPTED",
  BLOCKED: "BLOCKED",
};

export const RELATION_ACTIONS = {
  SEND_REQUEST: "SEND_REQUEST",
  CANCEL_REQUEST: "CANCEL_REQUEST",
  ACCEPT_REQUEST: "ACCEPT_REQUEST",
  REJECT_REQUEST: "REJECT_REQUEST",
  UNFRIEND: "UNFRIEND",
  BLOCK: "BLOCK",
  UNBLOCK: "UNBLOCK",
};
