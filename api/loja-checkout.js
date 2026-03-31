const {
  buildBootstrap,
  clearCartCookie,
  createOrder,
  getCart,
  getSession,
  listOwnedProductIds,
  listProducts,
} = require("./_lib/loja-store");

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

    const products = await listProducts();
    const productsById = new Map(products.map((product) => [product.id, product]));
    const ownedProductIds = await listOwnedProductIds(session.userId);
    const cart = getCart(req).filter((id) => productsById.has(id) && !ownedProductIds.includes(id));

    if (!cart.length) {
      res.status(400).json({ ok: false, error: "Cart is empty." });
      return;
    }

    const totalCents = cart.reduce((sum, productId) => {
      const product = productsById.get(productId);
      return sum + Number(product.price_cents || 0);
    }, 0);

    await createOrder({
      userId: session.userId,
      productIds: cart,
      totalCents,
    });

    clearCartCookie(res);
    const data = await buildBootstrap(req);
    res.status(200).json({ ok: true, data });
  } catch (error) {
    console.error("loja-checkout error", error);
    res.status(500).json({ ok: false, error: error.message || "Unable to complete checkout." });
  }
};
