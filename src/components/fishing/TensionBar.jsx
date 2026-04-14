import "./TensionBar.css";

export default function TensionBar({ value = 0 }) {
    const safeValue = Math.max(0, Math.min(100, value));

    return (
        <div className="tension-bar">
            <div className="tension-bar__track">
                <div
                    className="tension-bar__fill"
                    style={{ width: `${safeValue}%` }}
                />
            </div>
        </div>
    );
}