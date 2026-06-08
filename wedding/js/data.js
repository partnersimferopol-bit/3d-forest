/** Библиотека подарков и правила подбора — «Подарок из Будущего» */
const GIFTS = {
  1: {
    id: 1,
    title: 'Координаты нашего первого поцелуя',
    text: 'Через много лет он будет включать этот светильник и вспоминать тот самый момент, когда ваше сердце забилось в унисон. Каждый вечер — тёплый свет и ваша история, вырезанная в дереве навсегда.',
    products: ['Светильник с координатами', 'Панно «Наше место»', 'Ключница с датой'],
    icon: 'pin',
  },
  2: {
    id: 2,
    title: 'Капсула нашей любви',
    text: '10, 20, 50 лет спустя он будет держать в руках это панно и улыбаться, вспоминая, как сильно вы друг друга любите. Подарок, который не стареет вместе с чувствами.',
    products: ['Панно «Капсула времени»', 'Шкатулка с посланием', 'Двойное панно для пары'],
    icon: 'capsule',
  },
  3: {
    id: 3,
    title: 'Твой личный маяк',
    text: 'Для того, кто умеет смеяться даже в шторм. Этот подарок напомнит: ты — его ориентир, его свет в любом порту. Юмор и тепло — в одном деревянном сердце.',
    products: ['Светильник-маяк', 'Табличка с шутливой фразой', 'Держатель для ключей'],
    icon: 'lighthouse',
  },
  4: {
    id: 4,
    title: 'Карта нашего мира',
    text: 'Каждая поездка, каждый штамп в паспорте — на этой карте. Путешественник будет касаться дерева и снова чувствовать ветер тех дорог, что вы прошли вместе.',
    products: ['Карта мира на дереве', 'Панно с маршрутом', 'Магнитная карта путешествий'],
    icon: 'map',
  },
  5: {
    id: 5,
    title: 'Объятие в дереве',
    text: 'Когда слов мало, дерево говорит за вас. Мягкие линии, тёплый свет — как объятие, которое останется с ним, даже когда вас нет рядом.',
    products: ['Светильник «Объятие»', 'Панно с сердцем', 'Подставка для фото пары'],
    icon: 'hug',
  },
  6: {
    id: 6,
    title: 'Мой главный мужчина',
    text: 'В день рождения или просто так — напомни ему, что он твой герой. Персональная гравировка превратит дерево в трофей любви и уважения.',
    products: ['Именное панно', 'Бокал с гравировкой', 'Органайзер для мелочей'],
    icon: 'crown',
  },
  7: {
    id: 7,
    title: 'Свет твоей улыбки',
    text: 'Она засветит комнату — буквально. Светильник с её именем и вашими словами будет согревать каждый вечер, как её смех в вашей памяти.',
    products: ['Светильник с именем', 'Панно «Свет улыбки»', 'Ночник для спальни'],
    icon: 'lightbulb',
  },
  8: {
    id: 8,
    title: 'Цветок нашей любви',
    text: 'Романтика, которая не завянет. Нежные линии цветка в дереве — символ того, что ваша любовь цветёт снова и снова, год за годом.',
    products: ['Панно-цветок', 'Шкатулка для украшений', 'Подставка с датой'],
    icon: 'flower',
  },
  9: {
    id: 9,
    title: 'Письмо в будущее',
    text: 'Открой через год, через пять… Внутри — ваши слова сегодня. Дерево хранит послание так бережно, как вы храните друг друга.',
    products: ['Капсула времени из дерева', 'Свиток в рамке', 'Шкатулка с письмом'],
    icon: 'envelope',
  },
  10: {
    id: 10,
    title: 'Королева моего сердца',
    text: 'Она уже знает, что ты её королева. Но пусть дерево скажет это снова — на виду, каждый день, с золотым теплом гравировки.',
    products: ['Коронное панно', 'Зеркало с надписью', 'Поднос с титулом'],
    icon: 'gem',
  },
  11: {
    id: 11,
    title: 'Лучшая мама на свете',
    text: 'Мама плачет только от гордости — и от таких подарков. Ваши слова в дереве останутся с ней, когда дети вырастут и уедут далеко.',
    products: ['Панно для мамы', 'Фото-рамка с гравировкой', 'Подставка «Лучшая мама»'],
    icon: 'flower',
  },
  12: {
    id: 12,
    title: 'Мамины объятия',
    text: 'Тёплое дерево, мягкий свет — как её объятия в детстве. Подарок, к которому она будет прикасаться в трудные минуты и улыбаться.',
    products: ['Светильник «Объятия»', 'Панно с сердцем', 'Ключница с именем'],
    icon: 'hug',
  },
  13: {
    id: 13,
    title: 'Дерево благодарности',
    text: 'Каждая веточка — год вашей любви к ней. Подарок-благодарность за всё: за тепло, за советы, за то, что она просто есть.',
    products: ['Семейное дерево на панно', 'Доска благодарности', 'Планшет с фамилиями'],
    icon: 'treeFamily',
  },
  15: {
    id: 15,
    title: 'Моя маленькая принцесса',
    text: 'Она вырастет, но этот подарок останется. С её именем и датой рождения — напоминание, что она всегда будет твоей маленькой принцессой.',
    products: ['Именное панно', 'Ночник в детскую', 'Ростомер из дерева'],
    icon: 'girl',
  },
  16: {
    id: 16,
    title: 'Маленький герой',
    text: 'Смелый, быстрый, любопытный — твой сын заслуживает медаль из дерева. Подарок, который скажет: «Я горжусь тобой» без лишних слов.',
    products: ['Медальон-герой', 'Именная табличка', 'Органайзер для сокровищ'],
    icon: 'medal',
  },
  17: {
    id: 17,
    title: 'Семейное дерево',
    text: 'Корни — предки, ветви — дети, листья — новые имена. Семейное дерево из 3Д-лес растёт вместе с вашим родом.',
    products: ['Панно «Семейное дерево»', 'Доска с фамилиями', 'Многоуровневое панно'],
    icon: 'family',
  },
  18: {
    id: 18,
    title: 'Звезда по имени',
    text: 'На небе миллионы звёзд, но эта — только его или её. Имя в дереве светится мягким светом и согревает каждую ночь.',
    products: ['Звёздный светильник', 'Панно со звездой', 'Ночник с именем'],
    icon: 'star',
  },
  19: {
    id: 19,
    title: 'Память, которая греет',
    text: 'Универсальный подарок с душой: ваши слова, даты и места в тёплом дереве. Через годы он будет греть руки и сердце — как ваше присутствие.',
    products: ['Персональное панно', 'Светильник с гравировкой', 'Шкатулка воспоминаний'],
    icon: 'candle',
  },
  20: {
    id: 20,
    title: 'Наша история в дереве',
    text: 'Каждая царапина на дереве — ваш эпизод: смех, слёзы, победы. Подарок для той, с кем связана целая глава жизни.',
    products: ['Панно «Наша история»', 'Лента воспоминаний', 'Фото-коллаж в дереве'],
    icon: 'book',
  },
};

