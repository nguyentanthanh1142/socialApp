import { getToken, setToken, removeToken } from "./localStorageService";
import httpClient from "../configurations/httpClient"; 
import {API} from "../configurations/configuration"


export const logIn = async (username,password) =>{
  const response = await httpClient.post(API.LOGIN,{
    username: username,
    password: password,
  });
  setToken(response.data?.result?.token);
  return response;
}

export const outbound = async (code) =>{
  const response = await httpClient.post(API.OUTBOUND_AUTHENTICAIe + `?code=${code}`,{
  });
  setToken(response.data?.result?.token);
  return response;
}




export const register = async (username,password,firstname,lastname,city,email,birthday) =>{
  const response = await httpClient.post(API.REGISTER,{
    username: username,
    password: password,
    firstname: firstname,
    lastname:lastname,
    city:city,
    email:email,
    birthday: birthday,
  });
  
  return response;
}

 export const logOut = () => {
  removeToken();
};

export const isAuthenticated = () =>{
  return getToken();
}
