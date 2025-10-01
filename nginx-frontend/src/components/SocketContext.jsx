import React, { createContext, useEffect, useState } from "react";
import { createSocket } from "../socket";
import { getToken } from "../services/localStorageService";

export const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        const token = getToken();
        if (!token) return;

        const newSocket = createSocket();
        newSocket.connect();
        setSocket(newSocket);

        newSocket.on("connect", () => {
            console.log("✅ Socket connected:", newSocket.id);
        });

        newSocket.on("disconnect", () => {
            console.log("🛑 Socket disconnected");
        });
            
        return () => {
            newSocket.disconnect();
        };
    }, []);

    return (
        <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
    );
};