const { listLinkBioLinks } = require("./_lib/supabase");

module.exports = async function handler(req, res) {
  if (req.method !== "GET") {
    res.status(405).json({ ok: false, error: "Method not allowed." });
    return;
  }

  try {
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0");
    const links = await listLinkBioLinks({ activeOnly: true });
    res.status(200).json({ ok: true, links });
  } catch (error) {
    console.error("link-bio-links error", error);
    res.status(500).json({
      ok: false,
      error: error && error.message ? error.message : "Unable to load bio links.",
    });
  }
};
