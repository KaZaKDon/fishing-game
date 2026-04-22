# 🎯 CatchSession

# Версия: 0.1
# Статус: draft

## 📌 Назначение

CatchSession — модель одной попытки ловли.

---

## 📦 Структура

{
  sessionId: "catch_1",

  phase: "idle",

  startedAt: null,
  biteAt: null,

  showFloat: true,
  isHolding: false,
  tension: 0,

  result: null,
  failReason: null
}

---

## 🔄 Фазы

idle  
waiting  
bite  
reeling  
success  
failed  

---

## ⚙️ Функции

- createCatchSession
- resetCatchSession
- startCast
- triggerBite
- startReeling
- setHolding
- updateSessionTension
- failCatch

---

## ❗ Правила

- session = единый источник состояния
- UI не хранит фазу отдельно
- функции возвращают новый state