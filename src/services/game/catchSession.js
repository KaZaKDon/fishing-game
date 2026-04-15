let sessionCounter = 0;

export function createCatchSession() {
    sessionCounter += 1;

    return {
        sessionId: `catch_${sessionCounter}`,
        phase: "idle", // idle | waiting | bite | reeling | success | failed

        startedAt: null,
        biteAt: null,

        showFloat: false,
        isHolding: false,
        tension: 0,

        reelProgress: 0,
        reelGoal: 60,

        result: null, // null | success | failed
        fish: null,
        failReason: null, // null | cancel | miss_bite | tension_high | tension_low
    };
}

export function resetCatchSession() {
    return createCatchSession();
}

export function startCast(session) {
    return {
        ...session,
        phase: "waiting",
        startedAt: Date.now(),
        biteAt: null,
        showFloat: true,
        isHolding: false,
        tension: 0,
        reelProgress: 0,
        result: null,
        fish: null,
        failReason: null,
    };
}

export function triggerBite(session) {
    return {
        ...session,
        phase: "bite",
        biteAt: Date.now(),
    };
}

export function startReeling(session) {
    return {
        ...session,
        phase: "reeling",
        showFloat: false,
        isHolding: false,
        tension: 22,
        reelProgress: 0,
    };
}

export function setHolding(session, isHolding) {
    return {
        ...session,
        isHolding,
    };
}

export function updateSessionTension(session, tension) {
    return {
        ...session,
        tension,
    };
}

export function updateReelProgress(session, reelProgress) {
    return {
        ...session,
        reelProgress,
    };
}

export function failCatch(session, reason) {
    return {
        ...session,
        phase: "failed",
        result: "failed",
        failReason: reason,
        showFloat: false,
        isHolding: false,
    };
}

export function finishCatch(session, fish = null) {
    return {
        ...session,
        phase: "success",
        result: "success",
        fish,
        showFloat: false,
        isHolding: false,
    };
}