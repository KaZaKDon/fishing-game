// -----------------------------
// ⚙️ БАЗОВЫЙ БАЛАНС
// -----------------------------

const MIN_TENSION = 0;
const MAX_TENSION = 100;

const BASE_TENSION_UP = 1.1;
const BASE_TENSION_DOWN = 0.75;

const BASE_SAFE_ZONE_MIN = 40;
const BASE_SAFE_ZONE_MAX = 75;

const BASE_REEL_UP = 0.45;
const BASE_REEL_DOWN = 0.12;

// -----------------------------
// 🧠 ВСПОМОГАТЕЛЬНОЕ
// -----------------------------

function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

function getFishValue(fish, key, fallback) {
    const value = fish?.[key];
    return typeof value === "number" ? value : fallback;
}

function getFishBehavior(fish) {
    return fish?.behavior ?? "calm";
}

function getFishWeight(fish) {
    return getFishValue(fish, "weight", 1);
}

function getWeightFactor(fish) {
    const weight = getFishWeight(fish);

    if (weight <= 0.4) return 0.85;
    if (weight <= 0.8) return 0.95;
    if (weight <= 1.5) return 1;
    if (weight <= 3) return 1.12;
    if (weight <= 6) return 1.22;
    if (weight <= 10) return 1.35;
    return 1.5;
}

// -----------------------------
// 🎣 НАТЯЖЕНИЕ
// -----------------------------

export function increaseTension(value, fish) {
    const multiplier = getFishValue(fish, "tensionUpMultiplier", 1);
    const difficulty = getFishValue(fish, "difficulty", 1);
    const weightFactor = getWeightFactor(fish);

    let next = value + BASE_TENSION_UP * multiplier * difficulty * weightFactor;

    const behavior = getFishBehavior(fish);

    if (behavior === "jerky") {
        next += Math.random() * 0.8;
    }

    if (behavior === "heavy_pull") {
        next += 0.35 * weightFactor;
    }

    if (behavior === "nervous") {
        next += Math.random() * 0.45;
    }

    return clamp(next, MIN_TENSION, MAX_TENSION);
}

export function decreaseTension(value, fish) {
    const multiplier = getFishValue(fish, "tensionDownMultiplier", 1);
    const difficulty = getFishValue(fish, "difficulty", 1);
    const weightFactor = getWeightFactor(fish);

    let next =
        value -
        BASE_TENSION_DOWN *
            multiplier *
            Math.max(0.85, difficulty * 0.9) /
            Math.max(weightFactor, 0.85);

    const behavior = getFishBehavior(fish);

    if (behavior === "heavy_pull") {
        next += 0.25 * weightFactor;
    }

    if (behavior === "nervous") {
        next -= Math.random() * 0.25;
    }

    return clamp(next, MIN_TENSION, MAX_TENSION);
}

export function isTensionTooHigh(value) {
    return value >= MAX_TENSION;
}

export function isTensionTooLow(value, fish) {
    const baseThreshold = getFishValue(fish, "escapeThreshold", 5);
    const weightFactor = getWeightFactor(fish);
    const threshold = baseThreshold + (weightFactor >= 1.2 ? 1 : 0);

    return value <= threshold;
}

// -----------------------------
// 🎯 ЗЕЛЁНАЯ ЗОНА
// -----------------------------

export function getSafeZone(fish) {
    const difficulty = getFishValue(fish, "difficulty", 1);
    const behavior = getFishBehavior(fish);
    const weightFactor = getWeightFactor(fish);

    let min = BASE_SAFE_ZONE_MIN;
    let max = BASE_SAFE_ZONE_MAX;

    if (difficulty >= 1.2) {
        min += 2;
        max -= 2;
    }

    if (difficulty >= 1.5) {
        min += 2;
        max -= 3;
    }

    if (difficulty >= 1.8) {
        min += 2;
        max -= 3;
    }

    if (weightFactor >= 1.12) {
        min += 1;
        max -= 1;
    }

    if (weightFactor >= 1.22) {
        min += 1;
        max -= 2;
    }

    if (weightFactor >= 1.35) {
        min += 2;
        max -= 2;
    }

    if (behavior === "jerky") {
        min += 2;
        max -= 2;
    }

    if (behavior === "nervous") {
        min += 1;
        max -= 3;
    }

    if (behavior === "heavy_pull") {
        min += 3;
        max -= 4;
    }

    min = clamp(min, 10, 80);
    max = clamp(max, 20, 90);

    if (max - min < 10) {
        max = min + 10;
    }

    return { min, max };
}

export function isTensionInSafeZone(value, fish) {
    const zone = getSafeZone(fish);
    return value >= zone.min && value <= zone.max;
}

// -----------------------------
// 🐟 ПРОГРЕСС ВЫВАЖИВАНИЯ
// -----------------------------

