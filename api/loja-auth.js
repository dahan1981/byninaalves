const { buildBootstrap, createUser, findUserByEmail, setSessionCookie, verifyPassword } = require("./_lib/loja-store");

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ ok: false, error: "Method not allowed." });
    return;
  }

  try {
    const payload = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};
    const mode = payload.mode === "signup" ? "signup" : "login";
    const email = String(payload.email || "").trim().toLowerCase();
    const password = String(payload.password || "");
    const name = String(payload.name || "").trim();

    if (!email || !password) {
      res.status(400).json({ ok: false, error: "E-mail e senha são obrigatórios." });
      return;
    }

    let user = await findUserByEmail(email);

    if (mode === "signup") {
      if (user) {
        res.status(409).json({ ok: false, error: "Já existe uma conta com este e-mail." });
        return;
      }

      user = await createUser({
        name: name || "Cliente da loja",
        email,
        password,
      });
    } else {
      if (!user || !verifyPassword(password, user.password_hash)) {
        res.status(401).json({ ok: false, error: "E-mail ou senha inválidos." });
        return;
      }
    }

    setSessionCookie(res, {
      userId: user.id,
      email: user.email,
      name: user.name,
    });

    const data = await buildBootstrap(req);
    res.status(200).json({ ok: true, data });
  } catch (error) {
    console.error("loja-auth error", error);
    res.status(500).json({ ok: false, error: error.message || "Unable to authenticate." });
  }
};
