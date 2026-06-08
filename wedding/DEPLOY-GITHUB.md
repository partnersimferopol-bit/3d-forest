# Публикация на GitHub Pages

Сайт: [https://partnersimferopol-bit.github.io/wedding/](https://partnersimferopol-bit.github.io/wedding/)

## В чём была проблема

В репозитории [partnersimferopol-bit/wedding](https://github.com/partnersimferopol-bit/wedding) лежали только:

- `index.html`
- `admin.html`
- `OBbPI.jpg`
- `tz dly igri.docx`

Папок **`css/`**, **`js/`**, **`assets/`** не было. Поэтому стили и скрипты отдают **404**, и страница выглядит «голой» (все шаги видны сразу).

## Что должно быть в корне репозитория

```
wedding/          ← корень репозитория на GitHub
├── .nojekyll
├── index.html
├── admin.html
├── css/
│   ├── styles.css
│   └── admin.css
├── js/
│   ├── app.js
│   ├── data.js
│   ├── icons.js
│   ├── config-overrides.js
│   └── admin.js
└── assets/
    ├── bg-wood-leaves.png
    ├── images/
    │   ├── hero-cover.jpg
    │   └── results/     (result-1.jpg … result-20.jpg + .webp)
    └── icons/           (все PNG/WebP иконок)
```

## Как залить правильно (Git)

В папке проекта на компьютере (`igra`):

```bash
git init
git remote add origin https://github.com/partnersimferopol-bit/wedding.git
git add .
git commit -m "Полная версия игры: стили, скрипты, картинки"
git branch -M main
git push -u origin main
```

Если репозиторий уже есть и в нём старые файлы:

```bash
git pull origin main --allow-unrelated-histories
# разрешите конфликты, если появятся
git add .
git commit -m "Добавлены css, js, assets"
git push origin main
```

## Настройки GitHub Pages

1. Репозиторий **wedding** → **Settings** → **Pages**
2. **Source:** Deploy from a branch
3. **Branch:** `main`, папка **`/ (root)`**
4. Подождите 1–3 минуты и обновите сайт с **Ctrl+F5**

## Проверка после публикации

В браузере должны открываться (код **200**, не 404):

- `https://partnersimferopol-bit.github.io/wedding/css/styles.css`
- `https://partnersimferopol-bit.github.io/wedding/js/app.js`
- `https://partnersimferopol-bit.github.io/wedding/assets/images/hero-cover.jpg`

## Админка

`https://partnersimferopol-bit.github.io/wedding/admin.html`
