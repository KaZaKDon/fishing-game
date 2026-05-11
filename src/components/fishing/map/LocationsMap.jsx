import "./LocationsMap.css";

export default function LocationsMap({
    spots,
    selectedSpotId,
    playerLevel,
    onSelect,
}) {
    return (
        <div className="locations-map">
            <div className="locations-map__river" />

            {spots.map((spot) => {
                const selected = spot.id === selectedSpotId;
                const locked = playerLevel < spot.levelRequired;

                return (
                    <button
                        key={spot.id}
                        className={[
                            "locations-map__point",
                            selected ? "locations-map__point--selected" : "",
                            locked ? "locations-map__point--locked" : "",
                        ]
                            .filter(Boolean)
                            .join(" ")}
                        style={{
                            left: `${spot.position.x}%`,
                            top: `${spot.position.y}%`,
                        }}
                        title={spot.title}
                        onClick={() => onSelect(spot.id)}
                    >
                        <span className="locations-map__dot" />
                        <span className="locations-map__label">{spot.title}</span>
                    </button>
                );
            })}
        </div>
    );
}