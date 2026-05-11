export const fishingSpots = [
    {
        id: "left-bank",
        regionId: "don-low",
        title: "Левый берег",
        levelRequired: 1,
        position: { x: 24, y: 62 },
        background: "/images/fishing-spots/left-bank.png",
        modifiers: {
            biteDelay: 0,
            rareChance: 0,
            weightBonus: 0,
            fishPower: 0,
        },
    },
    {
        id: "reed-edge",
        regionId: "don-low",
        title: "Камышовая кромка",
        levelRequired: 1,
        position: { x: 34, y: 48 },
        background: "/images/fishing-spots/reed-edge.png",
        modifiers: {
            biteDelay: -300,
            rareChance: 2,
            weightBonus: 0.05,
            fishPower: 1,
        },
    },
    {
        id: "sand-spit",
        regionId: "don-low",
        title: "Песчаная коса",
        levelRequired: 2,
        position: { x: 58, y: 42 },
        background: "/images/fishing-spots/sand-spit.png",
        modifiers: {
            biteDelay: 200,
            rareChance: 4,
            weightBonus: 0.1,
            fishPower: 2,
        },
    },
    {
        id: "old-pier",
        regionId: "don-low",
        title: "Старый причал",
        levelRequired: 3,
        position: { x: 70, y: 58 },
        background: "/images/fishing-spots/old-pier.png",
        modifiers: {
            biteDelay: -100,
            rareChance: 6,
            weightBonus: 0.15,
            fishPower: 3,
        },
    },
    {
        id: "deep-channel",
        regionId: "don-low",
        title: "Глубокая протока",
        background: "/images/fishing-spots/deep-channel.png",
        levelRequired: 4,
        position: { x: 47, y: 67 },
        modifiers: {
            biteDelay: 400,
            rareChance: 10,
            weightBonus: 0.25,
            fishPower: 5,
        },
    },
];

export function getSpotsByRegionId(regionId) {
    return fishingSpots.filter((spot) => spot.regionId === regionId);
}

export function getSpotById(spotId) {
    return fishingSpots.find((spot) => spot.id === spotId) ?? null;
}