import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthOverlay from "../Auth/AuthOverlay";
import { savePlayerName } from "../../services/storage/localPlayer";

export default function StartScreen() {
    const [showAuth, setShowAuth] = useState(false);
    const navigate = useNavigate();

    const handleOpenAuth = () => {
        setShowAuth(true);
    };

    const handleCloseAuth = () => {
        setShowAuth(false);
    };

    const handleStartGame = (playerName) => {
        savePlayerName(playerName);
        navigate("/fishing");
    };

    return (
        <div className="start-screen">
            <div className="start-screen__background">
            </div>

            <div className="start-screen__overlay" />

            <div className="start-screen__content">
                <header className="start-screen__header">
                    <div className="brand-badge">FISHING GAME</div>
                </header>

                <main className="start-screen__main">
                    <div className="start-screen__hero">
                        <div className="start-screen__tag">Спокойствие воды. Азарт улова.</div>

                        <h1 className="start-screen__title">Большой улов</h1>

                        <p className="start-screen__description">
                            Атмосферная рыбалка от первого лица: выбери точку, дождись поклёвки,
                            почувствуй натяжение лески и вытащи свой лучший трофей.
                        </p>

                        <button className="primary-button" onClick={handleOpenAuth}>
                            Нажмите, чтобы начать
                        </button>
                    </div>
                </main>

                <footer className="start-screen__footer">
                    Тихая вода • лёгкий туман • ожидание поклёвки
                </footer>
            </div>

            {showAuth && (
                <AuthOverlay onClose={handleCloseAuth} onSubmit={handleStartGame} />
            )}
        </div>
    );
}