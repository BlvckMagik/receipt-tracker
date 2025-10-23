# Receipt Tracker (React + NestJS + SQLite + Tesseract OCR)

Локальний сервіс для обліку чеків: завантаження фото/PDF, OCR (ukr+eng), парсинг позицій, сортування.

## Стек
- **Backend:** NestJS (Express), `better-sqlite3` (вбудована SQLite, файл у `apps/api/data/app.db`), `tesseract.js` для OCR.
- **Frontend:** React + Vite + TypeScript.
- **Спільні типи:** `packages/shared`.

## Швидкий старт
```bash
# 1) Встановити залежності
pnpm install

# 2) Перейти в бекенд і докачати моделі Tesseract (ukr+eng)
#    (або покласти їх офлайн у apps/api/ocr-data/)
#    За замовчуванням Tesseract тягне моделі з CDN при першому запуску.

# 3) Запустити дев-сервери
pnpm run dev
# API: http://localhost:3001
# Web: http://localhost:5173
```

## Розгортання

### Фронтенд на Vercel
Фронтенд налаштований для розгортання на Vercel. API підключається автоматично:
- **Dev режим**: API працює локально на `/api`
- **Prod режим**: API підключається через змінну середовища `VITE_API_URL`

Для налаштування продакшн API:
1. Додайте змінну середовища `VITE_API_URL` в Vercel Dashboard
2. Вкажіть URL вашого API сервера (наприклад: `https://your-api-domain.com/api`)

### API сервер
API сервер потрібно розгортати окремо (Railway, Render, або інший хостинг).

## Структура
```
apps/
  api/        NestJS API (upload, OCR, парсинг, SQLite)
  web/        React UI (завантаження, список чеків, позиції)
packages/
  shared/     Спільні типи TypeScript
```

## Команди для GitHub
```bash
git init
git add .
git commit -m "init: receipt tracker (react + nest + sqlite + ocr)"
git branch -M main
git remote add origin <YOUR_GITHUB_REPO_URL>
git push -u origin main
```
