import { BrowserRouter, Routes, Route } from "react-router-dom";
import StartScreen from "../screens/Start/StartScreen";
import FishingScreen from "../screens/Fishing/FishingScreen";

export default function AppRouter() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<StartScreen />} />
                <Route path="/fishing" element={<FishingScreen />} />
            </Routes>
        </BrowserRouter>
    );
}