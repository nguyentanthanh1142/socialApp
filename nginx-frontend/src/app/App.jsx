import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./AppRoutes";
import { ChatProvider } from "./providers/ChatProvider";
import { SocketProvider } from "./providers/SocketProvider";

function App() {
  return (
    <BrowserRouter>
      <SocketProvider>
        <ChatProvider>
          <AppRoutes />
        </ChatProvider>
      </SocketProvider>
    </BrowserRouter>
  );
}

export default App;