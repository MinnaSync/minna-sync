import { BrowserRouter, Route, Routes } from "react-router";
import { QueryClientProvider, QueryClient } from "react-query";
import { Channel } from "./pages/channel/Channel";
import { WebsocketProvider } from "./providers/WebsocketProvider";

const queryClient = new QueryClient();

function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <BrowserRouter>
                <Routes>
                    <Route path="/c/:channelId" element={<WebsocketProvider><Channel /></WebsocketProvider>} />
                </Routes>
            </BrowserRouter>
        </QueryClientProvider>
    );
}

export default App;