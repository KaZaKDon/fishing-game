import { fishSpecies } from "../../data/fish/fishSpecies";

function getRandomFloat(min, max) {
    return Math.random() * (max - min) + min;
}

function getChanceByRarity(rarity) {
    if (rarity === "common") return 55;
    if (rarity === "uncommon") return 30;
    if (rarity === "rare") return 12;
    if (rarity === "trophy") return 3;
    return 10;
}

function getRarityLabel(rarity) {
    if (rarity === "common") return "Обычная";
    if (rarity === "uncommon") return "Нечастая";
    if (rarity === "rare") return "Редкая";
    if (rarity === "trophy") return "Трофейная";
    return "Обычная";
}

function pickFishByChance(list) {
    const weighted = list.map((fish) => ({
        ...fish,
        chance: getChanceByRarity(fish.rarity),
    }));

    const totalChance = weighted.reduce((sum, fish) => sum + fish.chance, 0);
    const roll = Math.random() * totalChance;

    let current = 0;

    for (const fish of weighted) {
        current += fish.chance;

        if (roll <= current) {
            return fish;
        }
    }

    return weighted[weighted.length - 1];
}

export function generateFish() {
    const fish = pickFishByChance(fishSpecies);
    const rawWeight = getRandomFloat(fish.weightMin, fish.weightMax);
    const weight = Number(rawWeight.toFixed(2));
    const price = Math.round(weight * fish.basePrice);

    return {
        id: fish.id,
        name: fish.name,
        weight,
        price,
        rarity: getRarityLabel(fish.rarity),
    };
}