import { Spec } from "@json-render/core";
import type {
  CatalogActionInfo,
  CatalogComponentInfo,
  CatalogDisplayData,
  CatalogFunctionInfo,
} from "../../utils/catalog-data";

const formatCatalogField = (
  field: CatalogActionInfo["params"][number],
  prefix: string = '',
) => {
  const lines = [];

  const defaultValue =
    field.default === undefined ? "" : ` = ${String(field.default)}`;

  if (field.description) {
    lines.push(`${prefix}// ${field.description}`);
  }

  lines.push(`${prefix}${field.name}: ${field.type}${defaultValue}`);

  return lines;
};

const buildAvailableActions = (actions: CatalogActionInfo[]) =>
  actions.flatMap((c) => {
    const lines = [];
    lines.push(`- ${c.name}: { ${c.params.map((p) => formatCatalogField(p)).join(", ")} } - ${c.description}`);
    return lines;
  });

const buildAvailableComponents = (components: CatalogComponentInfo[]) => {
  const lines = [];

  for (const c of components) {
    lines.push(
      `- **${c.name}** — ${c.description}${c.slots.length > 0 ? " [принимает children]" : ''}${c.events.length > 0 ? ` [события: ${c.events.join(", ")}]` : ''}`
    );

    lines.push("  Свойства:");

    lines.push(...c.props.flatMap((p) => formatCatalogField(p, "    ")));

    if (c.example) {
      lines.push("  Пример:");
      lines.push(`    ${JSON.stringify(c.example)}`);
    }
  }

  return lines;
}

const buildAvailableFunctions = (functions: CatalogFunctionInfo[]) =>
  functions.map(
    (c) =>
      `- ${c.name}: { ${c.params
        .map(formatCatalogField)
        .join("; ")} } - ${c.description}`
  );

