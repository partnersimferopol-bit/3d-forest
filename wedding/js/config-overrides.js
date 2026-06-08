/** Подставляет правки из админки (localStorage), если они сохранены */
(function applyContentOverrides() {
  const KEY = 'gift_future_content';
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return;
    const data = JSON.parse(raw);

    if (data.GIFTS) {
      Object.entries(data.GIFTS).forEach(([id, patch]) => {
        const num = Number(id);
        if (GIFTS[num]) Object.assign(GIFTS[num], patch);
        else GIFTS[num] = patch;
      });
    }

    if (Array.isArray(data.MATCH_RULES)) {
      MATCH_RULES.splice(0, MATCH_RULES.length, ...data.MATCH_RULES);
    }
    if (Array.isArray(data.RECIPIENTS)) {
      RECIPIENTS.splice(0, RECIPIENTS.length, ...data.RECIPIENTS);
    }
    if (Array.isArray(data.TRAITS)) {
      TRAITS.splice(0, TRAITS.length, ...data.TRAITS);
    }
    if (Array.isArray(data.OCCASIONS)) {
      OCCASIONS.splice(0, OCCASIONS.length, ...data.OCCASIONS);
    }
    if (Array.isArray(data.STYLES)) {
      STYLES.splice(0, STYLES.length, ...data.STYLES);
    }
    if (Array.isArray(data.WORD_HINTS) && typeof WORD_HINTS !== 'undefined') {
      WORD_HINTS.splice(0, WORD_HINTS.length, ...data.WORD_HINTS);
    }
    if (data.UI_TEXT && typeof UI_TEXT !== 'undefined') {
      Object.assign(UI_TEXT, data.UI_TEXT);
    }
  } catch (err) {
    console.warn('Не удалось применить сохранённые правки:', err);
  }
})();
