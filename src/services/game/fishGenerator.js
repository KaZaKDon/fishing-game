import { fishSpecies } from "../../data/fish/fishSpecies";

function getRandomFloat(min, max) {
    return Math.random() * (max - min) + min;
}

function getRarityLabel(rarity) {
    if (rarity === "common") return "Обычная";
    if (rarity === "uncommon") return "Нечастая";
    if (rarity === "rare") return "Редкая";
    if (rarity === "trophy") return "Трофейная";
    return "Обычная";
}

function pickFishByChance(list) {
    const totalChance = list.reduce((sum, fish) => sum + fish.chance, 0);
    const roll = Math.random() * totalChance;

    let current = 0;

    for (const fish of list) {
        current += fish.chance;

        if (roll <= current) {
            return fish;
        }
    }

    return list[list.length - 1];
}

export function generateFish() {
    const fish = pickFishByChance(fishSpecies);
    const rawWeight = getRandomFloat(fish.weightMin, fish.weightMax);
    const weight = Number(rawWeight.toFixed(2));
    const price = Math.round(weight * fish.basePrice);

    return {
        id: fish.id,
        name: fish.name,
        kind: fish.kind,
        bitePattern: fish.bitePattern,
        rarityKey: fish.rarity,
        rarity: getRarityLabel(fish.rarity),
        weight,
        price,
    };
}