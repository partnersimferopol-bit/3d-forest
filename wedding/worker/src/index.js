/**
 * Cloudflare Worker: заявки + уведомление в сообщения сообщества ВК
 * Переменные: VK_GROUP_TOKEN, VK_NOTIFY_PEER_ID, ADMIN_SECRET, LEADS (KV)
 */

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json; charset=utf-8' },
  });
}

function formatLeadMessage(lead) {
  const lines = [
    '🎁 Новая заявка «Подарок из Будущего»',
    '',
    `👤 Имя: ${lead.name || '—'}`,
    `📱 Контакт: ${lead.contact || '—'}`,
    `🎯 Подарок: ${lead.giftTitle || '—'}`,
    `📦 Заказ: ${lead.selectedProduct || '—'}`,
  ];
  if (lead.comment) lines.push(`💬 Комментарий: ${lead.comment}`);
  const words = lead.answers?.words?.trim();
  if (words) lines.push(`✍️ Слова: ${words}`);
  const d = lead.answers?.details || {};
  if (d.name) lines.push(`Имя в подарке: ${d.name}`);
  if (d.date) lines.push(`Дата: ${d.date}`);
  if (d.phrase) lines.push(`Фраза: ${d.phrase}`);
  lines.push('', `🕐 ${lead.at || new Date().toISOString()}`);
  return lines.join('\n');
}

async function sendVkCommunityMessage(env, text) {
  if (!env.VK_GROUP_TOKEN || !env.VK_NOTIFY_PEER_ID) {
    return { skipped: true, reason: 'VK not configured' };
  }

  const body = new URLSearchParams({
    access_token: env.VK_GROUP_TOKEN,
    v: '5.199',
    peer_id: String(env.VK_NOTIFY_PEER_ID),
    random_id: String(Math.floor(Math.random() * 2147483647)),
    message: text,
  });

  const res = await fetch('https://api.vk.com/method/messages.send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });

  const data = await res.json();
  if (data.error) {
    throw new Error(data.error.error_msg || JSON.stringify(data.error));
  }
  return { ok: true, message_id: data.response };
}

async function loadLeads(env) {
  const raw = await env.LEADS.get('all');
  if (!raw) return [];
  try {
    const list = JSON.parse(raw);
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

async function saveLead(env, lead) {
  const list = await loadLeads(env);
  list.push(lead);
  await env.LEADS.put('all', JSON.stringify(list));
  return list.length;
}

function checkAdmin(request, env) {
  const secret = env.ADMIN_SECRET;
  if (!secret) return false;
  const auth = request.headers.get('Authorization') || '';
  const bearer = auth.replace(/^Bearer\s+/i, '').trim();
  const url = new URL(request.url);
  const key = url.searchParams.get('key') || '';
  return bearer === secret || key === secret;
}

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS });
    }

    const url = new URL(request.url);
    const path = url.pathname.replace(/\/$/, '') || '/';

    try {
      if (path === '/health' && request.method === 'GET') {
        return json({
          ok: true,
          vk: !!(env.VK_GROUP_TOKEN && env.VK_NOTIFY_PEER_ID),
        });
      }

      if (path === '/lead' && request.method === 'POST') {
        let lead;
        try {
          lead = await request.json();
        } catch {
          return json({ error: 'Invalid JSON' }, 400);
        }

        if (!lead?.name?.trim() || !lead?.contact?.trim()) {
          return json({ error: 'name and contact required' }, 400);
        }

        lead.at = lead.at || new Date().toISOString();
        const count = await saveLead(env, lead);

        let vk = { skipped: true };
        try {
          vk = await sendVkCommunityMessage(env, formatLeadMessage(lead));
        } catch (vkErr) {
          console.error('VK send failed:', vkErr);
          vk = { ok: false, error: String(vkErr.message || vkErr) };
        }

        return json({ ok: true, saved: count, vk });
      }

      if (path === '/leads' && request.method === 'GET') {
        if (!checkAdmin(request, env)) {
          return json({ error: 'Unauthorized' }, 401);
        }
        const leads = await loadLeads(env);
        return json({ leads: leads.slice().reverse() });
      }

      return json({ error: 'Not found' }, 404);
    } catch (err) {
      console.error(err);
      return json({ error: String(err.message || err) }, 500);
    }
  },
};
