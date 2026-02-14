<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# PromptMaster AI Course

Этот проект — 14-дневный интерактивный курс по промпт-инжинирингу с использованием Gemini 2.0.

## Как запустить локально

**Требования:** Node.js

1. Установите зависимости:
   `npm install`
2. Создайте файл `.env.local` и добавьте ваш ключ:
   `GEMINI_API_KEY=ваш_ключ_здесь`
3. Запустите приложение:
   `npm run dev`

## Деплой на Vercel

1. Создайте новый проект на [Vercel](https://vercel.com).
2. Импортируйте ваш репозиторий из GitHub.
3. **ВАЖНО:** В настройках проекта (Environment Variables) добавьте переменную:
   - Key: `GEMINI_API_KEY`
   - Value: `ваш_ключ_от_google_ai_studio`
4. Нажмите **Deploy**.

Vercel автоматически использует `npm run build` и папку `dist` для публикации.