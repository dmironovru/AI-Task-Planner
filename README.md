# 🧠 AI Task Planner

Интеллектуальное приложение для управления задачами с AI-парсингом естественного языка.

[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)

## ✨ Описание

AI Task Planner — это современный менеджер задач, который понимает обычный человеческий язык. Вместо заполнения множества полей просто напишите задачу текстом, а AI автоматически распознает дату, время и приоритет.

## 🎯 Чем полезен

- **Экономия времени** — создание задачи за 5 секунд вместо 30
- **Списки покупок** — вводите товары через запятую, отмечаете купленное кликом
- **Напоминания** — браузерные уведомления чтобы ничего не забыть
- **Визуальный таймлайн** — задачи сгруппированы по датам с линией времени
- **Работает офлайн** — все данные хранятся локально в браузере
- **Приватно** — никакие данные не отправляются на сервер

## 🚀 Быстрый старт

```bash
# Клонировать репозиторий
git clone https://github.com/dmironovru/ai-task-planner.git
cd ai-task-planner

# Установить зависимости
npm install

# Запустить
npm run dev
```

Откройте http://localhost:3000

## 📖 Примеры использования

### Обычная задача
```
Позвонить маме завтра в 15:00
```

### Список покупок
```
молоко 1л, хлеб 2 шт, картошка 1 кг, сыр
```

### Задача с приоритетом
```
Срочно: отправить отчёт до конца дня
```

## 🛠️ Стек технологий

| Категория | Технологии |
|-----------|------------|
| Frontend | Next.js 15, React 19, TypeScript |
| Styling | Tailwind CSS, Framer Motion |
| AI | Ollama (локальные LLM) |
| Хранение | localStorage |
| Уведомления | Web Notifications API |

## 📸 Скриншоты


### Главная страница
![](https://raw.githubusercontent.com/dmironovru/AI-Task-Planner/main/screenshot-main.png)

### Создание задачи
![](https://raw.githubusercontent.com/dmironovru/AI-Task-Planner/main/screenshot-create.png)

### Список покупок
![](https://raw.githubusercontent.com/dmironovru/AI-Task-Planner/main/screenshot-shopping.png)

### Календарь
![](https://raw.githubusercontent.com/dmironovru/AI-Task-Planner/main/screenshot-calendar.png)

## 🚧 В разработке

- Голосовой ввод (Whisper.cpp / Vosk)
- Синхронизация между устройствами
- Экспорт/импорт задач
- PWA для офлайн работы

## 👨‍ Автор

Дмитрий Миронов

- 🌐 [dmitrymironov.ru](https://dmitrymironov.ru)
- 💼 [GitHub](https://github.com/dmironovru)
