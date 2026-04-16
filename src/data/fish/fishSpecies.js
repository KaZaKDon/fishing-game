export const fishSpecies = [
    {
        id: "crucian",
        name: "Карась",
        kind: "peaceful",
        rarity: "common",
        chance: 40,

        weightMin: 0.3,
        weightMax: 1.5,
        basePrice: 120,

        // 🎮 механика
        difficulty: 0.8,
        tensionUpMultiplier: 0.9,
        tensionDownMultiplier: 0.8,
        reelSpeedMultiplier: 1.1,
        escapeThreshold: 4,
        behavior: "calm",
    },

    {
        id: "roach",
        name: "Плотва",
        kind: "peaceful",
        rarity: "common",
        chance: 25,

        weightMin: 0.1,
        weightMax: 1.2,
        basePrice: 100,

        difficulty: 0.9,
        tensionUpMultiplier: 1.0,
        tensionDownMultiplier: 0.9,
        reelSpeedMultiplier: 1.0,
        escapeThreshold: 5,
        behavior: "nervous",
    },

    {
        id: "perch",
        name: "Окунь",
        kind: "predator",
        rarity: "common",
        chance: 20,

        weightMin: 0.2,
        weightMax: 1.3,
        basePrice: 180,

        difficulty: 1.1,
        tensionUpMultiplier: 1.2,
        tensionDownMultiplier: 1.0,
        reelSpeedMultiplier: 0.95,
        escapeThreshold: 5,
        behavior: "jerky",
    },

    {
        id: "pike",
        name: "Щука",
        kind: "predator",
        rarity: "uncommon",
        chance: 10,

        weightMin: 1.5,
        weightMax: 8,
        basePrice: 260,

        difficulty: 1.4,
        tensionUpMultiplier: 1.3,
        tensionDownMultiplier: 0.9,
        reelSpeedMultiplier: 0.8,
        escapeThreshold: 6,
        behavior: "jerky",
    },

    {
        id: "catfish",
        name: "Сом",
        kind: "predator",
        rarity: "rare",
        chance: 5,

        weightMin: 4,
        weightMax: 15,
        basePrice: 320,

        difficulty: 1.8,
        tensionUpMultiplier: 1.4,
        tensionDownMultiplier: 1.1,
        reelSpeedMultiplier: 0.65,
        escapeThreshold: 8,
        behavior: "heavy_pull",
    },
];