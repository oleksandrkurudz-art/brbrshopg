# Web-app1: Telegram Web App для запису

## Що реалізовано
- 4 кроки: `Барбери -> Послуги -> Дата та час -> Підтвердження`.
- 5 барберів з фото з папки `PHOTO`.
- Категорії послуг: `Всі`, `Стрижка`, `Борода`, `Комплексні`, `Додаткові`.
- Вибір дня (6 найближчих) та часу (09:00-22:00).
- Форма з `Ім'я` + `Телефон`.
- Відправка заявки через `Telegram.WebApp.sendData(...)` у JSON.

## Файли
- `index.html`
- `styles.css`
- `app.js`

## Як запустити локально
1. Запусти будь-який статичний сервер у папці `Web-app1`.
2. Відкрий `index.html`.
3. Без Telegram середовища дані заявки виводяться в `console.log`.

## Як підключити у Telegram кнопці (n8n)
У кнопці `web_app.url` вкажи публічний HTTPS URL цього Web App.

Приклад payload, який повертає Web App:
```json
{
  "type": "booking_request",
  "createdAt": "2026-02-20T13:00:00.000Z",
  "telegramUser": {
    "id": 123456789,
    "username": "client"
  },
  "booking": {
    "barber": { "id": "yana", "name": "Яна" },
    "service": { "id": "haircut", "title": "Стрижка", "price": 400 },
    "date": "2026-02-24",
    "time": "14:00",
    "customerName": "Олег",
    "customerPhone": "+380991112233"
  }
}
```

## Що робити в n8n після `Telegram Trigger`
1. Перевірити, чи прийшло `message.web_app_data.data`.
2. Розпарсити JSON (`JSON.parse(...)`).
3. Надіслати адміну повідомлення через `Telegram -> sendMessage` з даними заявки.
4. (Опційно) зберегти в Google Sheets/Airtable.
