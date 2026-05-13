# widgetron

Редактор виджетов на React/Vite с AI-генерацией, ручным редактированием схемы и локальным preview.

## Запуск

```bash
npm install
npm run dev
```

## Публичный контракт `WidgetCreator`

- `WidgetCreator` принимает опциональный prop `onSave`.
- При сохранении наружу передается текущий snapshot редактора:
  - `scheme`: текущая схема виджета
  - `dataSource`: настройки источника данных `{ url, method, type }`
  - `data`: текущие данные редактора, если они есть