const RESULT_IMAGE_BASE = 'assets/images/results/result-';

/** ID подарка (1–20) → пути к изображению результата */
const RESULT_IMAGES = Object.fromEntries(
  Array.from({ length: 20 }, (_, i) => {
    const id = i + 1;
    const base = `${RESULT_IMAGE_BASE}${id}`;
    return [
      id,
      {
        id,
        jpg: `${base}.jpg`,
        webp: `${base}.webp`,
      },
    ];
  })
);

function getResultImagePaths(giftId) {
  const id = giftId >= 1 && giftId <= 20 ? giftId : 19;
  const paths = RESULT_IMAGES[id] || RESULT_IMAGES[19];
  const gift = GIFTS[id] || GIFTS[19];
  return {
    ...paths,
    alt: `Подарок «${gift.title}» — 3Д-лес`,
  };
}

/** Правила: первое совпадение сверху вниз */
const MATCH_RULES = [
  { giftId: 6, recipient: 'partner_m', occasion: ['anniversary', 'birthday', 'valentine', 'just_love', 'other'], traits: null },
  { giftId: 2, recipient: 'partner_m', occasion: ['anniversary'] },
  { giftId: 5, recipient: 'partner_m', occasion: ['just_love'], traits: ['romantic'] },
  { giftId: 4, recipient: 'partner_m', traits: ['traveler'] },
  { giftId: 3, recipient: 'partner_m', traits: ['humor'] },
  { giftId: 1, recipient: 'partner_m', traits: ['romantic'] },
  { giftId: 7, recipient: 'partner_f', occasion: ['anniversary'] },
  { giftId: 8, recipient: 'partner_f', occasion: ['birthday', 'valentine'], traits: ['romantic'] },
  { giftId: 10, recipient: 'partner_f' },
  { giftId: 9, recipient: 'partner_f' },
  { giftId: 11, recipient: 'mom', occasion: ['birthday', 'march8'] },
  { giftId: 12, recipient: 'mom' },
  { giftId: 13, recipient: 'mom' },
  { giftId: 15, recipient: 'daughter', occasion: ['birthday'] },
  { giftId: 16, recipient: 'son', occasion: ['birthday'], traits: ['sporty'] },
  { giftId: 18, recipient: ['daughter', 'son'], occasion: null },
  { giftId: 17, recipient: ['mom', 'dad'], traits: ['family'] },
  { giftId: 20, recipient: 'friend_f', occasion: ['birthday'], traits: ['creative'] },
  { giftId: 19 },
];

