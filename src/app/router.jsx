import { Routes, Route } from "react-router-dom";

import FishingScreen from "../screens/Fishing/FishingScreen";
import BaseScreen from "../screens/Base/BaseScreen";
import RegionsScreen from "../screens/Regions/RegionsScreen";
import MapScreen from "../screens/Map/MapScreen";
import InDevelopmentScreen from "../screens/Shared/InDevelopmentScreen";

export default function AppRouter() {
    return (
        <Routes>
            <Route path="/" element={<FishingScreen />} />

            <Route path="/base" element={<BaseScreen />} />
            <Route path="/regions" element={<RegionsScreen />} />
            <Route path="/map/:regionId" element={<MapScreen />} />
            <Route path="/fishing/:spotId" element={<FishingScreen />} />

            <Route path="/gear" element={<InDevelopmentScreen title="Снасти" />} />
            <Route path="/catch" element={<InDevelopmentScreen title="Улов" />} />
            <Route path="/shop" element={<InDevelopmentScreen title="Магазин" />} />
            <Route path="/quests" element={<InDevelopmentScreen title="Квесты" />} />
            <Route path="/account" element={<InDevelopmentScreen title="Аккаунт" />} />
        </Routes>
    );
}