import { useState } from "react";

export default function AuthOverlay({ onClose, onSubmit }) {
    const [username, setUsername] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = () => {
        const value = username.trim();

        if (!value) {
            setError("Введите имя игрока");
            return;
        }

        setError("");
        onSubmit(value);
    };

    const handleKeyDown = (event) => {
        if (event.key === "Enter") {
            handleSubmit();
        }
    };

    return (
        <div className="auth-overlay">
            <div className="auth-overlay__backdrop" onClick={onClose} />

            <div className="auth-overlay__card">
                <div className="auth-overlay__label">Вход в игру</div>

                <h2 className="auth-overlay__title">Кто сегодня выходит на воду?</h2>

                <p className="auth-overlay__text">
                    Введите имя игрока, чтобы начать. Позже сюда можно будет подключить
                    регистрацию и загрузку прогресса.
                </p>

                <label className="auth-overlay__field-label">Имя игрока</label>

                <input
                    className="auth-overlay__input"
                    type="text"
                    placeholder="Например, Дима"
                    value={username}
                    onChange={(event) => {
                        setUsername(event.target.value);
                        if (error) setError("");
                    }}
                    onKeyDown={handleKeyDown}
                    autoFocus
                />

                {error ? <div className="auth-overlay__error">{error}</div> : null}

                <div className="auth-overlay__actions">
                    <button className="secondary-button" onClick={onClose}>
                        Назад
                    </button>

                    <button className="primary-button" onClick={handleSubmit}>
                        Начать игру
                    </button>
                </div>
            </div>
        </div>
    );
}