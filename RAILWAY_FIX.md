# 🔧 Виправлення проблеми Railway

## Проблема: `ERR_PNPM_NO_SCRIPT_OR_SERVER`

Railway намагається запустити `pnpm start`, але не може знайти скрипт.

## Рішення:

### Варіант 1: Docker (рекомендований)
```json
{
  "build": {
    "builder": "DOCKERFILE",
    "dockerfilePath": "Dockerfile"
  },
  "deploy": {
    "startCommand": "node dist/main.js"
  }
}
```

### Варіант 2: Nixpacks
```json
{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "cd apps/api && node dist/main.js"
  }
}
```

## Файли для деплою:

### ✅ `Dockerfile`
- Встановлює pnpm
- Встановлює `CI=true`
- Збирає проект
- Запускає API

### ✅ `railway.json`
- Використовує Docker
- Встановлює правильну команду запуску
- Налаштовує healthcheck

### ✅ `.nixpacks.toml`
- Альтернатива для Nixpacks
- Встановлює CI змінні
- Налаштовує збірку

## Швидкий деплой:

```bash
# 1. Коміт змін
git add .
git commit -m "Fix Railway start command"
git push origin main

# 2. Деплой на Railway
# - Використовуйте Dockerfile
# - Додайте OPENAI_API_KEY
# - Деплой!
```

## Перевірка:

- **Healthcheck:** `https://your-app.railway.app/health`
- **API:** `https://your-app.railway.app/`

---

**Готово! Railway повинен успішно запуститися! 🎯**
