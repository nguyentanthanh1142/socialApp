import { io } from "socket.io-client";
import {getToken} from "./localStorageService";

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || "http://localhost:8999";

export const createSocket = () => {
    return io(SOCKET_URL, {
        transports: ["websocket"],
        autoConnect: false,
        query: { token: getToken() },
    });
};