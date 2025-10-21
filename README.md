# Receipt Tracker (React + NestJS + SQLite + Tesseract OCR)

Локальний сервіс для обліку чеків: завантаження фото/PDF, OCR (ukr+eng), парсинг позицій, сортування.

## Стек
- **Backend:** NestJS (Express), `better-sqlite3` (вбудована SQLite, файл у `apps/api/data/app.db`), `tesseract.js` для OCR.
- **Frontend:** React + Vite + TypeScript.
- **Спільні типи:** `packages/shared`.

## Швидкий старт
```bash
# 1) Встановити залежності
npm install

# 2) Перейти в бекенд і докачати моделі Tesseract (ukr+eng)
#    (або покласти їх офлайн у apps/api/ocr-data/)
#    За замовчуванням Tesseract тягне моделі з CDN при першому запуску.

# 3) Запустити дев-сервери
npm run dev
# API: http://localhost:3001
# Web: http://localhost:5173
```

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
