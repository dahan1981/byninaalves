(function () {
  const state = {
    loggedIn: false,
    name: "",
    email: "",
    owned: [],
    cart: [],
    products: [],
    activeTab: "owned",
  };

  const loginWrap = document.getElementById("loginWrap");
  const emptyWrap = document.getElementById("emptyWrap");
  const contentWrap = document.getElementById("contentWrap");
  const memberChip = document.getElementById("memberChip");
  const cartCount = document.getElementById("cartCount");
  const loginName = document.getElementById("loginName");
  const loginEmail = document.getElementById("loginEmail");
  const loginPassword = document.getElementById("loginPassword");
  const loginButton = document.getElementById("loginButton");
  const loginFeedback = document.getElementById("loginFeedback");
  const ownedTab = document.getElementById("ownedTab");
  const availableTab = document.getElementById("availableTab");
  const ownedPanel = document.getElementById("ownedPanel");
  const availablePanel = document.getElementById("availablePanel");
  const ownedGrid = document.getElementById("ownedGrid");
  const availableGrid = document.getElementById("availableGrid");
  const accountName = document.getElementById("accountName");
  const accountEmail = document.getElementById("accountEmail");
  const accountOwned = document.getElementById("accountOwned");
  const accountCart = document.getElementById("accountCart");

  function productHref(productId) {
    if (productId === "guia-destrave") return "/loja/guia-destrave.html";
    if (productId === "produto-02") return "/loja/calculadora-de-precificacao.html";
    if (productId === "produto-03") return "/loja/calendario-sazonal.html";
    if (productId === "produto-04") return "/loja/pack-de-quadros.html";
    return "/loja";
  }

  function productImage(productId) {
    if (productId === "guia-destrave") return "/loja/guia.png";
    if (productId === "produto-02") return "/loja/precificacao.png";
    if (productId === "produto-03") return "/loja/calendario.png";
    if (productId === "produto-04") return "/loja/quadros.png";
    return "/loja/destrave.png";
  }

  async function fetchJson(url, options) {
    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...(options && options.headers ? options.headers : {}),
      },
      ...(options || {}),
    });

    const result = await response.json();
    if (!response.ok || !result.ok) {
      throw new Error((result && result.error) || "Não foi possível concluir esta ação.");
    }

    return result;
  }

  function setTab(tab) {
    state.activeTab = tab;
    ownedTab.classList.toggle("active", tab === "owned");
    availableTab.classList.toggle("active", tab === "available");
    ownedPanel.classList.toggle("active", tab === "owned");
    availablePanel.classList.toggle("active", tab === "available");
  }

  function applyBootstrap(data) {
    state.products = Array.isArray(data.products) ? data.products : [];
    state.loggedIn = Boolean(data.session);
    state.name = data.session ? data.session.name : "";
    state.email = data.session ? data.session.email : "";
    state.owned = Array.isArray(data.ownedProductIds) ? data.ownedProductIds : [];
    state.cart = Array.isArray(data.cartProductIds) ? data.cartProductIds : [];
    render();
  }

  function renderProductCard(product, type) {
    const oldPrice = product.original_price_label || "";
    const buttonLabel = type === "owned" ? "Acessar produto" : "Ver produto";
    return `
      <article class="product-card">
        <div class="product-media">
          <img src="${productImage(product.id)}" alt="${product.name}">
        </div>
        <div class="product-body">
          <p class="product-kicker">${type === "owned" ? "Acesso liberado" : "Disponível para compra"}</p>
          <h3 class="product-name">${product.name}</h3>
          ${product.description ? `<p class="product-copy">${product.description}</p>` : ""}
          <div class="price-row">
            <strong>${product.price_label || product.priceLabel}</strong>
            ${oldPrice ? `<span class="price-old">${oldPrice}</span>` : ""}
          </div>
          <div class="actions">
            <a class="primary-btn" href="${productHref(product.id)}">${buttonLabel}</a>
          </div>
        </div>
      </article>
    `;
  }

  function render() {
    cartCount.textContent = String(state.cart.length);
    memberChip.classList.toggle("visible", state.owned.length > 0);

    if (!state.loggedIn) {
      loginWrap.hidden = false;
      emptyWrap.classList.remove("visible");
      contentWrap.classList.remove("visible");
      return;
    }

    loginWrap.hidden = true;

    if (!state.owned.length) {
      emptyWrap.classList.add("visible");
      contentWrap.classList.remove("visible");
      return;
    }

    emptyWrap.classList.remove("visible");
    contentWrap.classList.add("visible");

    const ownedProducts = state.products.filter(function (product) {
      return state.owned.includes(product.id);
    });

    const availableProducts = state.products.filter(function (product) {
      return !state.owned.includes(product.id);
    });

    accountName.textContent = state.name || "Cliente";
    accountEmail.textContent = state.email || "—";
    accountOwned.textContent = String(ownedProducts.length);
    accountCart.textContent = String(state.cart.length);

    ownedGrid.innerHTML = ownedProducts.map(function (product) {
      return renderProductCard(product, "owned");
    }).join("");

    availableGrid.innerHTML = availableProducts.map(function (product) {
      return renderProductCard(product, "available");
    }).join("");

    setTab(state.activeTab);
  }

  async function loadBootstrap() {
    const result = await fetchJson("/api/loja-bootstrap", { method: "GET" });
    applyBootstrap(result.data);
  }

  loginButton.addEventListener("click", async function () {
    try {
      loginFeedback.textContent = "";
      const result = await fetchJson("/api/loja-auth", {
        method: "POST",
        body: JSON.stringify({
          mode: "login",
          name: loginName.value.trim(),
          email: loginEmail.value.trim(),
          password: loginPassword.value.trim(),
        }),
      });
      loginPassword.value = "";
      applyBootstrap(result.data);
    } catch (error) {
      loginFeedback.textContent = error.message || "Não foi possível entrar agora.";
    }
  });

  ownedTab.addEventListener("click", function () {
    setTab("owned");
  });

  availableTab.addEventListener("click", function () {
    setTab("available");
  });

  document.getElementById("searchToggle").addEventListener("click", function () {
    window.location.href = "/loja";
  });

  document.getElementById("loginToggle").addEventListener("click", function () {
    if (state.loggedIn && state.owned.length > 0) {
      setTab("owned");
      contentWrap.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    loginEmail.focus();
  });

  document.getElementById("cartToggle").addEventListener("click", function () {
    window.location.href = "/loja/carrinho.html";
  });

  loadBootstrap().catch(function (error) {
    console.error(error);
    loginFeedback.textContent = error.message || "Não foi possível carregar sua conta.";
  });
})();
