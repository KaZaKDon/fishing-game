export function createCatchEntry(fish) {
    if (!fish) return null;

    return {
        id: `${Date.now()}_${fish.id}_${Math.random().toString(36).slice(2, 8)}`,
        fishId: fish.id,
        name: fish.name,
        weight: fish.weight,
        price: fish.price,
        rarity: fish.rarity,
        rarityKey: fish.rarityKey ?? null,
        behavior: fish.behavior ?? null,
        caughtAt: Date.now(),
    };
}

export function addFishToInventory(inventory, fish) {
    const entry = createCatchEntry(fish);

    if (!entry) {
        return Array.isArray(inventory) ? inventory : [];
    }

    const safeInventory = Array.isArray(inventory) ? inventory : [];
    return [entry, ...safeInventory];
}

export function getInventoryStats(inventory) {
    const safeInventory = Array.isArray(inventory) ? inventory : [];

    const totalCaught = safeInventory.length;

    const totalWeight = safeInventory.reduce((sum, item) => {
        return sum + (Number(item.weight) || 0);
    }, 0);

    const estimatedValue = safeInventory.reduce((sum, item) => {
        return sum + (Number(item.price) || 0);
    }, 0);

    return {
        totalCaught,
        totalWeight: Number(totalWeight.toFixed(2)),
        estimatedValue,
    };
}

export function isInventoryFull(inventory, limit) {
    const safeInventory = Array.isArray(inventory) ? inventory : [];
    return safeInventory.length >= limit;
}

export function tryAddFishToInventory(inventory, fish, limit) {
    const safeInventory = Array.isArray(inventory) ? inventory : [];
    const safeLimit = Number(limit) || 0;

    if (!fish || safeLimit <= 0) {
        return {
            inventory: safeInventory,
            entry: null,
            added: false,
            reason: "invalid_input",
        };
    }

    if (safeInventory.length >= safeLimit) {
        return {
            inventory: safeInventory,
            entry: null,
            added: false,
            reason: "keepnet_full",
        };
    }

    const entry = createCatchEntry(fish);

    if (!entry) {
        return {
            inventory: safeInventory,
            entry: null,
            added: false,
            reason: "invalid_fish",
        };
    }

    return {
        inventory: [entry, ...safeInventory],
        entry,
        added: true,
        reason: null,
    };
}

export function removeCheapestFishFromInventory(inventory) {
    const safeInventory = Array.isArray(inventory) ? inventory : [];

    if (safeInventory.length === 0) {
        return {
            inventory: [],
            removedFish: null,
        };
    }

    let cheapestIndex = 0;

    for (let i = 1; i < safeInventory.length; i += 1) {
        const currentPrice = Number(safeInventory[i]?.price) || 0;
        const cheapestPrice = Number(safeInventory[cheapestIndex]?.price) || 0;

        if (currentPrice < cheapestPrice) {
            cheapestIndex = i;
        }
    }

    const removedFish = safeInventory[cheapestIndex];
    const nextInventory = safeInventory.filter((_, index) => index !== cheapestIndex);

    return {
        inventory: nextInventory,
        removedFish,
    };
}

export function replaceCheapestFishInInventory(inventory, fish, limit) {
    const safeInventory = Array.isArray(inventory) ? inventory : [];
    const safeLimit = Number(limit) || 0;

    if (!fish || safeLimit <= 0) {
        return {
            inventory: safeInventory,
            entry: null,
            removedFish: null,
            added: false,
            reason: "invalid_input",
        };
    }

    const removeResult = removeCheapestFishFromInventory(safeInventory);
    const addResult = tryAddFishToInventory(removeResult.inventory, fish, safeLimit);

    return {
        inventory: addResult.inventory,
        entry: addResult.entry,
        removedFish: removeResult.removedFish,
        added: addResult.added,
        reason: addResult.reason,
    };
}

export function sellInventory(inventory) {
    const safeInventory = Array.isArray(inventory) ? inventory : [];
    const stats = getInventoryStats(safeInventory);

    return {
        earnedMoney: stats.estimatedValue,
        inventory: [],
        totalCaught: 0,
        totalWeight: 0,
        estimatedValue: 0,
    };
}

export function processSellAll(inventory, pendingFish, limit) {
    const sellResult = sellInventory(inventory);

    const addResult = tryAddFishToInventory(
        sellResult.inventory,
        pendingFish,
        limit
    );

    const stats = getInventoryStats(addResult.inventory);

    return {
        moneyDelta: sellResult.earnedMoney,
        inventory: addResult.inventory,
        stats,
        entry: addResult.entry,
    };
}