import { BrowserRouter, Route, Routes } from "react-router";
import { Channel } from "./pages/channel/Channel";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/c/:channelId" element={<Channel />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;