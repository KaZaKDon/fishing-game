import "./TensionBar.css";

export default function TensionBar({ value, safeZone }) {
    const zoneMin = safeZone?.min ?? 40;
    const zoneMax = safeZone?.max ?? 75;

    const lowWidth = zoneMin;
    const okWidth = zoneMax - zoneMin;
    const highWidth = 100 - zoneMax;

    return (
        <div className="tension-bar">
            <div className="tension-bar__zones">
                <div
                    className="tension-bar__zone tension-bar__zone--low"
                    style={{ width: `${lowWidth}%` }}
                />
                <div
                    className="tension-bar__zone tension-bar__zone--ok"
                    style={{ width: `${okWidth}%` }}
                />
                <div
                    className="tension-bar__zone tension-bar__zone--high"
                    style={{ width: `${highWidth}%` }}
                />
            </div>

            <div
                className="tension-bar__indicator"
                style={{ left: `${value}%` }}
            />
        </div>
    );
}