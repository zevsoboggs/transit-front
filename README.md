# transit-front

Панель управления транзитными кошельками — **Refine + Ant Design** (светлая тема).

Разделы: **Обзор** (мастер-кошелёк, суточная квота), **Кошельки** (только свои,
QR-коды, пополнение/перевод/переименование), **Реестр** (журнал операций),
**Сети**. Вход по логину (JWT).

## Запуск локально

Нужен запущенный backend на `http://localhost:3001` (репозиторий `transit-backend`).

```bash
npm install
npm run dev        # http://localhost:5173  (проксирует /api на localhost:3001)
```

## Деплой на Vercel

1. **New Project → Import** этот репозиторий. Framework: **Vite** (определится сам).
   Build: `npm run build`, Output: `dist`.
2. `vercel.json` уже проксирует `/api/*` на бэкенд
   (`https://transit-api.tranzor.io`) — CORS не нужен, всё same-origin.
   > Если кастомный домен бэкенда ещё не подключён, временно замени в
   > `vercel.json` адрес на выданный Railway `https://<name>.up.railway.app`.
3. **Settings → Domains** → добавь `transit.tranzor.io` и пропиши DNS по
   инструкции Vercel.
4. Переменные окружения обычно не нужны (см. `.env.example`).

После деплоя открой `https://transit.tranzor.io`, войди
(`develguide@gmail.com` / пароль из `ADMIN_PASSWORD` бэкенда).
