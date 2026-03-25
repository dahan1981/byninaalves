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

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return json(405, { ok: false, error: "Method not allowed." });
  }

  try {
    const payload = JSON.parse(event.body || "{}");
    const linkId = payload.link_id;

    if (payload.page_key !== "link_bio" || !ALLOWED_LINK_IDS.has(linkId) || !payload.destination_url) {
      return json(400, { ok: false, error: "Invalid tracking payload." });
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
      user_agent: event.headers["user-agent"] || null,
    });

    return json(200, { ok: true });
  } catch (error) {
    console.error("track-click error", error);
    return json(500, { ok: false, error: "Unable to record click event." });
  }
};
