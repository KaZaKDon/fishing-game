import { useNavigate } from "react-router-dom";
import { regions } from "../../data/locations/regions";
import "./RegionsScreen.css";

const PLAYER_LEVEL = 1;

export default function RegionsScreen() {
    const navigate = useNavigate();

    return (
        <div className="regions-screen">
            <div className="regions-screen__top">
                <button onClick={() => navigate("/base")}>Назад</button>
                <h1>Карты</h1>
            </div>

            <div className="regions-screen__grid">
                {regions.map((region) => {
                    const locked = PLAYER_LEVEL < region.levelRequired;

                    return (
                        <button
                            key={region.id}
                            className="region-card"
                            disabled={locked}
                            onClick={() => navigate(`/map/${region.id}`)}
                        >
                            <h2>{region.title}</h2>
                            <p>{region.description}</p>
                            <span>
                                {locked
                                    ? `Откроется на уровне ${region.levelRequired}`
                                    : "Открыть карту"}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}