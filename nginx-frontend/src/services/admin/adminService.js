import {adminHttpClient} from '../../api/adminHttpClient';
import { API } from '../../configurations/configuration';


export const getDashboardStats = async () => {
  const response = await adminHttpClient.get(API.ADMIN.DASHBOARD_STATS);
  return response.data;
};

export const getUsers = async (page, size) => {
  const response = await adminHttpClient.get(`${API.ADMIN.USERS}?page=${page}&size=${size}`);
  return response.data;
};

export const banUser = async (userId) => {
  const response = await adminHttpClient.patch(API.ADMIN.BAN_USER(userId));
  return response.data;
};

export const unbanUser = async (userId) => {
  const response = await adminHttpClient.patch(API.ADMIN.UNBAN_USER(userId));
  return response.data;
};

export const getPosts = async (page, size) => {
  const response = await adminHttpClient.get(`${API.ADMIN.POSTS}?page=${page}&size=${size}`);
  return response.data;
};

export const deletePost = async (postId) => {
  const response = await adminHttpClient.delete(API.ADMIN.DELETE_POST(postId));
  return response.data;
};

export const getRecentAudits = async (page, size) => {
  const response = await adminHttpClient.get(`${API.ADMIN.AUDIT_LOGS}?page=${page}&size=${size}`);
  return response.data;
};