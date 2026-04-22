import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import "./FishingScreen.css";
import TensionBar from "../../components/fishing/TensionBar";
import {
    applyFishBehavior,
    decreaseReelProgress,
    decreaseTension,
    getBehaviorLabel,
    getBiteDelay,
    getReactionTime,
    getSafeZone,
    increaseReelProgress,
    increaseTension,
    isTensionInSafeZone,
    isTensionTooHigh,
    isTensionTooLow,
    shouldRevealFishEarly,
    updateFishBehaviorState,
} from "../../services/game/fishingSession";
import {
    getInventoryStats,
    replaceCheapestFishInInventory,
    sellInventory,
    tryAddFishToInventory,
} from "../../services/game/fishingInventory";
import {
    createEmptyFishStats,
    getFishStatsList,
    updateFishStats,
} from "../../services/game/fishingStats";
import { generateFish } from "../../services/game/fishGenerator";

function isRareFish(fish) {
    if (!fish) return false;
    const rarity = fish.rarityKey ?? fish.rarity ?? "common";
    return rarity === "rare" || rarity === "epic" || rarity === "legendary";
}

function stopEvent(event) {
    event.stopPropagation();
}

export default function FishingScreen() {
    const [game, setGame] = useState({
        phase: "idle",
        showFloat: false,
        isHolding: false,
        tension: 0,
        reelProgress: 0,
        reelGoal: 60,
        fish: null,
        pendingFish: null,
        failReason: null,

        inventory: [],
        totalCaught: 0,
        totalWeight: 0,
        estimatedValue: 0,
        money: 0,
        keepnetLimit: 20,

        fishStats: createEmptyFishStats(),
        isStatsOpen: false,

        behaviorState: {
            nextBurstAt: 0,
            burstUntil: 0,
            burstPower: 0,
        },
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
            pendingFish: null,
            failReason: null,
            behaviorState: {
                nextBurstAt: 0,
                burstUntil: 0,
                burstPower: 0,
            },
        }));
    }, [clearTimers]);

    const scheduleReset = useCallback(
        (delay = 900) => {
            if (resetTimeoutRef.current) {
                clearTimeout(resetTimeoutRef.current);
            }

            resetTimeoutRef.current = window.setTimeout(() => {
                reset();
            }, delay);
        },
        [reset]
    );

    const toggleStats = useCallback(() => {
        setGame((prev) => ({
            ...prev,
            isStatsOpen: !prev.isStatsOpen,
        }));
    }, []);

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
                pendingFish: null,
                failReason: null,
                behaviorState: {
                    nextBurstAt: 0,
                    burstUntil: 0,
                    burstPower: 0,
                },
            };
        });

        biteTimerRef.current = window.setTimeout(() => {
            setGame((prev) => {
                if (prev.phase !== "waiting") return prev;

                return {
                    ...prev,
                    phase: "bite",
                };
            });

            missTimerRef.current = window.setTimeout(() => {
                setGame((prev) => {
                    if (prev.phase !== "bite") return prev;

                    return {
                        ...prev,
                        phase: "failed",
                        showFloat: false,
                        isHolding: false,
                        failReason: "miss_bite",
                    };
                });

                scheduleReset(1000);
            }, getReactionTime());
        }, getBiteDelay());
    }, [scheduleReset]);

    const startReeling = useCallback(() => {
        if (missTimerRef.current) {
            clearTimeout(missTimerRef.current);
            missTimerRef.current = null;
        }

        setGame((prev) => {
            if (prev.phase !== "bite") return prev;

            const fish = generateFish();
            const now = Date.now();

            return {
                ...prev,
                phase: "reeling",
                showFloat: false,
                tension: 22,
                reelProgress: 0,
                isHolding: false,
                failReason: null,
                fish,
                pendingFish: null,
                behaviorState: {
                    nextBurstAt: now + 900 + Math.random() * 1200,
                    burstUntil: 0,
                    burstPower: 0,
                },
            };
        });
    }, []);

    const failRound = useCallback(
        (reason) => {
            if (tensionIntervalRef.current) {
                clearInterval(tensionIntervalRef.current);
                tensionIntervalRef.current = null;
            }

            if (lowTensionTimeoutRef.current) {
                clearTimeout(lowTensionTimeoutRef.current);
                lowTensionTimeoutRef.current = null;
            }

            setGame((prev) => {
                if (
                    prev.phase !== "reeling" &&
                    prev.phase !== "bite" &&
                    prev.phase !== "waiting"
                ) {
                    return prev;
                }

                return {
                    ...prev,
                    phase: "failed",
                    showFloat: false,
                    isHolding: false,
                    failReason: reason,
                };
            });

            scheduleReset(1000);
        },
        [scheduleReset]
    );

    const finishRound = useCallback(
        (fish) => {
            if (!fish || successHandledRef.current) return;
            successHandledRef.current = true;

            if (tensionIntervalRef.current) {
                clearInterval(tensionIntervalRef.current);
                tensionIntervalRef.current = null;
            }

            if (lowTensionTimeoutRef.current) {
                clearTimeout(lowTensionTimeoutRef.current);
                lowTensionTimeoutRef.current = null;
            }

            setGame((prev) => {
                const addResult = tryAddFishToInventory(
                    prev.inventory,
                    fish,
                    prev.keepnetLimit
                );

                if (!addResult.added) {
                    successHandledRef.current = false;

                    return {
                        ...prev,
                        phase: "keepnet_full",
                        fish,
                        pendingFish: fish,
                        isHolding: false,
                    };
                }

                const inventoryStats = getInventoryStats(addResult.inventory);
                const nextFishStats = updateFishStats(prev.fishStats, fish);

                return {
                    ...prev,
                    phase: "success",
                    fish,
                    pendingFish: null,
                    isHolding: false,
                    inventory: addResult.inventory,
                    totalCaught: inventoryStats.totalCaught,
                    totalWeight: inventoryStats.totalWeight,
                    estimatedValue: inventoryStats.estimatedValue,
                    fishStats: nextFishStats,
                };
            });

            scheduleReset(1500);
        },
        [scheduleReset]
    );

    const handleSellAll = useCallback(() => {
        setGame((prev) => {
            if (!prev.pendingFish) return prev;

            const sellResult = sellInventory(prev.inventory);
            const addResult = tryAddFishToInventory(
                sellResult.inventory,
                prev.pendingFish,
                prev.keepnetLimit
            );
            const inventoryStats = getInventoryStats(addResult.inventory);
            const nextFishStats = updateFishStats(prev.fishStats, prev.pendingFish);

            return {
                ...prev,
                money: prev.money + sellResult.earnedMoney,
                inventory: addResult.inventory,
                totalCaught: inventoryStats.totalCaught,
                totalWeight: inventoryStats.totalWeight,
                estimatedValue: inventoryStats.estimatedValue,
                fishStats: nextFishStats,
                phase: "success",
                fish: prev.pendingFish,
                pendingFish: null,
                isHolding: false,
            };
        });

        successHandledRef.current = false;
        scheduleReset(1500);
    }, [scheduleReset]);

    const handleReplaceCheapest = useCallback(() => {
        setGame((prev) => {
            if (!prev.pendingFish) return prev;

            const replaceResult = replaceCheapestFishInInventory(
                prev.inventory,
                prev.pendingFish,
                prev.keepnetLimit
            );
            const inventoryStats = getInventoryStats(replaceResult.inventory);
            const nextFishStats = updateFishStats(prev.fishStats, prev.pendingFish);

            return {
                ...prev,
                phase: "success",
                fish: prev.pendingFish,
                pendingFish: null,
                isHolding: false,
                inventory: replaceResult.inventory,
                totalCaught: inventoryStats.totalCaught,
                totalWeight: inventoryStats.totalWeight,
                estimatedValue: inventoryStats.estimatedValue,
                fishStats: nextFishStats,
            };
        });

        successHandledRef.current = false;
        scheduleReset(1500);
    }, [scheduleReset]);

    const handleReleasePendingFish = useCallback(() => {
        setGame((prev) => ({
            ...prev,
            phase: "idle",
            fish: null,
            pendingFish: null,
            isHolding: false,
        }));

        successHandledRef.current = false;
    }, []);

    const handleScreenAction = useCallback(() => {
        if (game.phase === "keepnet_full") return;

        if (game.phase === "idle") {
            handleCast();
            return;
        }

        if (game.phase === "waiting") {
            failRound("cancel");
            return;
        }

        if (game.phase === "bite") {
            startReeling();
        }
    }, [game.phase, handleCast, failRound, startReeling]);

    const beginHolding = useCallback(() => {
        setGame((prev) => {
            if (prev.phase !== "reeling") return prev;

            return {
                ...prev,
                isHolding: true,
            };
        });
    }, []);

    const stopHolding = useCallback(() => {
        setGame((prev) => {
            if (prev.phase !== "reeling" || !prev.isHolding) return prev;

            return {
                ...prev,
                isHolding: false,
            };
        });
    }, []);

    const handlePointerDown = useCallback(
        (event) => {
            if (game.phase === "reeling") {
                beginHolding();
                return;
            }

            if (event.pointerType !== "mouse") {
                handleScreenAction();
            }
        },
        [beginHolding, game.phase, handleScreenAction]
    );

    const handleKeyDown = useCallback(
        (event) => {
            if (event.code !== "Space") return;

            event.preventDefault();

            if (game.phase === "reeling") {
                beginHolding();
                return;
            }

            handleScreenAction();
        },
        [beginHolding, game.phase, handleScreenAction]
    );

    const handleKeyUp = useCallback(
        (event) => {
            if (event.code !== "Space") return;

            event.preventDefault();
            stopHolding();
        },
        [stopHolding]
    );

    useEffect(() => {
        if (game.phase !== "reeling") return;

        tensionIntervalRef.current = window.setInterval(() => {
            setGame((prev) => {
                if (prev.phase !== "reeling") return prev;

                const now = Date.now();
                const nextBehaviorState = updateFishBehaviorState(
                    prev.behaviorState,
                    prev.fish,
                    now
                );

                let nextTension = prev.isHolding
                    ? increaseTension(prev.tension, prev.fish)
                    : decreaseTension(prev.tension, prev.fish);

                nextTension = applyFishBehavior(
                    nextTension,
                    prev.fish,
                    nextBehaviorState
                );

                const nextProgress = isTensionInSafeZone(nextTension, prev.fish)
                    ? increaseReelProgress(prev.reelProgress, prev.fish)
                    : decreaseReelProgress(prev.reelProgress, prev.fish);

                if (isTensionTooHigh(nextTension)) {
                    window.setTimeout(() => {
                        failRound("tension_high");
                    }, 0);

                    return {
                        ...prev,
                        tension: nextTension,
                        reelProgress: nextProgress,
                        behaviorState: nextBehaviorState,
                    };
                }

                if (isTensionTooLow(nextTension, prev.fish)) {
                    if (!lowTensionTimeoutRef.current) {
                        lowTensionTimeoutRef.current = window.setTimeout(() => {
                            failRound("tension_low");
                        }, 1000);
                    }
                } else if (lowTensionTimeoutRef.current) {
                    clearTimeout(lowTensionTimeoutRef.current);
                    lowTensionTimeoutRef.current = null;
                }

                if (nextProgress >= prev.reelGoal) {
                    window.setTimeout(() => {
                        finishRound(prev.fish);
                    }, 0);

                    return {
                        ...prev,
                        tension: nextTension,
                        reelProgress: prev.reelGoal,
                        behaviorState: nextBehaviorState,
                    };
                }

                return {
                    ...prev,
                    tension: nextTension,
                    reelProgress: nextProgress,
                    behaviorState: nextBehaviorState,
                };
            });
        }, 40);

        return () => {
            if (tensionIntervalRef.current) {
                clearInterval(tensionIntervalRef.current);
                tensionIntervalRef.current = null;
            }
        };
    }, [game.phase, failRound, finishRound]);

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

    const fishStatsList = useMemo(() => getFishStatsList(game.fishStats), [game.fishStats]);
    const statsCaughtTotal = game.fishStats.totalCaught ?? 0;

    const getStatusText = () => {
        if (game.phase === "idle") return "Кликните или тапните, чтобы забросить";
        if (game.phase === "waiting") return "Ожидание поклёвки...";
        if (game.phase === "bite") return "Клюёт! Быстро подсекайте!";
        if (game.phase === "reeling") {
            if (shouldRevealFishEarly(game.fish)) {
                return `На крючке: ${game.fish.name} · ${game.fish.weight} кг · ${getBehaviorLabel(game.fish)}`;
            }
            return "Держите натяжение в зелёной зоне";
        }
        if (game.phase === "keepnet_full" && game.pendingFish) {
            if (isRareFish(game.pendingFish)) {
                return `Редкий улов! ${game.pendingFish.name} · ${game.pendingFish.weight} кг · садок заполнен`;
            }
            return `Садок заполнен. ${game.pendingFish.name} · ${game.pendingFish.weight} кг ждёт решения`;
        }
        if (game.phase === "failed") {
            if (game.failReason === "miss_bite") return "Слишком поздно — рыба ушла";
            if (game.failReason === "cancel") return "Заброс отменён";
            if (game.failReason === "tension_high") return "Слишком сильное натяжение — леска порвалась";
            if (game.failReason === "tension_low") return "Слишком слабое натяжение — рыба сорвалась";
            return "Неудача";
        }
        if (game.phase === "success" && game.fish) {
            return `Поймано: ${game.fish.name} · ${game.fish.weight} кг · +${game.fish.price} ₽`;
        }
        return "";
    };

    const showBottomStatus = game.phase !== "reeling";
    const showBottomTensionHud = game.phase === "reeling";

    return (
        <div
            className="fishing-screen"
            onClick={handleScreenAction}
            onPointerDown={handlePointerDown}
            onPointerUp={stopHolding}
            onPointerCancel={stopHolding}
            onPointerLeave={stopHolding}
            role="button"
            tabIndex={0}
            aria-label="Экран ловли"
        >
            <div className="fishing-screen__background" aria-hidden="true" />
            <div className="fishing-screen__water-glow" aria-hidden="true" />

            {game.showFloat && (
                <div
                    className={`fishing-float ${
                        game.phase === "bite" ? "fishing-float--bite" : ""
                    }`}
                />
            )}

            {game.phase === "reeling" && (
                <div className={`fishing-line ${game.isHolding ? "fishing-line--tension" : ""}`} />
            )}

            <div className="fishing-screen__inventory-stats">
                <div>Деньги: {game.money} ₽</div>
                <div>Садок: {game.inventory.length} / {game.keepnetLimit}</div>
                <div>Вес в садке: {game.totalWeight} кг</div>
                <div>Стоимость в садке: {game.estimatedValue} ₽</div>
                <div>Поймано за сессию: {statsCaughtTotal}</div>
            </div>

            <button
                type="button"
                className="fishing-screen__stats-button"
                onClick={(event) => {
                    stopEvent(event);
                    toggleStats();
                }}
                onPointerDown={stopEvent}
                onPointerUp={stopEvent}
            >
                {game.isStatsOpen ? "Закрыть статистику" : "Статистика улова"}
            </button>

            {game.isStatsOpen && (
                <div
                    className="fishing-screen__fish-stats"
                    onClick={stopEvent}
                    onPointerDown={stopEvent}
                    onPointerUp={stopEvent}
                >
                    <div className="fishing-screen__fish-stats-title">
                        Статистика по видам
                    </div>

                    {fishStatsList.length === 0 ? (
                        <div className="fishing-screen__fish-stats-empty">
                            Пока статистики нет
                        </div>
                    ) : (
                        <div className="fishing-screen__fish-stats-list">
                            {fishStatsList.map((item) => (
                                <div
                                    key={item.fishId}
                                    className="fishing-screen__fish-stats-item"
                                >
                                    <div className="fishing-screen__fish-stats-name">
                                        {item.name}
                                        {item.rarity ? ` · ${item.rarity}` : ""}
                                    </div>

                                    <div className="fishing-screen__fish-stats-meta">
                                        Поймано: {item.count} шт.
                                    </div>

                                    <div className="fishing-screen__fish-stats-meta">
                                        Лучший вес: {item.bestWeight} кг
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {showBottomStatus && (
                <div className="fishing-screen__bottom-status">
                    {getStatusText()}
                </div>
            )}

            {showBottomTensionHud && (
                <div className="fishing-screen__bottom-tension">
                    <div className="fishing-screen__zone-strip" aria-hidden="true">
                        <span className="fishing-screen__zone fishing-screen__zone--low">
                            СЛАБО
                        </span>
                        <span className="fishing-screen__zone fishing-screen__zone--safe">
                            ЗОНА ВЫВАЖИВАНИЯ
                        </span>
                        <span className="fishing-screen__zone fishing-screen__zone--high">
                            РВЁТ ЛЕСКУ
                        </span>
                    </div>

                    <div className="fishing-screen__bottom-tension-bar">
                        <TensionBar
                            value={game.tension}
                            safeZone={getSafeZone(game.fish)}
                        />
                    </div>

                    <div className="fishing-screen__bottom-tension-text">
                        {getStatusText()}
                    </div>
                </div>
            )}

            {game.phase === "keepnet_full" && game.pendingFish && (
                <div
                    className={`fishing-screen__keepnet-modal ${
                        isRareFish(game.pendingFish)
                            ? "fishing-screen__keepnet-modal--rare"
                            : ""
                    }`}
                    onClick={stopEvent}
                    onPointerDown={stopEvent}
                    onPointerUp={stopEvent}
                >
                    <div className="fishing-screen__keepnet-title">
                        {isRareFish(game.pendingFish)
                            ? "Редкая рыба! Садок полон"
                            : "Садок полон"}
                    </div>

                    <div className="fishing-screen__keepnet-fish">
                        {game.pendingFish.name} · {game.pendingFish.weight} кг ·{" "}
                        {game.pendingFish.price} ₽
                    </div>

                    <div className="fishing-screen__keepnet-actions">
                        <button
                            type="button"
                            className="fishing-screen__action-button"
                            onClick={handleSellAll}
                        >
                            Продать всё
                        </button>

                        <button
                            type="button"
                            className="fishing-screen__action-button"
                            onClick={handleReplaceCheapest}
                        >
                            Выбросить самую дешёвую
                        </button>

                        <button
                            type="button"
                            className="fishing-screen__action-button fishing-screen__action-button--secondary"
                            onClick={handleReleasePendingFish}
                        >
                            Отпустить рыбу
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}