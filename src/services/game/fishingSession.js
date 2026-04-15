import { randomBetween } from "../../utils/random";

export function getBiteDelay() {
    return randomBetween(2000, 5000);
}

export function getReactionTime() {
    return randomBetween(1000, 1800);
}

export function increaseTension(currentValue) {
    return Math.min(currentValue + 1.6, 100);
}

export function decreaseTension(currentValue) {
    return Math.max(currentValue - 1.4, 0);
}

export function isTensionTooHigh(value) {
    return value > 80;
}

export function isTensionTooLow(value) {
    return value < 20;
}

export function isTensionInSafeZone(value) {
    return value >= 20 && value <= 80;
}

export function increaseReelProgress(currentValue) {
    return Math.min(currentValue + 3.5, 100);
}

export function decreaseReelProgress(currentValue) {
    return Math.max(currentValue - 0.35, 0);
}