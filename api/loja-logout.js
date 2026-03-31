const { clearSessionCookie, buildBootstrap } = require("./_lib/loja-store");

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ ok: false, error: "Method not allowed." });
    return;
  }

  try {
    clearSessionCookie(res);
    const data = await buildBootstrap(req);
    res.status(200).json({ ok: true, data });
  } catch (error) {
    console.error("loja-logout error", error);
    res.status(500).json({ ok: false, error: error.message || "Unable to logout." });
  }
};
