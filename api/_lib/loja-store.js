const crypto = require("crypto");

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

function ensureEnv() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Missing Supabase environment variables.");
  }
}

function getRestUrl(path = "") {
  return `${SUPABASE_URL.replace(/\/$/, "")}/rest/v1/${path}`;
}

async function supabaseFetch(path, options = {}) {
  ensureEnv();

  const response = await fetch(getRestUrl(path), {
    ...options,
    headers: {
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Supabase request failed: ${response.status} ${body}`);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

function parseCookies(req) {
  const header = req.headers.cookie || "";
  return header.split(";").reduce((acc, part) => {
    const [rawKey, ...rest] = part.trim().split("=");
    if (!rawKey) return acc;
    acc[rawKey] = decodeURIComponent(rest.join("="));
    return acc;
  }, {});
}

function getCookieSecret() {
  ensureEnv();
  return crypto
    .createHash("sha256")
    .update(`${SUPABASE_SERVICE_ROLE_KEY}:loja-session`)
    .digest();
}

function encodeSigned(payload) {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = crypto.createHmac("sha256", getCookieSecret()).update(body).digest("base64url");
  return `${body}.${sig}`;
}

function decodeSigned(value) {
  if (!value || !value.includes(".")) return null;
  const [body, sig] = value.split(".");
  const expected = crypto.createHmac("sha256", getCookieSecret()).update(body).digest("base64url");
  if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) {
    return null;
  }

  try {
    return JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
  } catch {
    return null;
  }
}

function serializeCookie(name, value, maxAgeSeconds) {
  const parts = [
    `${name}=${encodeURIComponent(value)}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    "Secure",
  ];

  if (typeof maxAgeSeconds === "number") {
    parts.push(`Max-Age=${maxAgeSeconds}`);
  }

  return parts.join("; ");
}

function appendSetCookie(res, cookieValue) {
  const current = res.getHeader("Set-Cookie");
  if (!current) {
    res.setHeader("Set-Cookie", [cookieValue]);
    return;
  }
  res.setHeader("Set-Cookie", Array.isArray(current) ? current.concat(cookieValue) : [current, cookieValue]);
}

function setNoStore(res) {
  res.setHeader("Cache-Control", "no-store, max-age=0");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
}

function setSessionCookie(res, session) {
  appendSetCookie(res, serializeCookie("loja_session", encodeSigned(session), 60 * 60 * 24 * 30));
}

function clearSessionCookie(res) {
  appendSetCookie(res, serializeCookie("loja_session", "", 0));
}

function setCartCookie(res, cartIds) {
  appendSetCookie(res, serializeCookie("loja_cart", encodeSigned(cartIds), 60 * 60 * 24 * 7));
}

function clearCartCookie(res) {
  appendSetCookie(res, serializeCookie("loja_cart", "", 0));
}

function getSession(req) {
  const cookies = parseCookies(req);
  return decodeSigned(cookies.loja_session);
}

function getCart(req) {
  const cookies = parseCookies(req);
  const payload = decodeSigned(cookies.loja_cart);
  return Array.isArray(payload) ? payload : [];
}

function hashPassword(password, salt = crypto.randomBytes(16).toString("hex")) {
  const derived = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${derived}`;
}

function verifyPassword(password, stored) {
  if (!stored || !stored.includes(":")) return false;
  const [salt, expected] = stored.split(":");
  const actual = crypto.scryptSync(password, salt, 64).toString("hex");
  return crypto.timingSafeEqual(Buffer.from(actual), Buffer.from(expected));
}

async function listProducts() {
  return supabaseFetch("loja_products?select=*&active=eq.true&order=position.asc", { method: "GET" });
}

async function findUserByEmail(email) {
  const result = await supabaseFetch(
    `loja_users?select=id,name,email,phone,cpf,password_hash&email=eq.${encodeURIComponent(email)}&limit=1`,
    { method: "GET" }
  );
  return result[0] || null;
}

async function findUserById(id) {
  const result = await supabaseFetch(`loja_users?select=id,name,email,phone,cpf&id=eq.${id}&limit=1`, {
    method: "GET",
  });
  return result[0] || null;
}

async function createUser({ name, email, phone, cpf, password }) {
  const payload = {
    name,
    email: email.toLowerCase(),
    phone,
    cpf,
    password_hash: hashPassword(password),
  };

  const result = await supabaseFetch("loja_users", {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify(payload),
  });

  return result[0];
}

async function listOwnedProductIds(userId) {
  const rows = await supabaseFetch(`loja_order_items?select=product_id&user_id=eq.${userId}`, { method: "GET" });
  return [...new Set(rows.map((row) => row.product_id))];
}

async function createOrder({ userId, productIds, totalCents }) {
  const orderRows = await supabaseFetch("loja_orders", {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify({
      user_id: userId,
      status: "paid",
      total_cents: totalCents,
    }),
  });

  const order = orderRows[0];

  await supabaseFetch("loja_order_items", {
    method: "POST",
    headers: { Prefer: "return=minimal" },
    body: JSON.stringify(
      productIds.map((productId) => ({
        order_id: order.id,
        user_id: userId,
        product_id: productId,
      }))
    ),
  });

  return order;
}

async function buildBootstrap(req) {
  const products = await listProducts();
  const session = getSession(req);
  const cart = getCart(req);
  let user = null;
  let ownedProductIds = [];

  if (session && session.userId) {
    user = await findUserById(session.userId);
    if (user) {
      ownedProductIds = await listOwnedProductIds(user.id);
    }
  }

  return {
    products,
    session: user
      ? {
          name: user.name,
          email: user.email,
          phone: user.phone || "",
          cpf: user.cpf || "",
        }
      : null,
    ownedProductIds,
    cartProductIds: cart.filter((id) => !ownedProductIds.includes(id)),
    credentials: null,
  };
}

module.exports = {
  buildBootstrap,
  clearCartCookie,
  clearSessionCookie,
  createOrder,
  createUser,
  findUserByEmail,
  getCart,
  getSession,
  listOwnedProductIds,
  listProducts,
  setCartCookie,
  setSessionCookie,
  setNoStore,
  verifyPassword,
};
