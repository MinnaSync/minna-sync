import { BrowserRouter, Route, Routes } from "react-router";
import { QueryClientProvider, QueryClient } from "react-query";
import { Channel } from "./pages/Channel/Channel";
import { WebsocketProvider } from "./providers/WebsocketProvider";
import { ModalProvider } from "./providers/ModalProvider";

const queryClient = new QueryClient();

function App() {
    return (
        <ModalProvider>
            <QueryClientProvider client={queryClient}>
                <BrowserRouter>
                    <Routes>
                        <Route path="/c/:channelId" element={<WebsocketProvider><Channel /></WebsocketProvider>} />
                    </Routes>
                </BrowserRouter>
            </QueryClientProvider>
        </ModalProvider>
    );
}

export default App;