import axios from "axios";
import { adminHttpClient } from "../../api/adminHttpClient";
import { API } from "../../configurations/configuration";


export const isAdminAuthenticated = async (config = {}) => {
  try {
    console.log(config);
    const { data } = await adminHttpClient.get(API.ADMIN.CHECK_AUTH, config);
    console.log(data);
    if (typeof data?.authenticated === "boolean") {
      return data.authenticated;
    }

    if (typeof data?.result?.authenticated === "boolean") {
      return data.result.authenticated;
    }
    return false;
  } catch (error) {
    if (axios.isCancel(error) || error.name === "CanceledError" || error.code === "ERR_CANCELED") {
      throw error;
    }
    return false;
  }
};
export const adminLogIn = async (credentials) => {
  const response = await adminHttpClient.post(API.ADMIN.LOGIN, credentials);
  return response.data;
};

export const adminLogOut = async () => {
  const response = await adminHttpClient.post(API.ADMIN.LOGOUT);
  return response.data;
};