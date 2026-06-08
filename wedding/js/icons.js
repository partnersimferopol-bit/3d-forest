/** Файловые иконки — «Подарок из Будущего» (дерево + золото) */
const ICON_BASE = 'assets/icons/';

const ICON_SIZES = {
  card: 48,
  step: 40,
  btn: 28,
  hero: 96,
  wide: 200,
  progress: 320,
};

/** Ключ → { file, alt } */
const ICON_REGISTRY = {
  'btn-next': { file: 'btn-next', alt: 'Перейти далее' },
  'btn-back': { file: 'btn-back', alt: 'Вернуться назад' },
  'icon-share': { file: 'icon-share', alt: 'Поделиться' },
  'icon-heart': { file: 'icon-heart', alt: 'Любовь' },
  'icon-gift': { file: 'icon-gift', alt: 'Подарок' },
  'icon-check': { file: 'icon-check', alt: 'Готово' },
  'progress-bar': { file: 'progress-bar', alt: 'Прогресс прохождения игры' },

  'icon-1-person': { file: 'icon-1-person', alt: 'Кому дарите подарок' },
  'icon-2-character': { file: 'icon-2-character', alt: 'Характер человека' },
  'icon-3-occasion': { file: 'icon-3-occasion', alt: 'Повод для подарка' },
  'icon-4-message': { file: 'icon-4-message', alt: 'Слова для подарка' },
  'icon-5-details': { file: 'icon-5-details', alt: 'Важные детали' },
  'icon-6-style': { file: 'icon-6-style', alt: 'Стиль подарка' },

  'icon-person': { file: 'icon-person', alt: 'Человек' },
  'icon-calendar': { file: 'icon-calendar', alt: 'Календарь и дата' },
  'icon-message': { file: 'icon-message', alt: 'Послание' },
  'icon-details': { file: 'icon-details', alt: 'Именная бирка с деталями' },
  'icon-style': { file: 'icon-style', alt: 'Творческий стиль' },
  'icon-character': { file: 'icon-character', alt: 'Характер' },
  'icon-creative': { file: 'icon-creative', alt: 'Творчество' },
  'icon-restart': { file: 'icon-restart', alt: 'Создать ещё один подарок' },
};

const STEP_ICONS = {
  1: 'icon-1-person',
  2: 'icon-2-character',
  3: 'icon-3-occasion',
  4: 'icon-4-message',
  5: 'icon-5-details',
  6: 'icon-6-style',
};

const GIFT_ICONS = {
  1: 'icon-details',
  2: 'icon-heart',
  3: 'icon-gift',
  4: 'icon-share',
  5: 'icon-heart',
  6: 'icon-check',
  7: 'icon-gift',
  8: 'icon-heart',
  9: 'icon-4-message',
  10: 'icon-heart',
  11: 'icon-heart',
  12: 'icon-heart',
  13: 'icon-6-style',
  15: 'icon-person',
  16: 'icon-check',
  17: 'icon-person',
  18: 'icon-character',
  19: 'icon-gift',
  20: 'icon-4-message',
};

function getIconMeta(name) {
  return ICON_REGISTRY[name] || ICON_REGISTRY['icon-gift'];
}

function renderIcon(name, size = 'card') {
  const meta = getIconMeta(name);
  const px = ICON_SIZES[size] || ICON_SIZES.card;
  const base = `${ICON_BASE}${meta.file}`;
  const alt = meta.alt.replace(/"/g, '&quot;');
  return `<picture class="icon-picture icon-picture--${size}">
    <source type="image/webp" srcset="${base}.webp" />
    <img
      class="game-icon game-icon--${size}"
      src="${base}.png"
      alt="${alt}"
      width="${px}"
      height="${px}"
      loading="lazy"
      decoding="async"
    />
  </picture>`;
}

function renderStepIcon(step) {
  return renderIcon(STEP_ICONS[step] || 'icon-gift', 'step');
}

function getProgressBarSrc() {
  const meta = ICON_REGISTRY['progress-bar'];
  return {
    webp: `${ICON_BASE}${meta.file}.webp`,
    png: `${ICON_BASE}${meta.file}.png`,
    alt: meta.alt,
  };
}
