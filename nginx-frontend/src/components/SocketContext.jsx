export { SocketContext } from "../app/providers/SocketContext";

// export const SocketProvider = ({ children }) => {

//     const socketRef = useRef(null);
//     const [connected, setConnected] = useState(false);

//     const [messagesMap, setMessagesMap] = useState({});
//     const [conversations, setConversations] = useState([]);
//     const [openedConversationIds, setOpenedConversationIds] = useState([]);

//     const initSocket = useCallback(() => {
//         const token = getToken();
//         if (!token) return;

//         if (socketRef.current) {
//             socketRef.current.removeAllListeners();
//             disconnectSocket();
//         }

//         const socket = createSocket();
//         socketRef.current = socket;

//         socket.on("connect", () => {
//             console.log("✅ Socket connected:", socket.id);
//             setConnected(true);
//         });
//         socket.on("disconnect", () => {
//             console.log("🛑 Socket disconnected");
//             setConnected(false);
//         });

//         socket.on("chat_message", handleIncomingMessage);

//         // socket.on("notification", handleIncomingNotification);
//     }, []);


//     useEffect(() => {
//         const token = getToken();
//         if (!token) return;

//         const socket = createSocket();
//         socketRef.current = socket;

//         socket.on("connect", () => {
//             console.log("✅ Socket connected:", socket.id);
//             setConnected(true);
//         });

//         socket.on("disconnect", () => {
//             console.log("🛑 Socket disconnected");
//             setConnected(false);
//         });

//         return () => {
//             if (socketRef.current) {
//                 socketRef.current.off("connect");
//                 socketRef.current.off("disconnect");
//                 disconnectSocket();
//                 socketRef.current = null;
//             }
//         };
//     }, []);

//     useEffect(() => {
//         initSocket();
//         return () => {
//             if (socketRef.current) {
//                 socketRef.current.off("chat_message", handleIncomingMessage);
//                 // socketRef.current.off("notification", handleIncomingNotification);
//                 disconnectSocket();
//                 socketRef.current = null;
//             }
//         };
//     }, [initSocket]);

//     const refreshSocket = useCallback(() => {
//         initSocket();
//     }, [initSocket]);

//     const handleIncomingMessage = useCallback((event) => {
//         console.log("Incoming chat message: ", event);

//         const { conversationId, payload } = event;
//         if (!conversationId || !payload) return;

//         setMessagesMap(prev => ({
//             ...prev,
//             [conversationId]: [...(prev[conversationId] || []),
//             {
//                 id: payload.id,
//                 message: payload.content,
//                 sender: {
//                     id: payload.sender?.id,
//                     name: payload.sender?.name || "Unknow",
//                     avatar: payload.sender?.avatarUrl || "default-avatar-url",
//                 },
//                 me: payload.me,
//                 createdDate: payload.createdDate,
//             }
//             ]
//         }));

//         setConversations(prev =>
//             prev.map(c => c.id === conversationId ? {
//                 ...c,
//                 lastMessage: payload.content,
//                 lastTimestamp: payload.createdDate,
//                 unread: openedConversationIds.includes(conversationId) || payload.me
//                     ? 0
//                     : (c.unread || 0) + 1,
//             } : c
//             )
//         );
//     }, [openedConversationIds]);

//     return (
//         <SocketContext.Provider
//             value={{
//                 socket: socketRef.current,  
//                 connected,
//                 refreshSocket,
//                 messagesMap,
//                 setMessagesMap,
//                 conversations,
//                 setConversations,
//                 openedConversationIds,
//                 setOpenedConversationIds
//             }}
//         >
//             {children}
//         </SocketContext.Provider>
//     );
// };

// export const useSocket = () => useContext(SocketContext);