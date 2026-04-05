const { listLinkBioLinks } = require("./_lib/supabase");

module.exports = async function handler(req, res) {
  if (req.method !== "GET") {
    res.status(405).json({ ok: false, error: "Method not allowed." });
    return;
  }

  try {
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
