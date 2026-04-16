export function createEmptyFishStats() {
    return {
        byFishId: {},
        totalCaught: 0,
        totalWeight: 0,
        totalValue: 0,
    };
}

export function updateFishStats(stats, fish) {
    const safeStats = stats && typeof stats === "object"
        ? stats
        : createEmptyFishStats();

    if (!fish) {
        return safeStats;
    }

    const fishId = fish.id ?? "unknown";
    const fishName = fish.name ?? "Неизвестная рыба";
    const fishWeight = Number(fish.weight) || 0;
    const fishPrice = Number(fish.price) || 0;
    const fishRarity = fish.rarity ?? null;
    const fishRarityKey = fish.rarityKey ?? null;

    const currentEntry = safeStats.byFishId[fishId] ?? {
        fishId,
        name: fishName,
        count: 0,
        totalWeight: 0,
        totalValue: 0,
        bestWeight: 0,
        bestPrice: 0,
        rarity: fishRarity,
        rarityKey: fishRarityKey,
    };

    const nextEntry = {
        ...currentEntry,
        name: fishName,
        count: currentEntry.count + 1,
        totalWeight: Number((currentEntry.totalWeight + fishWeight).toFixed(2)),
        totalValue: currentEntry.totalValue + fishPrice,
        bestWeight: Math.max(currentEntry.bestWeight, fishWeight),
        bestPrice: Math.max(currentEntry.bestPrice, fishPrice),
        rarity: fishRarity ?? currentEntry.rarity,
        rarityKey: fishRarityKey ?? currentEntry.rarityKey,
    };

    return {
        ...safeStats,
        byFishId: {
            ...safeStats.byFishId,
            [fishId]: nextEntry,
        },
        totalCaught: safeStats.totalCaught + 1,
        totalWeight: Number((safeStats.totalWeight + fishWeight).toFixed(2)),
        totalValue: safeStats.totalValue + fishPrice,
    };
}

export function getFishStatsList(stats) {
    const safeStats = stats && typeof stats === "object"
        ? stats
        : createEmptyFishStats();

    const list = Object.values(safeStats.byFishId ?? {});

    return list.sort((a, b) => {
        if (b.count !== a.count) {
            return b.count - a.count;
        }

        if (b.bestWeight !== a.bestWeight) {
            return b.bestWeight - a.bestWeight;
        }

        return String(a.name).localeCompare(String(b.name), "ru");
    });
}

export function getFishStatById(stats, fishId) {
    const safeStats = stats && typeof stats === "object"
        ? stats
        : createEmptyFishStats();

    return safeStats.byFishId?.[fishId] ?? null;
}

export function resetFishStats() {
    return createEmptyFishStats();
}