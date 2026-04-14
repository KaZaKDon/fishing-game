import { useCallback, useEffect, useRef, useState } from "react";
import "./FishingScreen.css";
import TensionBar from "../../components/fishing/TensionBar";
import {
    decreaseTension,
    getBiteDelay,
    getReactionTime,
    increaseTension,
    isTensionTooHigh,
    isTensionTooLow,
} from "../../services/game/fishingSession";

export default function FishingScreen() {
    const [state, setState] = useState("idle");
    // idle | waiting | bite | reeling

    const [showFloat, setShowFloat] = useState(false);
    const [isHolding, setIsHolding] = useState(false);
    const [tension, setTension] = useState(0);

    const biteTimerRef = useRef(null);
    const missTimerRef = useRef(null);
    const tensionIntervalRef = useRef(null);
    const lowTensionTimeoutRef = useRef(null);

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
    }, []);

    const reset = useCallback(() => {
        clearTimers();
        setState("idle");
        setShowFloat(false);
        setIsHolding(false);
        setTension(0);
    }, [clearTimers]);

    const handleCast = useCallback(() => {
        if (state !== "idle") return;

        setShowFloat(true);
        setState("waiting");

        biteTimerRef.current = setTimeout(() => {
            setState("bite");

            missTimerRef.current = setTimeout(() => {
                reset();
            }, getReactionTime());
        }, getBiteDelay());
    }, [state, reset]);

    const handleClick = useCallback(() => {
        if (state === "idle") {
            handleCast();
            return;
        }

        if (state === "waiting") {
            reset();
            return;
        }

        if (state === "bite") {
            if (missTimerRef.current) {
                clearTimeout(missTimerRef.current);
                missTimerRef.current = null;
            }

            setState("reeling");
            setShowFloat(false);
            setTension(22);
        }
    }, [state, handleCast, reset]);

    const handleMouseDown = useCallback(() => {
        if (state === "reeling") {
            setIsHolding(true);
        }
    }, [state]);

    const handleMouseUp = useCallback(() => {
        if (state === "reeling") {
            setIsHolding(false);
        }
    }, [state]);

    const handleKeyDown = useCallback((event) => {
        if (event.code !== "Space") return;

        event.preventDefault();

        if (state === "idle") {
            setShowFloat(true);
            setState("waiting");

            biteTimerRef.current = setTimeout(() => {
                setState("bite");

                missTimerRef.current = setTimeout(() => {
                    reset();
                }, getReactionTime());
            }, getBiteDelay());

            return;
        }

        if (state === "waiting") {
            reset();
            return;
        }

        if (state === "bite") {
            if (missTimerRef.current) {
                clearTimeout(missTimerRef.current);
                missTimerRef.current = null;
            }

            setState("reeling");
            setShowFloat(false);
            setTension(22);
            return;
        }

        if (state === "reeling") {
            setIsHolding(true);
        }
    }, [state, reset]);

    const handleKeyUp = useCallback((event) => {
        if (event.code === "Space" && state === "reeling") {
            setIsHolding(false);
        }
    }, [state]);

    useEffect(() => {
        if (state !== "reeling") return;

        tensionIntervalRef.current = setInterval(() => {
            setTension((prev) => {
                let next = prev;

                if (isHolding) {
                    next = increaseTension(prev);
                } else {
                    next = decreaseTension(prev);
                }

                if (isTensionTooHigh(next)) {
                    setTimeout(() => {
                        reset();
                    }, 0);
                    return next;
                }

                if (isTensionTooLow(next)) {
                    if (!lowTensionTimeoutRef.current) {
                        lowTensionTimeoutRef.current = setTimeout(() => {
                            reset();
                        }, 1000);
                    }
                } else if (lowTensionTimeoutRef.current) {
                    clearTimeout(lowTensionTimeoutRef.current);
                    lowTensionTimeoutRef.current = null;
                }

                return next;
            });
        }, 40);

        return () => {
            if (tensionIntervalRef.current) {
                clearInterval(tensionIntervalRef.current);
                tensionIntervalRef.current = null;
            }
        };
    }, [state, isHolding, reset]);

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

    return (
        <div
            className="fishing-screen"
            onClick={handleClick}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
        >
            <div className="fishing-screen__info">
                {state === "idle" && "Кликните, чтобы забросить"}
                {state === "waiting" && "Ожидание..."}
                {state === "reeling" && "Вываживание"}
            </div>

            {showFloat && (
                <div
                    className={`fishing-float ${state === "bite" ? "fishing-float--bite" : ""}`}
                />
            )}

            {state === "reeling" && (
                <>
                    <div
                        className={`fishing-line ${isHolding ? "fishing-line--tension" : "fishing-line--slack"}`}
                    />
                    <TensionBar value={tension} />
                </>
            )}
        </div>
    );
}