const { buildBootstrap, getCart, getSession, listOwnedProductIds, listProducts, setCartCookie } = require("./_lib/loja-store");

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ ok: false, error: "Method not allowed." });
    return;
  }

  try {
    const session = getSession(req);
    if (!session || !session.userId) {
      res.status(401).json({ ok: false, error: "Login required." });
      return;
    }

    const payload = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};
    const productId = String(payload.productId || "");
    const action = payload.action === "remove" ? "remove" : "add";

    const products = await listProducts();
    const validIds = new Set(products.map((product) => product.id));
    if (!validIds.has(productId)) {
      res.status(400).json({ ok: false, error: "Invalid product." });
      return;
    }

    const ownedProductIds = await listOwnedProductIds(session.userId);
    let cart = getCart(req).filter((id) => validIds.has(id) && !ownedProductIds.includes(id));

    if (action === "add") {
      if (!cart.includes(productId) && !ownedProductIds.includes(productId)) {
        cart.push(productId);
      }
    } else {
      cart = cart.filter((id) => id !== productId);
    }

    setCartCookie(res, cart);
    const data = await buildBootstrap(req);
    res.status(200).json({ ok: true, data });
  } catch (error) {
    console.error("loja-cart error", error);
    res.status(500).json({ ok: false, error: error.message || "Unable to update cart." });
  }
};
