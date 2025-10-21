# 🚀 Деплой на Railway - Виправлені проблеми

## Проблеми, які були вирішені:

### 1. ❌ `ERR_PNPM_ABORTED_REMOVE_MODULES_DIR_NO_TTY`
**Проблема:** pnpm не може працювати в CI режимі без TTY
**Рішення:** Додано `ENV CI=true` в Dockerfile

### 2. ❌ Healthcheck не працює
**Проблема:** Додаток не відповідає на healthcheck
**Рішення:** Додано HealthController з `/health` endpoint

### 3. ❌ `__dirname` не визначений
**Проблема:** ES модулі не мають `__dirname`
**Рішення:** Додано підтримку ES модулів з `fileURLToPath`

## Файли конфігурації:

### ✅ `railway.json`
```json
{
  "build": {
    "builder": "DOCKERFILE",
    "dockerfilePath": "Dockerfile.railway"
  },
  "deploy": {
    "healthcheckPath": "/health",
    "healthcheckTimeout": 300
  }
}
```

### ✅ `Dockerfile.railway`
- Встановлює pnpm
- Встановлює `CI=true`
- Копіює файли в правильному порядку
- Збирає обидва додатки
- Запускає API

### ✅ `HealthController`
- `/` - основний endpoint
- `/health` - healthcheck endpoint
- Повертає статус та timestamp

## Швидкий деплой:

```bash
# 1. Коміт змін
git add .
git commit -m "Fix Railway deployment issues"
git push origin main

# 2. Деплой на Railway
# - Перейдіть на railway.app
# - Підключіть GitHub
# - Додайте OPENAI_API_KEY
# - Деплой!
```

## Перевірка після деплою:

- **Healthcheck:** `https://your-app.railway.app/health`
- **API:** `https://your-app.railway.app/`
- **Receipts:** `https://your-app.railway.app/receipts`

## Альтернативні варіанти:

### Варіант 1: Nixpacks (якщо Docker не працює)
```json
{
  "build": { "builder": "NIXPACKS" },
  "deploy": {
    "startCommand": "CI=true pnpm install && pnpm build && cd apps/api && node dist/main.js"
  }
}
```

### Варіант 2: Render
- Використовуйте `render.yaml`
- Автоматичний деплой з GitHub

---

**Готово! Тепер Railway повинен успішно пройти всі перевірки! 🎯**
