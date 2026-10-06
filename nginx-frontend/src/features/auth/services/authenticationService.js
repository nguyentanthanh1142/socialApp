import {
  getToken,
  setToken,
  removeToken,
  isTokenValid,
  setFirstLogin,
  getFirstLogin,
  removeFirstLogin,
} from "../../../storage/localStorageService";
import httpClient, { axiosPublicClient } from "../../../api/httpClient";
import { API } from "../../../configurations/configuration";
import { jwtDecode } from "jwt-decode";

export const logIn = async (username, password) => {
  const response = await axiosPublicClient.post(API.LOGIN, {
    username,
    password,
  });
  const result = response.data?.result || {};
  setToken(result.token);
  setFirstLogin(result.firstLogin ?? false);
  return response;
};

export const outbound = async (code) => {
  const response = await axiosPublicClient.post(
    `${API.OUTBOUND_AUTHENTICATION}?code=${code}`
  );
  const result = response.data?.result || {};
  setToken(result.token);
  setFirstLogin(result.firstLogin ?? false);
  return response;
};

export const register = async (
  username,
  password,
  firstname,
  lastname,
  city,
  email,
  birthday
) => {
  return await axiosPublicClient.post(API.REGISTER, {
    username,
    password,
    firstname,
    lastname,
    city,
    email,
    birthday,
  });
};

export const logOut = () => {
  removeToken();
  removeFirstLogin();
};

export const isAuthenticated = () => isTokenValid();

export const isFirstLoginFromStorage = () => getFirstLogin();

export const clearFirstLoginFlag = () => removeFirstLogin();

export const checkAuthApi = async () => {
  const response = await httpClient.get(API.CHECK_AUTH);
  return response.data;
}

export const getCurrentUserId = () => {
  const token = getToken();
  if (!token) return null;

  try {
    const decoded = jwtDecode(token);
    return decoded.sub || decoded.id || decoded.userId || null;
  } catch (error) {
    console.error("Failed to decode token:", error);
    return null;
  }
};

export const resendVerification = async (email) => {
  return await axiosPublicClient.post(API.RESEND_VERIFICATION, { email });
};