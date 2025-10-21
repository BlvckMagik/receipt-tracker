# 🚀 Інструкції для деплою Receipt Tracker

## Підготовка до деплою

### 1. Перевірка збірки
```bash
# Запустіть скрипт підготовки
bash deploy.sh
```

### 2. Коміт змін
```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

## Варіанти деплою

### 🎯 Варіант 1: Railway (Рекомендований)

**Переваги:**
- ✅ Підтримує SQLite
- ✅ Простий деплой
- ✅ Безкоштовний план
- ✅ Автоматичні збірки

**Кроки:**
1. Перейдіть на [railway.app](https://railway.app)
2. Увійдіть через GitHub
3. Натисніть "New Project" → "Deploy from GitHub repo"
4. Виберіть ваш репозиторій
5. Додайте змінну середовища:
   - `OPENAI_API_KEY` - ваш ключ OpenAI
6. Деплой автоматично почнеться!

**URL:** `https://your-app-name.railway.app`

### 🎯 Варіант 2: Render

**Переваги:**
- ✅ Надійність
- ✅ Автоматичний деплой
- ✅ Безкоштовний план

**Кроки:**
1. Перейдіть на [render.com](https://render.com)
2. Підключіть GitHub репозиторій
3. Виберіть "Web Service"
4. Render автоматично використає `render.yaml`
5. Додайте змінну середовища:
   - `OPENAI_API_KEY` - ваш ключ OpenAI

**URL:** `https://your-app-name.onrender.com`

### 🎯 Варіант 3: Vercel + Railway (Гібридний)

**Frontend на Vercel:**
1. Перейдіть на [vercel.com](https://vercel.com)
2. Імпортуйте репозиторій
3. Налаштування:
   - **Framework Preset**: Vite
   - **Root Directory**: `apps/web`
   - **Build Command**: `pnpm build`
   - **Output Directory**: `dist`

**Backend на Railway:**
1. Деплой API на Railway (як у Варіанті 1)
2. Оновіть API URL у фронтенді

## Структура проекту

```
receipt-tracker/
├── apps/
│   ├── api/          # NestJS API
│   └── web/          # React + Vite
├── packages/
│   └── shared/       # Спільні типи
├── Dockerfile        # Docker конфігурація
├── railway.json      # Railway конфігурація
├── render.yaml       # Render конфігурація
└── deploy.sh         # Скрипт підготовки
```

## Змінні середовища

### Обов'язкові:
- `OPENAI_API_KEY` - ключ для OpenAI API

### Опціональні:
- `NODE_ENV=production`
- `PORT=3001` (автоматично встановлюється)

## Після деплою

1. **Перевірте роботу API:**
   - `GET /` - головна сторінка
   - `POST /receipts/upload` - завантаження чеків
   - `GET /receipts` - список чеків

2. **Перевірте базу даних:**
   - SQLite файл створюється автоматично
   - Таблиці: `receipts`, `items`

3. **Моніторинг:**
   - Railway: Dashboard → Metrics
   - Render: Dashboard → Logs

## Усунення проблем

### Помилка збірки:
```bash
# Очистіть кеш
pnpm store prune
rm -rf node_modules
pnpm install
```

### Помилка з базою даних:
- Перевірте права доступу до файлів
- Переконайтеся, що директорія `data/` існує

### Помилка з OCR:
- Перевірте наявність файлів `eng.traineddata` та `ukr.traineddata`
- Переконайтеся, що `sharp` встановлений

## Підтримка

Якщо виникли проблеми:
1. Перевірте логи в Dashboard
2. Переконайтеся, що всі змінні середовища встановлені
3. Перевірте, що збірка проходить локально

---

**Готово! 🎉 Ваш додаток готовий до деплою!**
