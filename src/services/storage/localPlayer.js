const PLAYER_NAME_KEY = "fishing_player_name";

export function savePlayerName(name) {
    localStorage.setItem(PLAYER_NAME_KEY, name);
}

export function getPlayerName() {
    return localStorage.getItem(PLAYER_NAME_KEY) || "";
}

export function clearPlayerName() {
    localStorage.removeItem(PLAYER_NAME_KEY);
}