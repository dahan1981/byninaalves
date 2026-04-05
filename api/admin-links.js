const {
  createLinkBioLink,
  deleteLinkBioLink,
  listLinkBioLinks,
  updateLinkBioLink,
} = require("./_lib/supabase");

const PASSWORD = process.env.ADMIN_PASSWORD;

function slugify(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 48);
}

function ensureAuthorized(req, res) {
  if (!PASSWORD) {
    res.status(500).json({ ok: false, error: "Missing ADMIN_PASSWORD environment variable." });
    return false;
  }

  const providedPassword = req.headers["x-admin-password"];
  if (!providedPassword || providedPassword !== PASSWORD) {
    res.status(401).json({ ok: false, error: "Unauthorized." });
    return false;
  }

  return true;
}

module.exports = async function handler(req, res) {
  if (!ensureAuthorized(req, res)) return;

  try {
    if (req.method === "GET") {
      const links = await listLinkBioLinks();
      res.status(200).json({ ok: true, links });
      return;
    }

    const payload = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};

    if (req.method === "POST") {
      const label = String(payload.label || "").trim();
      const url = String(payload.url || "").trim();
      const opensNewTab = payload.opens_new_tab !== false;
      const position = Number.isFinite(Number(payload.position)) ? Number(payload.position) : Date.now();

      if (!label || !url) {
        res.status(400).json({ ok: false, error: "Label and URL are required." });
        return;
      }

      const id = `bio_${slugify(label) || "link"}_${Date.now().toString().slice(-6)}`;
      const rows = await createLinkBioLink({
        id,
        label,
        url,
        position,
        active: true,
        opens_new_tab: opensNewTab,
      });

      res.status(200).json({ ok: true, link: rows[0] || null });
      return;
    }

    if (req.method === "PATCH") {
      const id = String(payload.id || "").trim();
      if (!id) {
        res.status(400).json({ ok: false, error: "Link id is required." });
        return;
      }

      const updatePayload = {};
      if (typeof payload.label === "string") updatePayload.label = payload.label.trim();
      if (typeof payload.url === "string") updatePayload.url = payload.url.trim();
      if (typeof payload.opens_new_tab === "boolean") updatePayload.opens_new_tab = payload.opens_new_tab;
      if (typeof payload.active === "boolean") updatePayload.active = payload.active;
      if (Number.isFinite(Number(payload.position))) updatePayload.position = Number(payload.position);

      const rows = await updateLinkBioLink(id, updatePayload);
      res.status(200).json({ ok: true, link: rows[0] || null });
      return;
    }

    if (req.method === "DELETE") {
      const id = String(payload.id || req.query.id || "").trim();
      if (!id) {
        res.status(400).json({ ok: false, error: "Link id is required." });
        return;
      }

      await deleteLinkBioLink(id);
      res.status(200).json({ ok: true });
      return;
    }

    res.status(405).json({ ok: false, error: "Method not allowed." });
  } catch (error) {
    console.error("admin-links error", error);
    res.status(500).json({
      ok: false,
      error: error && error.message ? error.message : "Unable to manage links.",
    });
  }
};
