const { insertClickEvent } = require("./_lib/supabase");

const ALLOWED_LINK_IDS = new Set([
  "social_instagram",
  "social_tiktok",
  "social_threads",
  "cta_pack_estampas",
  "cta_guia_destrave",
  "cta_shopee",
  "footer_instagram",
]);

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ ok: false, error: "Method not allowed." });
    return;
  }

  try {
    const payload = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};
    const linkId = payload.link_id;

    if (payload.page_key !== "link_bio" || !ALLOWED_LINK_IDS.has(linkId) || !payload.destination_url) {
      res.status(400).json({ ok: false, error: "Invalid tracking payload." });
      return;
    }

    await insertClickEvent({
      page_key: "link_bio",
      link_id: linkId,
      destination_url: payload.destination_url,
      pathname: payload.pathname || null,
      referrer: payload.referrer || null,
      utm_source: payload.utm_source || null,
      utm_medium: payload.utm_medium || null,
      utm_campaign: payload.utm_campaign || null,
      user_agent: req.headers["user-agent"] || null,
    });

    res.status(200).json({ ok: true });
  } catch (error) {
    console.error("track-click error", error);
    res.status(500).json({ ok: false, error: "Unable to record click event." });
  }
};
