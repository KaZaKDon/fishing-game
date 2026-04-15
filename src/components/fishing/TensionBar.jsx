import "./TensionBar.css";

export default function TensionBar({ value }) {
    // value ожидается 0–100
    const clamped = Math.max(0, Math.min(100, value));

    return (
        <div className="tension-bar">
            <div className="tension-bar__zones">
                <div className="tension-bar__zone tension-bar__zone--low" />
                <div className="tension-bar__zone tension-bar__zone--ok" />
                <div className="tension-bar__zone tension-bar__zone--high" />
            </div>

            <div
                className="tension-bar__indicator"
                style={{ left: `${clamped}%` }}
            />
        </div>
    );
}