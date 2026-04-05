const { insertClickEvent, listLinkBioLinks } = require("./_lib/supabase");

const STATIC_LINK_IDS = new Set([
  "social_instagram",
  "social_tiktok",
  "social_threads",
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
    const dynamicLinks = await listLinkBioLinks({ activeOnly: true });
    const allowedLinkIds = new Set(
      [...STATIC_LINK_IDS, ...dynamicLinks.map((item) => item.id)].filter(Boolean)
    );

    if (payload.page_key !== "link_bio" || !allowedLinkIds.has(linkId) || !payload.destination_url) {
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
    res.status(500).json({
      ok: false,
      error: error && error.message ? error.message : "Unable to record click event.",
    });
  }
};
