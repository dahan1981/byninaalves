const { listClickEvents } = require("./_lib/supabase");

const PASSWORD = process.env.ADMIN_PASSWORD;

function json(statusCode, body) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    },
    body: JSON.stringify(body),
  };
}

function getRangeStart(period) {
  const now = new Date();

  if (period === "today") {
    return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  }

  if (period === "7d") {
    return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  }

  if (period === "30d") {
    return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  }

  return null;
}

function getLabelMap() {
  return {
    social_instagram: "Instagram",
    social_tiktok: "TikTok",
    social_threads: "Threads",
    cta_pack_estampas: "Pack de Estampas",
    cta_guia_destrave: "Destrave suas vendas",
    cta_shopee: "Produtos Shopee",
    footer_instagram: "Footer Instagram",
  };
}

function aggregateEvents(events) {
  const countsByLink = {};
  const countsByDay = {};
  const labels = getLabelMap();

  events.forEach((event) => {
    countsByLink[event.link_id] = (countsByLink[event.link_id] || 0) + 1;

    const dayKey = String(event.clicked_at).slice(0, 10);
    countsByDay[dayKey] = (countsByDay[dayKey] || 0) + 1;
  });

  const perLink = Object.entries(labels).map(([linkId, label]) => ({
    link_id: linkId,
    label,
    total_clicks: countsByLink[linkId] || 0,
  }));

  perLink.sort((a, b) => b.total_clicks - a.total_clicks);

  const perDay = Object.entries(countsByDay)
    .map(([date, total_clicks]) => ({ date, total_clicks }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return {
    total_clicks: events.length,
    per_link: perLink,
    per_day: perDay,
  };
}

exports.handler = async (event) => {
  if (event.httpMethod !== "GET") {
    return json(405, { ok: false, error: "Method not allowed." });
  }

  if (!PASSWORD) {
    return json(500, { ok: false, error: "Missing ADMIN_PASSWORD environment variable." });
  }

  const providedPassword = event.headers["x-admin-password"];
  if (!providedPassword || providedPassword !== PASSWORD) {
    return json(401, { ok: false, error: "Unauthorized." });
  }

  try {
    const period = event.queryStringParameters?.period || "7d";
    const from = getRangeStart(period);
    const events = await listClickEvents({
      fromIso: from ? from.toISOString() : null,
    });

    return json(200, {
      ok: true,
      period,
      stats: aggregateEvents(events || []),
    });
  } catch (error) {
    console.error("admin-stats error", error);
    return json(500, { ok: false, error: "Unable to load admin stats." });
  }
};
