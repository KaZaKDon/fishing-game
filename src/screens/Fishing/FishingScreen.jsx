import { useCallback, useEffect, useRef, useState } from "react";
import "./FishingScreen.css";
import TensionBar from "../../components/fishing/TensionBar";
import {
    decreaseReelProgress,
    decreaseTension,
    getBiteDelay,
    getReactionTime,
    increaseReelProgress,
    increaseTension,
    isTensionInSafeZone,
    isTensionTooHigh,
    isTensionTooLow,
} from "../../services/game/fishingSession";
import { generateFish } from "../../services/game/fishGenerator";

export default function FishingScreen() {
    const [game, setGame] = useState({
        phase: "idle", // idle | waiting | bite | reeling | success | failed
        showFloat: false,
        isHolding: false,
        tension: 0,
        reelProgress: 0,
        reelGoal: 60,
        fish: null,
        failReason: null,
        catchLog: [],
    });

    const biteTimerRef = useRef(null);
    const missTimerRef = useRef(null);
    const tensionIntervalRef = useRef(null);
    const lowTensionTimeoutRef = useRef(null);
    const resetTimeoutRef = useRef(null);
    const successHandledRef = useRef(false);

    const clearTimers = useCallback(() => {
        if (biteTimerRef.current) {
            clearTimeout(biteTimerRef.current);
            biteTimerRef.current = null;
        }

        if (missTimerRef.current) {
            clearTimeout(missTimerRef.current);
            missTimerRef.current = null;
        }

        if (tensionIntervalRef.current) {
            clearInterval(tensionIntervalRef.current);
            tensionIntervalRef.current = null;
        }

        if (lowTensionTimeoutRef.current) {
            clearTimeout(lowTensionTimeoutRef.current);
            lowTensionTimeoutRef.current = null;
        }

        if (resetTimeoutRef.current) {
            clearTimeout(resetTimeoutRef.current);
            resetTimeoutRef.current = null;
        }
    }, []);

    const reset = useCallback(() => {
        clearTimers();
        successHandledRef.current = false;

        setGame((prev) => ({
            ...prev,
            phase: "idle",
            showFloat: false,
            isHolding: false,
            tension: 0,
            reelProgress: 0,
            fish: null,
            failReason: null,
        }));
    }, [clearTimers]);

    const scheduleReset = useCallback((delay = 900) => {
        if (resetTimeoutRef.current) {
            clearTimeout(resetTimeoutRef.current);
        }

        resetTimeoutRef.current = setTimeout(() => {
            reset();
        }, delay);
    }, [reset]);

    const handleCast = useCallback(() => {
        setGame((prev) => {
            if (prev.phase !== "idle") return prev;

            successHandledRef.current = false;

            return {
                ...prev,
                phase: "waiting",
                showFloat: true,
                isHolding: false,
                tension: 0,
                reelProgress: 0,
                fish: null,
                failReason: null,
            };
        });

        biteTimerRef.current = setTimeout(() => {
            setGame((prev) => {
                if (prev.phase !== "waiting") return prev;

                return {
                    ...prev,
                    phase: "bite",
                };
            });

            missTimerRef.current = setTimeout(() => {
                setGame((prev) => {
                    if (prev.phase !== "bite") return prev;

                    return {
                        ...prev,
                        phase: "failed",
                        showFloat: false,
                        failReason: "miss_bite",
                    };
                });

                scheduleReset(1000);
            }, getReactionTime());
        }, getBiteDelay());
    }, [scheduleReset]);

    const handleClick = useCallback(() => {
        if (game.phase === "idle") {
            handleCast();
            return;
        }

        if (game.phase === "waiting") {
            setGame((prev) => ({
                ...prev,
                phase: "failed",
                showFloat: false,
                failReason: "cancel",
            }));
            scheduleReset(800);
            return;
        }

        if (game.phase === "bite") {
            if (missTimerRef.current) {
                clearTimeout(missTimerRef.current);
                missTimerRef.current = null;
            }

            setGame((prev) => ({
                ...prev,
                phase: "reeling",
                showFloat: false,
                tension: 22,
                reelProgress: 0,
            }));
        }
    }, [game.phase, handleCast, scheduleReset]);

    const handleMouseDown = useCallback(() => {
        setGame((prev) => {
            if (prev.phase !== "reeling") return prev;

            return {
                ...prev,
                isHolding: true,
            };
        });
    }, []);

    const handleMouseUp = useCallback(() => {
        setGame((prev) => {
            if (prev.phase !== "reeling") return prev;

            return {
                ...prev,
                isHolding: false,
            };
        });
    }, []);

    const handleKeyDown = useCallback((event) => {
        if (event.code !== "Space") return;

        event.preventDefault();

        if (game.phase === "idle") {
            handleCast();
            return;
        }

        if (game.phase === "waiting") {
            setGame((prev) => ({
                ...prev,
                phase: "failed",
                showFloat: false,
                failReason: "cancel",
            }));
            scheduleReset(800);
            return;
        }

        if (game.phase === "bite") {
            if (missTimerRef.current) {
                clearTimeout(missTimerRef.current);
                missTimerRef.current = null;
            }

            setGame((prev) => ({
                ...prev,
                phase: "reeling",
                showFloat: false,
                tension: 22,
                reelProgress: 0,
            }));
            return;
        }

        if (game.phase === "reeling") {
            setGame((prev) => ({
                ...prev,
                isHolding: true,
            }));
        }
    }, [game.phase, handleCast, scheduleReset]);

    const handleKeyUp = useCallback((event) => {
        if (event.code !== "Space") return;

        setGame((prev) => {
            if (prev.phase !== "reeling") return prev;

            return {
                ...prev,
                isHolding: false,
            };
        });
    }, []);

    useEffect(() => {
        if (game.phase !== "reeling") return;

        tensionIntervalRef.current = setInterval(() => {
            setGame((prev) => {
                if (prev.phase !== "reeling") return prev;

                const nextTension = prev.isHolding
                    ? increaseTension(prev.tension)
                    : decreaseTension(prev.tension);

                const nextProgress = isTensionInSafeZone(nextTension)
                    ? increaseReelProgress(prev.reelProgress)
                    : decreaseReelProgress(prev.reelProgress);

                if (isTensionTooHigh(nextTension)) {
                    if (tensionIntervalRef.current) {
                        clearInterval(tensionIntervalRef.current);
                        tensionIntervalRef.current = null;
                    }

                    if (lowTensionTimeoutRef.current) {
                        clearTimeout(lowTensionTimeoutRef.current);
                        lowTensionTimeoutRef.current = null;
                    }

                    scheduleReset(1000);

                    return {
                        ...prev,
                        phase: "failed",
                        tension: nextTension,
                        reelProgress: nextProgress,
                        failReason: "tension_high",
                        isHolding: false,
                    };
                }

                if (isTensionTooLow(nextTension)) {
                    if (!lowTensionTimeoutRef.current) {
                        lowTensionTimeoutRef.current = setTimeout(() => {
                            setGame((current) => {
                                if (current.phase !== "reeling") return current;

                                return {
                                    ...current,
                                    phase: "failed",
                                    failReason: "tension_low",
                                    isHolding: false,
                                };
                            });

                            scheduleReset(1000);
                        }, 1000);
                    }
                } else if (lowTensionTimeoutRef.current) {
                    clearTimeout(lowTensionTimeoutRef.current);
                    lowTensionTimeoutRef.current = null;
                }

                if (nextProgress >= prev.reelGoal) {
                    if (successHandledRef.current) {
                        return prev;
                    }

                    successHandledRef.current = true;

                    if (tensionIntervalRef.current) {
                        clearInterval(tensionIntervalRef.current);
                        tensionIntervalRef.current = null;
                    }

                    if (lowTensionTimeoutRef.current) {
                        clearTimeout(lowTensionTimeoutRef.current);
                        lowTensionTimeoutRef.current = null;
                    }

                    const fish = generateFish();

                    scheduleReset(1500);

                    return {
                        ...prev,
                        phase: "success",
                        tension: nextTension,
                        reelProgress: nextProgress,
                        fish,
                        isHolding: false,
                        catchLog: [
                            {
                                id: `${Date.now()}_${fish.id}_${Math.random().toString(36).slice(2, 8)}`,
                                name: fish.name,
                                weight: fish.weight,
                                price: fish.price,
                                rarity: fish.rarity,
                            },
                            ...prev.catchLog,
                        ].slice(0, 8),
                    };
                }

                return {
                    ...prev,
                    tension: nextTension,
                    reelProgress: nextProgress,
                };
            });
        }, 40);

        return () => {
            if (tensionIntervalRef.current) {
                clearInterval(tensionIntervalRef.current);
                tensionIntervalRef.current = null;
            }
        };
    }, [game.phase, scheduleReset]);

    useEffect(() => {
        window.addEventListener("keydown", handleKeyDown);
        window.addEventListener("keyup", handleKeyUp);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
            window.removeEventListener("keyup", handleKeyUp);
        };
    }, [handleKeyDown, handleKeyUp]);

    useEffect(() => {
        return () => {
            clearTimers();
        };
    }, [clearTimers]);

    const getStatusText = () => {
        if (game.phase === "idle") return "Кликните, чтобы забросить";
        if (game.phase === "waiting") return "Ожидание...";
        if (game.phase === "bite") return "Подсекайте!";
        if (game.phase === "reeling") return "Вываживание";

        if (game.phase === "failed") {
            if (game.failReason === "miss_bite") return "Слишком поздно";
            if (game.failReason === "cancel") return "Заброс отменён";
            if (game.failReason === "tension_high") return "Леска не выдержала";
            if (game.failReason === "tension_low") return "Рыба сорвалась";
            return "Неудача";
        }

        if (game.phase === "success" && game.fish) {
            return `${game.fish.name} — ${game.fish.weight} кг (+${game.fish.price}₽)`;
        }

        return "";
    };

    return (
        <div
            className="fishing-screen"
            onClick={handleClick}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
        >
            <div className="fishing-screen__info">
                {getStatusText()}
            </div>

            {game.showFloat && (
                <div
                    className={`fishing-float ${game.phase === "bite" ? "fishing-float--bite" : ""}`}
                />
            )}

            {game.phase === "reeling" && (
                <>
                    <div
                        className={`fishing-line ${game.isHolding ? "fishing-line--tension" : "fishing-line--slack"}`}
                    />
                    <TensionBar value={game.tension} />
                </>
            )}

            <div className="fishing-screen__catch-log">
                <div className="fishing-screen__catch-log-title">
                    Последние уловы
                </div>

                {game.catchLog.length === 0 ? (
                    <div className="fishing-screen__catch-log-empty">
                        Пока ничего не поймано
                    </div>
                ) : (
                    <div className="fishing-screen__catch-log-list">
                        {game.catchLog.map((entry) => (
                            <div
                                key={entry.id}
                                className="fishing-screen__catch-log-item"
                            >
                                <div className="fishing-screen__catch-log-name">
                                    {entry.name}
                                    {entry.rarity ? ` · ${entry.rarity}` : ""}
                                </div>
                                <div className="fishing-screen__catch-log-meta">
                                    {entry.weight} кг · +{entry.price}₽
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}