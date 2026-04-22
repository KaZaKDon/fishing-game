# ⚙️ Modifiers System

# Версия: 0.1
# Статус: draft

## 📌 Принцип

Любая механика:
data → modifiers → session

---

## 📦 Пример данных

{
  id: "bait_worm",
  modifiers: {
    biteChance: 10
  }
}

---

## ⚙️ Расчёт

biteChance =
  base
  + bait
  + booster
  + location

---

## 📍 Где реализуется

services/game/modifiers.js

---

## ❗ Правила

- data без логики
- modifiers объединяют
- session хранит результат