import { CONTENT_TYPE, TILE_SIZE } from "./constants";

const buildViewportRules = () => {
  const lines = [];

  lines.push("РАЗМЕРЫ КОНТЕНТОЙ ОБЛАСТИ");
  lines.push("Доступные размеры контентной области, внутри которой рендерится UI дерево:");
  lines.push(`- ${TILE_SIZE[0].id} [${TILE_SIZE[0].width}x${TILE_SIZE[0].height}] (${TILE_SIZE[0].description})`);
  lines.push("  Используй компактные компоненты (size: s или m)");
  lines.push("  Минимизируй количество элементов (не более 4-6 верхнеуровневых)");
  lines.push("  Для массивов используй Slider или Pagination");
  lines.push("  Избегай использования Stack и Grid с большим количеством элементов/колонок (не более 2)");
  lines.push(`- ${TILE_SIZE[1].id} [${TILE_SIZE[1].width}x${TILE_SIZE[1].height}] (${TILE_SIZE[1].description})`);
  lines.push("  Используй компактные компоненты (size: s или m)");
  lines.push("  Минимизируй количество элементов (не более 6-8 верхнеуровневых)");
  lines.push("  Избегай использования Stack и Grid с большим количеством элементов/колонок (не более 3-4)");
  lines.push(`- ${TILE_SIZE[2].id} [${TILE_SIZE[2].width}x${TILE_SIZE[2].height}] (${TILE_SIZE[2].description})`);
  lines.push("  Минимизируй количество элементов (не более 8-10 верхнеуровневых)");
  lines.push("  Избегай использования Stack и Grid с большим количеством элементов/колонок (не более 3-4)");
  lines.push(`- ${TILE_SIZE[0].id}-auto-height [${TILE_SIZE[0].width}xAuto] (${TILE_SIZE[0].description}, высота по содержимому)`);
  lines.push(`  Тот же лейаут, что и в ${TILE_SIZE[0].id}`);
  lines.push("  Можно использовать больше элементов (не более 6-8 верхнеуровневых)");
  lines.push("  Используй вертикальный лейаут (direction: column)");
  lines.push("  Избегай использования Grid с большим количеством колонок (не более 2)");
  lines.push(`- ${TILE_SIZE[1].id}-auto-height [${TILE_SIZE[1].width}xAuto] (${TILE_SIZE[1].description}, высота по содержимому)`);
  lines.push(`  Тот же лейаут, что и в ${TILE_SIZE[1].id}`);
  lines.push("  Можно использовать больше элементов (не более 8-10 верхнеуровневых)");
  lines.push("  Используй вертикальный лейаут (direction: column)");
  lines.push("  Избегай использования Grid с большим количеством колонок (не более 3-4)");
  lines.push(`- ${TILE_SIZE[2].id}-auto-height [${TILE_SIZE[2].width}xAuto] (${TILE_SIZE[2].description}, высота по содержимому)`);
  lines.push(`  Тот же лейаут, что и в ${TILE_SIZE[2].id}`);
  lines.push("  Можно использовать больше элементов (не более 10-12 верхнеуровневых)");
  lines.push("  Используй вертикальный лейаут (direction: column)");
  lines.push("  Избегай использования Grid с большим количеством колонок (не более 3-4)");
  lines.push(`- page (обычная страница, свободный размер)`);
  lines.push("  Можно использовать любые компоненты в любом количестве с любым уровнем вложенности");
  lines.push("  Добавляй отступы и воздух между секциями/группами элементов");
  lines.push("  Избегай использования Grid с большим количеством колонок (не более 3-4)");

  lines.push("Всегда учитывай текущий размер при выборе компонентов и лейаута.");

  return lines;
};

interface BuildCustomUserRulesContext {
  data: string;
  dom: string;
  openApi: string;
}

export const buildCustomSystemRules = () => {
  const lines = [];

  lines.push(...buildViewportRules());

  lines.push("");

  lines.push("ДОПОЛНИТЕЛЬНЫЕ ПРАВИЛА");
  lines.push("Никогда не используй Card как потомка View.");
  lines.push("Оборачивай каждый повторяющийся элемент в Card с border:true и shadow:false для визуального разделения и лучшего UI/UX. В качестве контейнера для таких элементов используй Stack или Grid.");
  lines.push("Придерживайся визуальной иерархии элементов — используй контейнеры (Card, Stack, Grid...) для группировки элементов по смыслу.");
  // "Предпочитай Stack со свойством `direction: column` всегда, когда это возможно.",
  lines.push("Никогда не используй Title в качестве первого вложенного элемента у root элемента.");
  lines.push("Семплы данных должны быть на русском языке.");
  lines.push("При выводе радио-кнопок в цикле, используй Stack с direction:column в качестве контейнера.");

  return lines;
};

export const buildCustomUserRules = (
  contentType: string,
  tileSize: string,
  autoHeight: boolean,
  context: BuildCustomUserRulesContext,
) => {
  const lines = [];
  const size = contentType === CONTENT_TYPE.PAGE
    ? "page"
    : `${tileSize}${autoHeight ? "-auto-height" : ""}`;

  lines.push(`ТЕКУЩИЙ РАЗМЕР КОНТЕНТНОЙ ОБЛАСТИ: ${size}`);

  lines.push("");

  if (context.data.length > 0) {
    lines.push("Используй следующие данные для заполнения стейта:");
    lines.push("```json");
    lines.push(context.data);
    lines.push("```");
  }

  if (context.dom.length > 0) {
    lines.push("Используй следующее DOM-дерево как образец верстки:");
    lines.push("```html");
    lines.push(context.dom);
    lines.push("```");
  }

  if (context.openApi.length > 0) {
    lines.push("Данные в стейте должны соответствовать спецификации OpenAPI:");
    lines.push("```json");
    lines.push(context.openApi);
    lines.push("```");
  }

  return lines;
};