export function increaseReelProgress(value, fish) {
    const multiplier = getFishValue(fish, "reelSpeedMultiplier", 1);
    const difficulty = getFishValue(fish, "difficulty", 1);
    const behavior = getFishBehavior(fish);
    const weightFactor = getWeightFactor(fish);

    let next =
        value +
        (BASE_REEL_UP * multiplier) /
            Math.max(difficulty * weightFactor, 0.75);

    if (behavior === "jerky") {
        next -= Math.random() * 0.08;
    }

    if (behavior === "heavy_pull") {
        next -= 0.05 * weightFactor;
    }

    if (behavior === "nervous") {
        next -= Math.random() * 0.04;
    }

    return Math.max(next, value);
}

export function decreaseReelProgress(value, fish) {
    const difficulty = getFishValue(fish, "difficulty", 1);
    const behavior = getFishBehavior(fish);
    const weightFactor = getWeightFactor(fish);

    let penalty = BASE_REEL_DOWN * difficulty * weightFactor;

    if (behavior === "jerky") {
        penalty += 0.06;
    }

    if (behavior === "heavy_pull") {
        penalty += 0.08;
    }

    if (behavior === "nervous") {
        penalty += 0.04;
    }

    return Math.max(value - penalty, 0);
}

// -----------------------------
// 🐠 ПОВЕДЕНИЕ РЫБЫ
// -----------------------------

export function applyFishBehavior(tension, fish) {
    const behavior = getFishBehavior(fish);
    const weightFactor = getWeightFactor(fish);

    let next = tension;

    if (behavior === "jerky") {
        if (Math.random() < 0.18) {
            next += (6 + Math.random() * 6) * weightFactor;
        }
    }

    if (behavior === "heavy_pull") {
        next += 1.2 * weightFactor;
    }

    if (behavior === "nervous") {
        next += (Math.random() - 0.5) * 5;
    }

    return clamp(next, MIN_TENSION, MAX_TENSION);
}

// -----------------------------
// 🏆 РАННЕЕ РАСКРЫТИЕ РЫБЫ
// -----------------------------

export function shouldRevealFishEarly(fish) {
    if (!fish) return false;

    const rarity = fish.rarityKey ?? fish.rarity ?? "common";
    const weight = getFishWeight(fish);
    const price = getFishValue(fish, "price", 0);
    const difficulty = getFishValue(fish, "difficulty", 1);

    if (rarity === "rare" || rarity === "epic" || rarity === "legendary") {
        return true;
    }

    if (weight >= 4.5) {
        return true;
    }

    if (price >= 900) {
        return true;
    }

    if (difficulty >= 1.7) {
        return true;
    }

    return false;
}

// -----------------------------
// 📝 ТЕКСТ ПОД ПОВЕДЕНИЕ
// -----------------------------

export function getBehaviorLabel(fish) {
    const behavior = getFishBehavior(fish);

    if (behavior === "jerky") return "резкие рывки";
    if (behavior === "heavy_pull") return "тяжёлое сопротивление";
    if (behavior === "nervous") return "нервное поведение";

    return "спокойное вываживание";
}

// -----------------------------
// ⏱ КЛЁВ
// -----------------------------

export function getBiteDelay() {
    return 1500 + Math.random() * 2500;
}

export function getReactionTime() {
    return 800 + Math.random() * 600;
}

export function updateFishBehaviorState(behaviorState, fish, now = Date.now()) {
    const behavior = getFishBehavior(fish);

    if (!behaviorState) {
        return {
            nextBurstAt: now + 1200,
            burstUntil: 0,
            burstPower: 0,
        };
    }

    let nextState = { ...behaviorState };

    // если активный рывок закончился
    if (nextState.burstUntil && now >= nextState.burstUntil) {
        nextState.burstUntil = 0;
        nextState.burstPower = 0;
    }

    // если пора запускать новый паттерн
    if (!nextState.burstUntil && now >= nextState.nextBurstAt) {
        if (behavior === "jerky") {
            const duration = 220 + Math.random() * 260;
            nextState.burstUntil = now + duration;
            nextState.burstPower = 4 + Math.random() * 4;
            nextState.nextBurstAt = now + 900 + Math.random() * 1100;
        }

        if (behavior === "nervous") {
            const duration = 140 + Math.random() * 180;
            nextState.burstUntil = now + duration;
            nextState.burstPower = 2 + Math.random() * 2.5;
            nextState.nextBurstAt = now + 450 + Math.random() * 700;
        }

        if (behavior === "heavy_pull") {
            const duration = 900 + Math.random() * 900;
            nextState.burstUntil = now + duration;
            nextState.burstPower = 1.1 + Math.random() * 1.1;
            nextState.nextBurstAt = now + 1200 + Math.random() * 1000;
        }

        if (behavior === "calm") {
            nextState.burstUntil = 0;
            nextState.burstPower = 0;
            nextState.nextBurstAt = now + 1600 + Math.random() * 2000;
        }
    }

    return nextState;
}