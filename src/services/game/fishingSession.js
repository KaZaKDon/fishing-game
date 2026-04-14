import { randomBetween } from "../../utils/random";

export function getBiteDelay() {
    return randomBetween(2000, 5000);
}

export function getReactionTime() {
    return randomBetween(1000, 1800);
}

export function increaseTension(currentValue) {
    return Math.min(currentValue + 1.8, 100);
}

export function decreaseTension(currentValue) {
    return Math.max(currentValue - 1.2, 0);
}

export function isTensionTooHigh(value) {
    return value >= 92;
}

export function isTensionTooLow(value) {
    return value <= 8;
}