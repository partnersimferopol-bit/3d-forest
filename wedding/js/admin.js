(function () {
  const STORAGE_KEY = 'gift_future_content';
  const API_SETTINGS_KEY = 'gift_admin_api_settings';
  const LEADS_LOCAL_KEY = 'gift_future_leads';
  const $ = (sel) => document.querySelector(sel);
  const toast = $('#toast');

  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3200);
  }

  function giftIds() {
    return Object.keys(GIFTS)
      .map(Number)
      .filter((n) => !Number.isNaN(n))
      .sort((a, b) => a - b);
  }

  function readGiftForm() {
    const id = Number($('#gift-select').value);
    return {
      id,
      title: $('#gift-title').value.trim(),
      text: $('#gift-text').value.trim(),
      products: $('#gift-products')
        .value.split('\n')
        .map((s) => s.trim())
        .filter(Boolean),
      icon: (GIFTS[id] && GIFTS[id].icon) || 'gift',
    };
  }

  function writeGiftForm(id) {
    const g = GIFTS[id] || GIFTS[19];
    $('#gift-title').value = g.title || '';
    $('#gift-text').value = g.text || '';
    $('#gift-products').value = (g.products || []).join('\n');
  }

  function initGiftSelect() {
    const sel = $('#gift-select');
    sel.innerHTML = giftIds()
      .map((id) => `<option value="${id}">${id}. ${escapeHtml(GIFTS[id].title)}</option>`)
      .join('');
    sel.addEventListener('change', () => {
      const prev = Number(sel.dataset.current);
      if (prev) persistGiftToMemory(prev);
      const id = Number(sel.value);
      sel.dataset.current = String(id);
      writeGiftForm(id);
    });
    const first = giftIds()[0] || 19;
    sel.value = String(first);
    sel.dataset.current = String(first);
    writeGiftForm(first);
  }

  function persistGiftToMemory(id) {
    const patch = readGiftForm();
    if (!GIFTS[id]) GIFTS[id] = { id };
    Object.assign(GIFTS[id], patch);
  }

  function readRulesJson() {
    return JSON.parse($('#rules-json').value);
  }

  function readListTable(key) {
    const rows = document.querySelectorAll(`#table-${key} tbody tr`);
    return Array.from(rows).map((tr) => {
      const id = tr.querySelector('[data-f="id"]').value.trim();
      const label = tr.querySelector('[data-f="label"]').value.trim();
      const icon = tr.querySelector('[data-f="icon"]')?.value.trim() || 'icon-gift';
      const hasInput = tr.querySelector('[data-f="hasInput"]')?.checked;
      const item = { id, label, icon };
      if (hasInput) item.hasInput = true;
      return item;
    }).filter((r) => r.id && r.label);
  }

  function writeListTable(key, arr) {
    const host = $(`#table-${key}`);
    host.innerHTML = `
      <table class="admin-table">
        <thead><tr>
          <th>id</th><th>Текст</th><th>icon</th>${key === 'recipients' || key === 'occasions' ? '<th>свой ввод</th>' : ''}<th></th>
        </tr></thead>
        <tbody>${arr.map((row) => listRowHtml(key, row)).join('')}</tbody>
      </table>`;
    host.querySelectorAll('[data-remove]').forEach((btn) => {
      btn.addEventListener('click', () => btn.closest('tr').remove());
    });
  }

  function listRowHtml(key, row) {
    const extraCol = key === 'recipients' || key === 'occasions';
    return `<tr>
      <td><input data-f="id" value="${escapeAttr(row.id)}"></td>
      <td><input data-f="label" value="${escapeAttr(row.label)}"></td>
      <td><input data-f="icon" value="${escapeAttr(row.icon || 'icon-gift')}"></td>
      ${extraCol ? `<td><input type="checkbox" data-f="hasInput" ${row.hasInput ? 'checked' : ''}></td>` : ''}
      <td><button type="button" data-remove class="btn-outline">×</button></td>
    </tr>`;
  }

  function escapeAttr(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/</g, '&lt;');
  }

  function escapeHtml(s) {
    return escapeAttr(s);
  }

  function addListRow(key) {
    const tbody = $(`#table-${key} tbody`);
    const row = { id: 'new_id', label: 'Новый вариант', icon: 'icon-gift' };
    tbody.insertAdjacentHTML('beforeend', listRowHtml(key, row));
    tbody.querySelectorAll('[data-remove]').forEach((btn) => {
      btn.addEventListener('click', () => btn.closest('tr').remove());
    });
  }

  function readUiForm() {
    return {
      introButton: $('#ui-intro').value.trim(),
      loading: $('#ui-loading').value.trim(),
      productsTitle: $('#ui-products').value.trim(),
      leadTitle: $('#ui-lead').value.trim(),
      leadSuccess: $('#ui-success').value.trim(),
    };
  }

  function writeUiForm() {
    const u = typeof UI_TEXT !== 'undefined' ? UI_TEXT : {};
    $('#ui-intro').value = u.introButton || '';
    $('#ui-loading').value = u.loading || '';
    $('#ui-products').value = u.productsTitle || '';
    $('#ui-lead').value = u.leadTitle || '';
    $('#ui-success').value = u.leadSuccess || '';
    $('#ui-hints').value = (WORD_HINTS || []).join('\n');
  }

  function collectAllFromForms() {
    const giftSel = $('#gift-select');
    const currentGift = Number(giftSel.value);
    if (currentGift) persistGiftToMemory(currentGift);

    let rules;
    try {
      rules = readRulesJson();
      if (!Array.isArray(rules)) throw new Error('not array');
    } catch {
      throw new Error('Проверьте JSON в правилах подбора');
    }

    const ui = readUiForm();
    const hints = $('#ui-hints')
      .value.split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    return {
      GIFTS: JSON.parse(JSON.stringify(GIFTS)),
      MATCH_RULES: rules,
      RECIPIENTS: readListTable('recipients'),
      TRAITS: readListTable('traits'),
      OCCASIONS: readListTable('occasions'),
      STYLES: readListTable('styles'),
      WORD_HINTS: hints,
      UI_TEXT: ui,
    };
  }

  function applyToGlobals(data) {
    Object.entries(data.GIFTS || {}).forEach(([id, patch]) => {
      const num = Number(id);
      if (GIFTS[num]) Object.assign(GIFTS[num], patch);
      else GIFTS[num] = patch;
    });
    if (data.MATCH_RULES) MATCH_RULES.splice(0, MATCH_RULES.length, ...data.MATCH_RULES);
    if (data.RECIPIENTS) RECIPIENTS.splice(0, RECIPIENTS.length, ...data.RECIPIENTS);
    if (data.TRAITS) TRAITS.splice(0, TRAITS.length, ...data.TRAITS);
    if (data.OCCASIONS) OCCASIONS.splice(0, OCCASIONS.length, ...data.OCCASIONS);
    if (data.STYLES) STYLES.splice(0, STYLES.length, ...data.STYLES);
    if (data.WORD_HINTS) WORD_HINTS.splice(0, WORD_HINTS.length, ...data.WORD_HINTS);
    if (data.UI_TEXT) Object.assign(UI_TEXT, data.UI_TEXT);
  }

  function jsString(s) {
    return JSON.stringify(s);
  }

  function serializeGifts(gifts) {
    const ids = Object.keys(gifts)
      .map(Number)
      .filter((n) => !Number.isNaN(n))
      .sort((a, b) => a - b);
    return ids
      .map((id) => {
        const g = gifts[id];
        const products = (g.products || []).map((p) => jsString(p)).join(', ');
        return `  ${id}: {
    id: ${id},
    title: ${jsString(g.title)},
    text: ${jsString(g.text)},
    products: [${products}],
    icon: ${jsString(g.icon || 'gift')},
  }`;
      })
      .join(',\n');
  }

  function serializeArray(name, arr, indent = 0) {
    const pad = '  '.repeat(indent);
    const inner = arr
      .map((item) => {
        const parts = [`id: ${jsString(item.id)}`, `label: ${jsString(item.label)}`, `icon: ${jsString(item.icon || 'icon-gift')}`];
        if (item.hasInput) parts.push('hasInput: true');
        return `${pad}  { ${parts.join(', ')} }`;
      })
      .join(`,\n`);
    return `${name} = [\n${inner}\n${pad}];`;
  }

  function buildDataJsContent(data) {
    return `/** Библиотека подарков и правила подбора — «Подарок из Будущего» */
const GIFTS = {
${serializeGifts(data.GIFTS)},
};

const RESULT_IMAGE_BASE = 'assets/images/results/result-';

/** ID подарка (1–20) → пути к изображению результата */
const RESULT_IMAGES = Object.fromEntries(
  Array.from({ length: 20 }, (_, i) => {
    const id = i + 1;
    const base = \`\${RESULT_IMAGE_BASE}\${id}\`;
    return [
      id,
      {
        id,
        jpg: \`\${base}.jpg\`,
        webp: \`\${base}.webp\`,
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
    alt: \`Подарок «\${gift.title}» — 3Д-лес\`,
  };
}

/** Правила: первое совпадение сверху вниз */
const MATCH_RULES = ${JSON.stringify(data.MATCH_RULES, null, 2)};

${serializeArray('const RECIPIENTS', data.RECIPIENTS)}

${serializeArray('const TRAITS', data.TRAITS)}

${serializeArray('const OCCASIONS', data.OCCASIONS)}

${serializeArray('const STYLES', data.STYLES)}

const WORD_HINTS = ${JSON.stringify(data.WORD_HINTS, null, 2)};

/** Тексты интерфейса (редактируются в admin.html) */
const UI_TEXT = ${JSON.stringify(data.UI_TEXT, null, 2)};
`;
  }

  function downloadFile(filename, content, mime) {
    const blob = new Blob([content], { type: mime });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  function getApiSettings() {
    try {
      const stored = JSON.parse(localStorage.getItem(API_SETTINGS_KEY) || '{}');
      const cfg = typeof LEADS_API !== 'undefined' ? LEADS_API : {};
      return {
        baseUrl: (stored.baseUrl || cfg.baseUrl || '').trim().replace(/\/$/, ''),
        adminSecret: stored.adminSecret || cfg.adminSecret || '',
      };
    } catch {
      return { baseUrl: '', adminSecret: '' };
    }
  }

  function saveApiSettingsToForm() {
    const s = getApiSettings();
    const urlEl = $('#leads-api-url');
    const secretEl = $('#leads-api-secret');
    if (urlEl) urlEl.value = s.baseUrl;
    if (secretEl) secretEl.value = s.adminSecret;
  }

  function renderLeadsList(leads, sourceNote) {
    const list = $('#leads-list');
    if (!leads.length) {
      list.innerHTML = `<li>Заявок пока нет. ${escapeHtml(sourceNote || '')}</li>`;
      return;
    }
    list.innerHTML = leads
      .map(
        (l) => `<li>
          <time>${escapeHtml(l.at || '')}</time><br>
          <strong>${escapeHtml(l.name || '')}</strong> — ${escapeHtml(l.contact || '')}<br>
          Подарок: ${escapeHtml(l.giftTitle || '')}<br>
          ${l.selectedProduct ? `Заказ: <strong>${escapeHtml(l.selectedProduct)}</strong><br>` : ''}
          ${l.comment ? `Комментарий: ${escapeHtml(l.comment)}` : ''}
        </li>`
      )
      .join('');
  }

  async function fetchLeadsFromApi() {
    const { baseUrl, adminSecret } = getApiSettings();
    if (!baseUrl) return null;
    const url = `${baseUrl}/leads${adminSecret ? `?key=${encodeURIComponent(adminSecret)}` : ''}`;
    const headers = adminSecret ? { Authorization: `Bearer ${adminSecret}` } : {};
    const res = await fetch(url, { headers });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || `Ошибка ${res.status}`);
    return data.leads || [];
  }

  function loadLeadsLocally() {
    try {
      return JSON.parse(localStorage.getItem(LEADS_LOCAL_KEY) || '[]');
    } catch {
      return [];
    }
  }

  async function refreshLeads() {
    try {
      const remote = await fetchLeadsFromApi();
      if (remote) {
        renderLeadsList(remote, 'Источник: сервер (все заявки с сайта).');
        showToast(`Загружено заявок: ${remote.length}`);
        return;
      }
    } catch (err) {
      console.warn(err);
      showToast('API: ' + (err.message || err));
    }
    const local = loadLeadsLocally().slice().reverse();
    renderLeadsList(local, 'Только этот браузер. Настройте URL API в DEPLOY-VK.md');
  }

  const $$ = (sel) => document.querySelectorAll(sel);

  function initTabs() {
    $('#admin-nav').addEventListener('click', (e) => {
      const btn = e.target.closest('button[data-tab]');
      if (!btn) return;
      const tab = btn.dataset.tab;
      $$('#admin-nav button').forEach((b) => b.classList.toggle('active', b === btn));
      $$('.admin-panel').forEach((p) => p.classList.toggle('active', p.id === `panel-${tab}`));
    });
  }

  function loadFormsFromGlobals() {
    $('#rules-json').value = JSON.stringify(MATCH_RULES, null, 2);
    writeListTable('recipients', [...RECIPIENTS]);
    writeListTable('traits', [...TRAITS]);
    writeListTable('occasions', [...OCCASIONS]);
    writeListTable('styles', [...STYLES]);
    writeUiForm();
    initGiftSelect();
  }

  function tryLoadStoredOverrides() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      applyToGlobals(JSON.parse(raw));
    } catch {
      /* ignore */
    }
  }

  $('#btn-apply').addEventListener('click', () => {
    try {
      const data = collectAllFromForms();
      applyToGlobals(data);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      showToast('Сохранено. Откройте index.html — изменения уже действуют.');
    } catch (err) {
      alert(err.message || String(err));
    }
  });

  $('#btn-download-js').addEventListener('click', () => {
    try {
      const data = collectAllFromForms();
      downloadFile('data.js', buildDataJsContent(data), 'text/javascript;charset=utf-8');
      showToast('Файл data.js скачан — замените им js/data.js в проекте.');
    } catch (err) {
      alert(err.message || String(err));
    }
  });

  $('#btn-download-json').addEventListener('click', () => {
    try {
      const data = collectAllFromForms();
      downloadFile('gift-future-backup.json', JSON.stringify(data, null, 2), 'application/json');
      showToast('Резервная копия скачана.');
    } catch (err) {
      alert(err.message || String(err));
    }
  });

  $('#btn-import').addEventListener('click', () => $('#import-file').click());

  $('#import-file').addEventListener('change', async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      applyToGlobals(data);
      loadFormsFromGlobals();
      showToast('JSON загружен в форму. Нажмите «Применить» или скачайте data.js.');
    } catch (err) {
      alert('Не удалось прочитать JSON: ' + (err.message || err));
    }
    e.target.value = '';
  });

  $('#btn-reset').addEventListener('click', () => {
    if (!confirm('Удалить сохранённые правки на этом компьютере?')) return;
    localStorage.removeItem(STORAGE_KEY);
    location.reload();
  });

  document.querySelectorAll('[data-add]').forEach((btn) => {
    btn.addEventListener('click', () => addListRow(btn.dataset.add));
  });

  $('#btn-save-api-settings').addEventListener('click', () => {
    const baseUrl = $('#leads-api-url')?.value.trim().replace(/\/$/, '') || '';
    const adminSecret = $('#leads-api-secret')?.value.trim() || '';
    localStorage.setItem(API_SETTINGS_KEY, JSON.stringify({ baseUrl, adminSecret }));
    localStorage.setItem('gift_leads_api_url', baseUrl);
    showToast('Настройки API сохранены в этом браузере.');
  });

  $('#btn-refresh-leads').addEventListener('click', () => refreshLeads());
  $('#btn-export-leads').addEventListener('click', async () => {
    try {
      const remote = await fetchLeadsFromApi();
      if (remote) {
        downloadFile('leads-export.json', JSON.stringify(remote, null, 2), 'application/json');
        return;
      }
    } catch {
      /* fallback local */
    }
    const raw = localStorage.getItem(LEADS_LOCAL_KEY) || '[]';
    downloadFile('leads-export.json', raw, 'application/json');
  });

  ['gift-title', 'gift-text', 'gift-products'].forEach((id) => {
    document.getElementById(id)?.addEventListener('blur', () => {
      const sel = $('#gift-select');
      const idNum = Number(sel.value);
      if (idNum) persistGiftToMemory(idNum);
      const opt = sel.querySelector(`option[value="${idNum}"]`);
      if (opt) opt.textContent = `${idNum}. ${$('#gift-title').value.trim() || GIFTS[idNum].title}`;
    });
  });

  initTabs();
  tryLoadStoredOverrides();
  loadFormsFromGlobals();
  saveApiSettingsToForm();
  refreshLeads();
})();
