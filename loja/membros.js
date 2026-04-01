(function () {
  const state = {
    loggedIn: false,
    name: "",
    email: "",
    phone: "",
    cpf: "",
    owned: [],
    cart: [],
    products: [],
    activeTab: "owned",
    authMode: "login",
  };

  const loginWrap = document.getElementById("loginWrap");
  const emptyWrap = document.getElementById("emptyWrap");
  const contentWrap = document.getElementById("contentWrap");
  const memberChip = document.getElementById("memberChip");
  const cartCount = document.getElementById("cartCount");
  const loginName = document.getElementById("loginName");
  const loginEmail = document.getElementById("loginEmail");
  const loginPassword = document.getElementById("loginPassword");
  const loginPhone = document.getElementById("loginPhone");
  const loginCpf = document.getElementById("loginCpf");
  const loginButton = document.getElementById("loginButton");
  const loginFeedback = document.getElementById("loginFeedback");
  const loginTab = document.getElementById("loginTab");
  const signupTab = document.getElementById("signupTab");
  const nameField = document.getElementById("nameField");
  const phoneField = document.getElementById("phoneField");
  const cpfField = document.getElementById("cpfField");
  const ownedTab = document.getElementById("ownedTab");
  const availableTab = document.getElementById("availableTab");
  const ownedPanel = document.getElementById("ownedPanel");
  const availablePanel = document.getElementById("availablePanel");
  const ownedGrid = document.getElementById("ownedGrid");
  const availableGrid = document.getElementById("availableGrid");
  const accountName = document.getElementById("accountName");
  const accountEmail = document.getElementById("accountEmail");
  const accountPhone = document.getElementById("accountPhone");
  const accountCpf = document.getElementById("accountCpf");
  const accountOwned = document.getElementById("accountOwned");
  const accountCart = document.getElementById("accountCart");
  const profileAvatar = document.getElementById("profileAvatar");

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

  function setAuthMode(mode) {
    state.authMode = mode;
    const isLogin = mode === "login";
    loginTab.classList.toggle("active", isLogin);
    signupTab.classList.toggle("active", !isLogin);
    nameField.hidden = isLogin;
    phoneField.hidden = isLogin;
    cpfField.hidden = isLogin;
    loginButton.textContent = isLogin ? "Continuar" : "Criar conta";
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
    state.phone = data.session ? data.session.phone || "" : "";
    state.cpf = data.session ? data.session.cpf || "" : "";
    state.owned = Array.isArray(data.ownedProductIds) ? data.ownedProductIds : [];
    state.cart = Array.isArray(data.cartProductIds) ? data.cartProductIds : [];
    render();
  }

  function renderLibraryCard(product, owned) {
    const oldPrice = product.original_price_label || "";
    return `
      <article class="library-card">
        <div class="library-card-media">
          <img src="${productImage(product.id)}" alt="${product.name}">
        </div>
        <div class="library-card-body">
          <p class="product-kicker">${owned ? "Acesso liberado" : "Disponível para adicionar"}</p>
          <h3 class="product-name">${product.name}</h3>
          ${product.description ? `<p class="product-copy">${product.description}</p>` : ""}
          <div class="price-row">
            <strong>${product.price_label || product.priceLabel}</strong>
            ${oldPrice ? `<span class="price-old">${oldPrice}</span>` : ""}
          </div>
          <div class="actions">
            <a class="${owned ? "primary-btn" : "ghost-btn"}" href="${productHref(product.id)}">${owned ? "Abrir produto" : "Ver detalhes"}</a>
            ${owned ? "" : `<button class="primary-btn" type="button" data-buy-product="${product.id}">${state.cart.includes(product.id) ? "Finalizar compra" : "Adicionar ao carrinho"}</button>`}
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

    emptyWrap.classList.toggle("visible", !state.owned.length);
    contentWrap.classList.add("visible");

    const ownedProducts = state.products.filter(function (product) {
      return state.owned.includes(product.id);
    });

    const availableProducts = state.products.filter(function (product) {
      return !state.owned.includes(product.id);
    });

    accountName.textContent = state.name || "Cliente";
    accountEmail.textContent = state.email || "—";
    if (accountPhone) accountPhone.textContent = state.phone || "—";
    if (accountCpf) accountCpf.textContent = state.cpf || "—";
    accountOwned.textContent = String(ownedProducts.length);
    accountCart.textContent = String(state.cart.length);
    profileAvatar.textContent = (state.name || "C").trim().charAt(0).toUpperCase();

    ownedGrid.innerHTML = ownedProducts.length
      ? ownedProducts.map(function (product) {
          return renderLibraryCard(product, true);
        }).join("")
      : `
        <article class="library-card">
          <div class="library-card-body">
            <p class="product-kicker">Sem acessos liberados</p>
            <h3 class="product-name">Sua biblioteca começa na primeira compra</h3>
            <p class="product-copy">Assim que um pedido for aprovado, o produto entra aqui com acesso liberado.</p>
            <div class="actions">
              <a class="primary-btn" href="/loja">Explorar produtos</a>
            </div>
          </div>
        </article>
      `;

    availableGrid.innerHTML = availableProducts.map(function (product) {
      return renderLibraryCard(product, false);
    }).join("");

    setTab(state.activeTab);
  }

  async function loadBootstrap() {
    const result = await fetchJson("/api/loja-bootstrap", { method: "GET" });
    applyBootstrap(result.data);
  }

  async function submitAuth() {
    const result = await fetchJson("/api/loja-auth", {
      method: "POST",
      body: JSON.stringify({
        mode: state.authMode,
        name: loginName.value.trim(),
        email: loginEmail.value.trim(),
        password: loginPassword.value.trim(),
        phone: loginPhone.value.trim(),
        cpf: loginCpf.value.trim(),
      }),
    });
    loginName.value = "";
    loginPassword.value = "";
    loginPhone.value = "";
    loginCpf.value = "";
    applyBootstrap(result.data);
  }

  async function buyProduct(productId) {
    if (!state.loggedIn) return;

    if (state.cart.includes(productId)) {
      window.location.href = "/loja/carrinho.html";
      return;
    }

    const result = await fetchJson("/api/loja-cart", {
      method: "POST",
      body: JSON.stringify({
        action: "add",
        productId,
      }),
    });

    applyBootstrap(result.data);
  }

  async function logout() {
    const result = await fetchJson("/api/loja-logout", {
      method: "POST",
      body: JSON.stringify({}),
    });
    applyBootstrap(result.data);
  }

  loginButton.addEventListener("click", function () {
    loginFeedback.textContent = "";
    submitAuth().catch(function (error) {
      loginFeedback.textContent = error.message || "Não foi possível entrar agora.";
    });
  });

  loginTab.addEventListener("click", function () {
    setAuthMode("login");
  });

  signupTab.addEventListener("click", function () {
    setAuthMode("signup");
  });

  ownedTab.addEventListener("click", function () {
    setTab("owned");
  });

  availableTab.addEventListener("click", function () {
    setTab("available");
  });

  availableGrid.addEventListener("click", function (event) {
    const button = event.target.closest("[data-buy-product]");
    if (!button) return;

    buyProduct(button.getAttribute("data-buy-product")).catch(function (error) {
      loginFeedback.textContent = error.message || "Não foi possível atualizar o carrinho.";
    });
  });

  document.getElementById("logoutButton").addEventListener("click", function () {
    logout().catch(function (error) {
      loginFeedback.textContent = error.message || "Não foi possível sair da conta.";
    });
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

  setAuthMode("login");
})();