const RECIPIENTS = [
  { id: 'partner_m', label: 'Парню / Мужу', icon: 'icon-heart' },
  { id: 'partner_f', label: 'Девушке / Жене', icon: 'icon-heart' },
  { id: 'mom', label: 'Маме', icon: 'icon-heart' },
  { id: 'dad', label: 'Папе', icon: 'icon-5-details' },
  { id: 'daughter', label: 'Дочке', icon: 'icon-person' },
  { id: 'son', label: 'Сыну', icon: 'icon-person' },
  { id: 'friend_f', label: 'Подруге', icon: 'icon-character' },
  { id: 'friend_m', label: 'Другу', icon: 'icon-share' },
  { id: 'self', label: 'Себе', icon: 'icon-gift' },
  { id: 'other', label: 'Другому человеку', icon: 'icon-person', hasInput: true },
];

const TRAITS = [
  { id: 'romantic', label: 'Романтик и мечтатель', icon: 'icon-heart' },
  { id: 'humor', label: 'Душа компании и юморист', icon: 'icon-character' },
  { id: 'traveler', label: 'Путешественник и авантюрист', icon: 'icon-share' },
  { id: 'family', label: 'Заботливый и семейный', icon: 'icon-gift' },
  { id: 'creative', label: 'Творческая личность', icon: 'icon-creative' },
  { id: 'reliable', label: 'Надёжный и серьёзный', icon: 'icon-check' },
  { id: 'gentle', label: 'Нежный и чувствительный', icon: 'icon-heart' },
  { id: 'sporty', label: 'Активный и спортивный', icon: 'icon-share' },
  { id: 'cozy', label: 'Любитель уюта и дома', icon: 'icon-gift' },
  { id: 'intellectual', label: 'Интеллектуал и философ', icon: 'icon-message' },
];

const OCCASIONS = [
  { id: 'birthday', label: 'День рождения', icon: 'icon-gift' },
  { id: 'anniversary', label: 'Годовщина отношений / свадьбы', icon: 'icon-heart' },
  { id: 'march8', label: '8 Марта / 23 Февраля', icon: 'icon-heart' },
  { id: 'newyear', label: 'Новый год / Рождество', icon: 'icon-3-occasion' },
  { id: 'baby', label: 'Рождение ребёнка', icon: 'icon-person' },
  { id: 'valentine', label: 'День Святого Валентина', icon: 'icon-heart' },
  { id: 'just_love', label: 'Просто «потому что люблю тебя»', icon: 'icon-4-message' },
  { id: 'other', label: 'Другая важная дата', icon: 'icon-calendar', hasInput: true },
];

const STYLES = [
  { id: 'tender', label: 'Нежный минимализм', icon: 'icon-heart' },
  { id: 'vintage', label: 'Тёплый винтаж', icon: 'icon-5-details' },
  { id: 'fairy', label: 'Сказочная атмосфера', icon: 'icon-character' },
  { id: 'eco', label: 'Эко-стиль', icon: 'icon-6-style' },
  { id: 'modern', label: 'Современный минимализм', icon: 'icon-check' },
  { id: 'romantic', label: 'Романтическая классика', icon: 'icon-heart' },
];

const WORD_HINTS = [
  'Спасибо, что ты есть',
  'Каждый день с тобой — чудо',
  'Ты — моё самое большое счастье',
];

/** Тексты интерфейса (редактируются в admin.html) */
const UI_TEXT = {
  introButton: 'Создать подарок из будущего',
  loading: 'Мастер из будущего создаёт твой подарок…',
  loadingPersonal: 'Мастер переносит ваши слова и детали на дерево…',
  productsTitle: 'Идеи от 3Д-лес',
  productsHint: 'Выберите, что хотите заказать — нажмите на вариант',
  leadTitle: 'Отправить мастеру в 3Д-лес',
  leadSuccess: 'Спасибо! Мастер свяжется с вами. Заявка сохранена.',
  q4Note:
    'Ваш текст сохранится и появится в результате. На картинке — образец подарка: мастер 3Д-лес нанесёт ваши слова на дерево при заказе.',
  q5Note:
    'Имя, дата и фраза тоже сохранятся — вы увидите их в финале и передадите мастеру вместе с заявкой.',
  sampleNote:
    'Ниже — визуальный образец подарка. Ваши слова и детали мастер перенесёт на дерево вручную — они указаны под фото.',
  personalTitle: 'Ваши слова и детали для мастера',
  personalWordsLabel: 'Ваши слова',
  personalNameLabel: 'Имя',
  personalDateLabel: 'Важная дата',
  personalPhraseLabel: 'Фраза / цитата',
};

/** Юридические ссылки (редактируются в admin.html) */
const LEGAL_LINKS = {
  offerUrl: 'oferta.html',
  privacyUrl: 'privacy.html',
  offerLabel: 'Публичная оферта',
  privacyLabel: 'Политика конфиденциальности',
  consentOffer: 'публичной оферты',
  consentPrivacy: 'политикой конфиденциальности',
};