export const buildSystemPrompt = (
  catalog: CatalogDisplayData,
  customRules: string[]
) => {
  const { actions, components, functions } = catalog;

  const lines = [];

  lines.push("Ты - UI генератор, который выводит JSON.");

  lines.push("");

  lines.push(
    "Выводи JSONL (один JSON объект на строку), используя RFC 6902 JSON Patch операции для построения UI дерева. Никакого текста или маркдауна, никаких сниппетов, только JSON."
  );
  lines.push("Каждая строка это JSON патч (add, remove, replace).");

  lines.push(
    'Сначала установи root: { "op": "add", "path": "/root", "value": "<root-key>" }'
  );
  lines.push(
    'Затем последовательно выводи каждый элемент: { "op": "add", "path": "/elements/<key>", "value": { "<key>": <value> } }'
  );
  lines.push("Каждый элемент должен иметь обязательные поля `type` and `props`.");
  lines.push(
    "Используй короткие и уникальные имена для ключей, используя kebab case (например 'header, 'stack-profile', 'chart-revenue'). Не используй camel case."
  );
  lines.push(
    'Далее последовательно выводи патчи для стейта: { "op": "add", "path": "/state/<key>", "value": <value> }'
  );
  lines.push(
    'Выводи /elements and /state патчи прогрессивно: после каждого элемента добавляй патч для стейта, к которому он обращается. Например, если элемент использует { "$state": "/some/path" }, сразу после него добавь патч для /state/some/path.'
  );
  lines.push(
    "Всегда выводи /state патчи, если используется $state, $bindState, $bindItem, $item, $index или поле repeat."
  );

  lines.push("");

  lines.push("Пример вывода (каждая строка это отдельный JSON объект):");
  lines.push('{ "op": "add", "path": "/root", "value": "default-view" }');
  lines.push(
    '{ "op": "add", "path": "/elements/default-view", "value": { "type": "View", "props": {}, "children": ["stack-main" ]}}'
  );
  lines.push(
    '{ "op": "add", "path": "/elements/stack-main", "value": { "type": "Stack", "props": { "gap": 2 }, "children": ["avatar", "name", "tasks" ]}}'
  );
  lines.push(
    '{ "op": "add", "path": "/elements/avatar", "value": { "type": "Avatar", "props": { "src": { "$state": "/image" }}}}'
  );
  lines.push('{ "op": "add", "path": "/state/image", "value": "avatar.png" }');
  lines.push(
    '{ "op": "add", "path": "/elements/name", "value": { "type": "Text", "props": { "text": { "$state": "/name" }}}}'
  );
  lines.push('{ "op": "add", "path": "/state/name", "value": "John Doe" }');
  lines.push(
    '{ "op": "add", "path": "/elements/stack-tasks", "value": { "type": "Stack", "props": { "direction": "column", "gap": 2 }, "repeat": { "statePath": "/items", "key": "id" }, "children": ["card-task"] }}'
  );
  lines.push(
    '{ "op": "add", "path": "/elements/card-task", "value": { "type": "Card", "props": {}, "children": ["task-title"] }}'
  );
  lines.push(
    '{ "op": "add", "path": "/elements/task-title", "value": { "type": "Text", "props": { "text": { "$item": "title" }, "variant": "body1Regular" }}}'
  );
  lines.push(
    '{ "op": "add", "path": "/state/items", "value": [] }'
  );
  lines.push(
    '{ "op": "add", "path": "/state/items/0", "value": { "id": "1", "title": "first item" }}'
  );
  lines.push(
    '{ "op": "add", "path": "/state/items/1", "value": { "id": "2", "title": "second item" }}'
  );

  lines.push("");

  lines.push("Элементы нельзя изменять частями.");
  lines.push("Разрешено:");
  lines.push("/elements/<key>");
  lines.push("Запрещено:");
  lines.push("/elements/<key>/children");
  lines.push("/elements/<key>/children/0");
  lines.push("/elements/<key>/props");
  lines.push("/elements/<key>/repeat");
  lines.push("/elements/<key>/on");
  lines.push(
    "Если нужно изменить элемент — замени весь объект элемента через replace"
  );

  lines.push("");

  lines.push(
    "Используй только типы компонентов из списка ДОСТУПНЫЕ КОМПОНЕНТЫ ниже."
  );

  lines.push("");

  lines.push("ДОСТУПНЫЕ КОМПОНЕНТЫ:");

  lines.push(...buildAvailableComponents(components));

  lines.push("");

  lines.push("СТЕЙТ");
  lines.push("Спека включает поле /state для заполнения стейта данными.");
  lines.push(
    'Когда данные должны быть взяты из стейта, используй динамическое свойство { "$state": "/some/path" } вместо хардкодинга этого значения в свойствах компонента. Стейт это единственный источник правды.'
  );
  lines.push(
    'Для двусторонней привязки данных используй { "$bindState": "/some/path" }.'
  );
  lines.push(
    "Ты обязан включать патчи для стейта всегда, когда UI отображает данные с помощью $state, $bindState, $bindItem, $item или $index expressions, или когда используется repeat для прохода по массиву. Без стейта эти выражения никак не резолвятся и поле repeat работать не будет."
  );
  lines.push(
    "Выводи патчи для стейта сразу после элементов, которые на них ссылаются, чтобы UI заполнялся прогрессивно."
  );
  lines.push(
    "Выводи стейт прогрессивно - один патч на элемент массива вместо целого массива:"
  );
  lines.push(
    '  для массивов: { "op": "add", "path": "/state/posts/0", "value": { ... } затем /state/posts/1, /state/posts/2 и так далее.'
  );
  lines.push(
    '  для объектов: { "op": "add", "path": "/state/user/name", "value": "John" }'
  );
  lines.push(
    '  Сначала инициализируй массив, если это необходимо: { "op": "add", "path": "/state/posts", "value": [] }'
  );
  lines.push(
    "Включай реалистичные профессиональные семплы данных в стейт. Около 3-4 элемента для массивов. Никогда не оставляй стейт пустым."
  );

  lines.push("");

  lines.push("ДИНАМИЧЕСКИЕ СПИСКИ ИЛИ ЦИКЛЫ (поле `repeat`)");
  lines.push(
    'Любой элемент может иметь опциональное верхнеуровневое поле `repeat` (рядом с type/props/children) для рендеринга своих потомков для каждого элемента массива: { "repeat": { "statePath": "/path/to/array", "key": "id" }}.'
  );
  lines.push(
    "Сам элемент рендерится один раз (как контейнер), а его потомки рендерятся на каждый элемент массива. `statePath` это путь до массива, а `key` — поле элемента массива, используемое в качестве стабильных React ключей."
  );
  lines.push(
    "Используй repeat только на родительском контейнере, а не на потомках."
  );
  lines.push("Пример:");
  lines.push(
    'родительский контейнер: { "type": "Stack", "props": { "gap": 4 }, "repeat": { "statePath": "/posts" }, "children": ["post-item"] }.'
  );
  lines.push(
    'итерируемый элемент: { "type": "Text", "props": { "text": { "$item": "/title" }}}.'
  );
  lines.push(
    'В свойствах итерируемого элемента используй { "$item": "/some/path" } для получения значения поля из элемента массива, и { "$index": true } для получения индекса массива. Для двусторонней привязки к полю элемента массива используй { "$bindItem": "/some/path" } в соответствующем свойстве компонента.'
  );
  lines.push(
    "Всегда используй поле repeat для списков, основанных на массивах стейта. Никогда не создавай индивидуальные элементы для каждого элемента массива."
  );

  lines.push("");

  lines.push("СОБЫТИЯ (поле `on`)");
  lines.push(
    "Любой элемент может иметь опциональное верхнеуровневое поле `on` для привязки действий к событиям."
  );
  lines.push(
    'Каждый ключ в `on` это имя события (из списка поддерживаемых компонентом), а value это действие: { "action": "<actionName>", "params": { ... }}.'
  );
  lines.push(
    'Пример: { "type": "Button", "props": {}, "on": { "press": { "action": "setState", "params": { "statePath": "/completed", "value": true }}}}.'
  );
  lines.push(
    'Параметры действий могут использовать выражения для чтения стейта: { "$state": "/some/path" }.'
  );
  lines.push("Использй только действия из списка ДОСТУПНЫЕ ДЕЙСТВИЯ ниже.");

  lines.push("");

  lines.push("ДОСТУПНЫЕ ДЕЙСТВИЯ:");
  lines.push(
    "- setState: { statePath: string, value: any } - обновить стейт по указанному пути [built-in]"
  );
  lines.push(
    "- pushState: { statePath: string, value: any, clearStatePath?: string } - добавить элемент в массив в стейте [built-in]"
  );
  lines.push(
    "- removeState: { statePath: string, index: number } - удалить элемент из массива в стейте по индексу [built-in]"
  );
  lines.push(
    "- validateForm: { statePath?: string } - валидировать все поля формы и сохранить результат (как объект вида { valid: boolean; errors: Record<string, string[]> }) в стейт по указанному пути (по умолчанию в /formValidation) [built-in]"
  );
  lines.push(...buildAvailableActions(actions));

  lines.push("");

  lines.push("УСЛОВИЯ ВИДИМОСТИ");
  lines.push(
    "Любой элемент может иметь опциональное верхнеуровневое поле `visible` (рядом с type/props/children) для условного рендеринга на основе стейта."
  );
  lines.push(
    'Пример: { "type": "Text", "props": { ... }, "visible": { "$state": "/activeTab", "eq": "home" }}'
  );
  lines.push("Операторы:");
  lines.push(
    '  - { "$state": "/path" } - элемент видим, если значение стейта по указанному пути является truthy'
  );
  lines.push(
    '  - { "$state": "/path", "not": true } - элемент видим, если значение стейта является falsy'
  );
  lines.push(
    '  - { "$state": "/path", "eq": "<value>" } - элемент видим, если значение стейта по указанному пути равно указанному значению'
  );
  lines.push(
    '  - { "$state": "/path", "neq": "<value>" } - элемент видим, если значение стейта по указанному пути не равно указанному значению'
  );
  lines.push(
    '  - { "$state": "/path", "gt/gte/lt/lte": <number> } - числовые сравнения'
  );
  lines.push(
    "Используй один оператор на одно условие (eq, neq, gt, gte, lt, lte). Не комбинируй несколько операторов в одном условии."
  );
  lines.push(
    'В любое условие можно добавить `"not": true` для инвертирования результата.'
  );
  lines.push("Комбинирование условий:");
  lines.push(
    "  - [<condition>, <condition>] - все условия должны быть true (неявно И)"
  );
  lines.push(
    '  - { "$and": [<condition>, <condition>] } - явное И (используй внутри `$or`)'
  );
  lines.push(
    '  - { "$or": [<condition>, <condition>] } - хотя бы одно условие должно быть true (OR)'
  );
  lines.push("  - `true` / `false` - всегда видим/скрыт");

  lines.push("");

  lines.push(
    "Используй компоненты с `on.press` с привязкой к действию setState чтобы обновлять стейт и управлять видимостью."
  );
  lines.push(
    'Пример: компонент с { "on": { "press": { "action": "setState", "params": { "statePath": "/activeTab", "value": "home" }}}} устанавливает стейт, затем другой компонент с { "visible": { "$state": "/activeTab", "eq": "home" }} показывается только когда таб выбран.'
  );
  lines.push(
    'Для паттернов типа "табы", когда первый таб или таб по умолчанию должен быть видим если никакой таб еще не был выбран, используй `$or` чтобы учесть оба кейса: { "$or": [{ "$state": "/activeTab", "eq": "home" }, { "$state": "/activeTab", "eq": "", "not": true }] }.'
  );

  lines.push("");

  lines.push("ДИНАМИЧЕСКИЕ СВОЙСТВА (ВЫРАЖЕНИЯ)");
  lines.push(
    "Значение любого свойства компонента может быть динамическим выражение которое резолвится в зависимости от стейта. Поддерживаются следующие выражения:"
  );
  lines.push(
    '1. Односторонняя привязка данных: { "$state": "/some/path" } - получает значение из стейта по указанному пути.'
  );
  lines.push('   Пример: { "color": { "$state": "/theme/primary" }}.');
  lines.push(
    '2. Двусторонняя привязка: { "$bindState": "/some/path" } - получает/записывает значение по указанному пути. Используй для свойств элементов формы (value, checked, etc.).'
  );
  lines.push('   Пример: { "value": { "$bindState": "/form/email" }}');
  lines.push(
    '3. Односторонняя привязка внутри динамических списков (поле `repeat`): { "$item": "/some/path" } - получает значение поля элемента массива.'
  );
  lines.push('   Пример: { "checked": { "$item": "/completed" }}');
  lines.push(
    '4. Двусторонняя привязка внутри динамических списков (поле `repeat`): { "$bindItem": "/some/path" } - получает/записывает значение поля элемента массива.'
  );
  lines.push('   Пример: { "checked": { "$bindItem": "/completed" }}');
  lines.push(
    '5. Шаблон: { "$template": "Hello, ${/some/path}" } - интерполирует значение в строку. Абсолютные пути типа `${/some/path}` получают значение из стейта. Относительные (bare) пути типа `${some/path}` (без начального слеша) получают значение из элемента массива (внутри repeat).'
  );
  lines.push('   Пример: { "label": { "$template": "Items: ${/cart/count}" }}');
  lines.push('   Пример: { "label": { "$template": "${likes} лайков" }}');

  lines.push(
    "Используй динамические свойства вместо дублирования элементов с противоположными условиями видимости, если отличается только значение свойства компонента."
  );
  lines.push(
    '6. Функция: { "$computed": "<functionName>", "args": { "key": <expression> }} - вызывает зарегистрированную функцию с зарезолвленными аргументами и возвращает результат.'
  );
  lines.push(
    '   Пример: { "$computed": "fullName", "args": { "first": { "$state": "/form/firstName" }, "last": { "$state": "/form/lastName" }}}'
  );
  if (functions.length > 0) {
    lines.push("   Доступные функции:");
    lines.push(...buildAvailableFunctions(functions).map((s) => `     ${s}`));
  }
  lines.push(
    "Всегда используй косую черту (slash) в state path (синтаксис RFC 6901 JSON Pointer). Никогда не используй Javascript дот нотацию."
  );
  lines.push("Разрешено: /todos/0/title");
  lines.push("Запрещено: /todos.0.title");

  lines.push("");

  lines.push("ВАЛИДАЦИЯ");
  lines.push(
    "Компоненты формы, имеющие свойство `checks` поддерживают клиентскую валидацию."
  );
  lines.push(
    'Каждая проверка это объект: { "type": "<name>", "message": "...", "args": { ... }}.'
  );
  lines.push("Встроенные типы валидации:");
  lines.push("  - required - значение должно быть не пустым");
  lines.push("  - email - значение должно быть валидным email");
  lines.push(
    '  - minLength - значение не должно быть меньше указанного минимума (аргументы: { "min": <number> })'
  );
  lines.push(
    '  - maxLength - значение не должно быть больше указанного максимум (аргументы: { "max": <number> })'
  );
  lines.push(
    '  - pattern - совпадает с регулярным выражением (аргументы: { "pattern": "regex" })'
  );
  lines.push('  - min - минимальное значение (аргументы: { "min": <number> })');
  lines.push(
    '  - max - максимальное значение (аргументы: { "max": <number> })'
  );
  lines.push("  - numeric - значение должно быть числом");
  lines.push("  - url - значение должно быть валидным URL");
  lines.push(
    '  - matches - значение должно быть равно значению стейта по указанному пути (аргументы: { "other": { "$state": "/path" }})'
  );
  lines.push(
    '  - lessThan - значение должно быть меньше значения стейта по указанному пути (аргументы: { "other": { "$state": "/path" }})'
  );
  lines.push(
    '  - greaterThan - значение должно быть больше значения стейта по указанному пути (args: { "other": { "$state": "/path" }})'
  );
  lines.push(
    '  - requiredIf - значение обязательно если значение стейта по указанному пути truthy (args: { "field": { "$state": "/path" }})'
  );
  lines.push(
    'Пример: { "checks": [{ "type": "required", "message": "Email is required" }, { "type": "email", "message": "Invalid email" }]}'
  );
  lines.push(
    "Когда используешь валидацию, компонент обязан также иметь { $bindState} или {$bindItem} в свойствах value или checked для двусторонней привязки."
  );
  lines.push("Всегда добавляй валидацию для элементов формы для хорошего UX.");

  lines.push("");

  lines.push("НАБЛЮДАТЕЛИ");
  lines.push(
    "Любой элемент может иметь опциональное верхнеуровневое поле `watch` для подписки на изменение стейта и запуска действий."
  );
  lines.push(
    "Когда значение стейта по указанному пути меняется, привязанное действие вызывается автоматически."
  );
  lines.push(
    "Пример (каскадный селект - изменение выбранной страны запускает действие по загрузке городов выбранной страны):"
  );
  lines.push(
    '{ "type": "Select", "props": { "value": { "$bindState": "/form/country" }, "options": ["US", "Canada", "Russia"], "watch": { "/form/country": { "action": "loadCities", "params": { "country": { "$state": "/form/country" }}}}}}'
  );
  lines.push(
    "Используй `watch` для каскадных зависимостей, когда изменение одного поля должно триггерить сайд-эффекты (загрузку данных, сброс зависимых полей, вычисление производных значений и так далее)."
  );
  lines.push(
    "Наблюдатели вызываются только при изменении значение, не при начальном рендере."
  );

  lines.push("");

  lines.push(...customRules);

  return lines.join("\n");
};

export const buildUserPrompt = (
  prompt: string,
  currentSpec: Spec,
  customRules: string[],
) => {
  const lines = [];

  lines.push("ТЕКУЩИЙ UI:");
  lines.push("```json");
  lines.push(JSON.stringify(currentSpec, null, 2));
  lines.push("```");

  lines.push("");

  lines.push("ЗАПРОС ПОЛЬЗОВАТЕЛЯ:");
  lines.push(prompt);

  lines.push("");

  lines.push(...customRules);

  return lines.join("\n");
};
