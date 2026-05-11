import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import LocationsMap from "../../components/fishing/map/LocationsMap";
import { regions } from "../../data/locations/regions";
import { getSpotsByRegionId } from "../../data/locations/fishingSpots";

import "./MapScreen.css";

const PLAYER_LEVEL = 1;

export default function MapScreen() {
    const navigate = useNavigate();
    const { regionId } = useParams();

    const region = regions.find((item) => item.id === regionId);
    const spots = useMemo(() => getSpotsByRegionId(regionId), [regionId]);

    const [selectedSpotId, setSelectedSpotId] = useState(spots[0]?.id ?? null);

    const selectedSpot = spots.find((spot) => spot.id === selectedSpotId);
    const locked = selectedSpot && PLAYER_LEVEL < selectedSpot.levelRequired;

    if (!region) {
        return (
            <div className="map-screen">
                <h1>Карта не найдена</h1>
                <button onClick={() => navigate("/regions")}>Назад</button>
            </div>
        );
    }

    return (
        <div className="map-screen">
            <aside className="map-screen__sidebar">
                <button className="map-screen__back" onClick={() => navigate("/regions")}>
                    Назад
                </button>

                <h1>{region.title}</h1>

                <div className="map-screen__list">
                    {spots.map((spot) => {
                        const isSelected = spot.id === selectedSpotId;
                        const isLocked = PLAYER_LEVEL < spot.levelRequired;

                        return (
                            <button
                                key={spot.id}
                                className={[
                                    "map-screen__spot",
                                    isSelected ? "map-screen__spot--selected" : "",
                                    isLocked ? "map-screen__spot--locked" : "",
                                ]
                                    .filter(Boolean)
                                    .join(" ")}
                                onClick={() => setSelectedSpotId(spot.id)}
                            >
                                <span>{spot.title}</span>
                                <small>ур. {spot.levelRequired}</small>
                            </button>
                        );
                    })}
                </div>
            </aside>

            <main className="map-screen__main">
                <LocationsMap
                    spots={spots}
                    selectedSpotId={selectedSpotId}
                    playerLevel={PLAYER_LEVEL}
                    onSelect={setSelectedSpotId}
                />

                <div className="map-screen__actions">
                    <div>
                        <strong>{selectedSpot?.title ?? "Выберите место ловли"}</strong>
                        {selectedSpot && (
                            <p>
                                Нужен уровень: {selectedSpot.levelRequired}
                            </p>
                        )}
                    </div>

                    <button
                        className="map-button-secondary"
                        onClick={() => navigate("/regions")}
                    >
                        ← К картам
                    </button>

                    <button
                        className="map-button-primary"
                        disabled={!selectedSpot || locked}
                        onClick={() => navigate(`/fishing/${selectedSpot.id}`)}
                    >
                        🎣 Перейти
                    </button>
                </div>
            </main>
        </div>
    );
}