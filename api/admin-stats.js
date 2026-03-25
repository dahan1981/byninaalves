const { listClickEvents } = require("./_lib/supabase");

const PASSWORD = process.env.ADMIN_PASSWORD;

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

  const perLink = Object.entries(labels)
    .map(([link_id, label]) => ({
      link_id,
      label,
      total_clicks: countsByLink[link_id] || 0,
    }))
    .sort((a, b) => b.total_clicks - a.total_clicks);

  const perDay = Object.entries(countsByDay)
    .map(([date, total_clicks]) => ({ date, total_clicks }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return {
    total_clicks: events.length,
    per_link: perLink,
    per_day: perDay,
  };
}

module.exports = async function handler(req, res) {
  if (req.method !== "GET") {
    res.status(405).json({ ok: false, error: "Method not allowed." });
    return;
  }

  if (!PASSWORD) {
    res.status(500).json({ ok: false, error: "Missing ADMIN_PASSWORD environment variable." });
    return;
  }

  const providedPassword = req.headers["x-admin-password"];
  if (!providedPassword || providedPassword !== PASSWORD) {
    res.status(401).json({ ok: false, error: "Unauthorized." });
    return;
  }

  try {
    const period = req.query.period || "7d";
    const from = getRangeStart(period);
    const events = await listClickEvents({
      fromIso: from ? from.toISOString() : null,
    });

    res.status(200).json({
      ok: true,
      period,
      stats: aggregateEvents(events || []),
    });
  } catch (error) {
    console.error("admin-stats error", error);
    res.status(500).json({
      ok: false,
      error: error && error.message ? error.message : "Unable to load admin stats.",
    });
  }
};
