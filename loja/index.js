(function () {
  const state = {
    loggedIn: false,
    name: "",
    email: "",
    phone: "",
    cpf: "",
    authMode: "login",
    searchTerm: "",
    products: [],
    owned: [],
    cart: [],
    pendingProductId: null,
  };

  const catalogSearch = document.getElementById("catalogSearch");
  const catalogGrid = document.getElementById("catalogGrid");
  const authDrawer = document.getElementById("authDrawer");
  const memberChip = document.getElementById("memberChip");
  const cartCount = document.getElementById("cartCount");
  const drawerProductInfo = document.getElementById("drawerProductInfo");
  const authTitle = document.getElementById("authTitle");
  const authCopy = document.getElementById("authCopy");
  const authHelper = document.getElementById("authHelper");
  const accountGrid = document.getElementById("accountGrid");
  const drawerMemberName = document.getElementById("drawerMemberName");
  const drawerMemberEmail = document.getElementById("drawerMemberEmail");
  const drawerMemberPhone = document.getElementById("drawerMemberPhone");
  const drawerMemberCpf = document.getElementById("drawerMemberCpf");
  const drawerOwnedTotal = document.getElementById("drawerOwnedTotal");
  const drawerCartTotal = document.getElementById("drawerCartTotal");
  const nameInput = document.getElementById("nameInput");
  const nameField = document.getElementById("nameField");
  const emailInput = document.getElementById("emailInput");
  const passwordInput = document.getElementById("passwordInput");
  const phoneInput = document.getElementById("phoneInput");
  const phoneField = document.getElementById("phoneField");
  const cpfInput = document.getElementById("cpfInput");
  const cpfField = document.getElementById("cpfField");
  const loginTab = document.getElementById("loginTab");
  const signupTab = document.getElementById("signupTab");
  const confirmLogin = document.getElementById("confirmLogin");
  const closeDrawerButton = document.getElementById("closeDrawer");
  const logoutDrawer = document.getElementById("logoutDrawer");

  function findProduct(productId) {
    return state.products.find(function (product) {
      return product.id === productId;
    });
  }

  function productImage(productId) {
    if (productId === "guia-destrave") return "/loja/guia.png";
    if (productId === "produto-02") return "/loja/precificacao.png";
    if (productId === "produto-03") return "/loja/calendario.png";
    if (productId === "produto-04") return "/loja/quadros.png";
    return "/loja/guia.png";
  }

  function productHref(productId) {
    if (productId === "guia-destrave") return "/loja/guia-destrave.html";
    if (productId === "produto-02") return "/loja/calculadora-de-precificacao.html";
    if (productId === "produto-03") return "/loja/calendario-sazonal.html";
    if (productId === "produto-04") return "/loja/pack-de-quadros.html";
    return "/loja";
  }

  function artMarkup(product) {
    return `<img src="${productImage(product.id)}" alt="${product.name}">`;
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
    authTitle.textContent = isLogin ? "Entrar" : "Criar conta";
    authCopy.textContent = isLogin
      ? "Entre na sua conta para comprar com mais facilidade e acompanhar seus acessos."
      : "Crie sua conta para guardar carrinho, pedidos e biblioteca no mesmo lugar.";
    authHelper.textContent = isLogin
      ? "Use seus dados para seguir normalmente para o carrinho."
      : "Cadastre sua conta para seguir com a compra.";
    nameField.style.display = isLogin ? "none" : "";
    phoneField.style.display = isLogin ? "none" : "";
    cpfField.style.display = isLogin ? "none" : "";
  }

  function renderAccountDrawer() {
    drawerMemberName.textContent = state.name || "Cliente";
    drawerMemberEmail.textContent = state.email || "—";
    if (drawerMemberPhone) drawerMemberPhone.textContent = state.phone || "—";
    if (drawerMemberCpf) drawerMemberCpf.textContent = state.cpf || "—";
    drawerOwnedTotal.textContent = String(state.owned.length);
    drawerCartTotal.textContent = String(state.cart.length);
  }

  function renderCatalog() {
    const term = (state.searchTerm || "").trim().toLowerCase();
    const filteredProducts = state.products.filter(function (product) {
      if (!term) return true;

      const haystack = [
        product.name,
        product.tag,
        product.description,
        ...(product.meta || []),
        ...(product.benefits || []),
        ...(product.bonuses || []),
      ].join(" ").toLowerCase();

      return haystack.includes(term);
    });

    if (!filteredProducts.length) {
      catalogGrid.innerHTML = `
        <div class="catalog-empty">
          <strong>Produto não encontrado</strong>
          <span>Tente buscar por outro nome ou termo do produto.</span>
        </div>
      `;
      return;
    }

    catalogGrid.innerHTML = filteredProducts.map(function (product) {
      const owned = state.owned.includes(product.id);
      const inCart = state.cart.includes(product.id);
      const oldPriceLabel = product.original_price_label || "";

      return `
        <article class="product-card">
          <div class="product-art">
            <div class="product-badges">
              <span class="product-badge">${product.tag}</span>
            </div>
            ${artMarkup(product)}
          </div>
          <div class="product-body">
            <div class="product-head">
              <div>
                <h3 class="product-name">${product.name}</h3>
              </div>
              <p class="price"><strong>${product.price_label || product.priceLabel}</strong>${oldPriceLabel ? `<span class="price-old">${oldPriceLabel}</span>` : ""}</p>
            </div>
            ${product.description ? `<p class="product-copy">${product.description}</p>` : ""}
            <div class="product-actions">
              <a class="ghost-btn" href="${productHref(product.id)}">Ver detalhes</a>
              <button class="primary-btn" type="button" data-action="buy" data-product="${product.id}">${owned ? "Acesso liberado" : inCart ? "Finalizar compra" : "Quero este produto"}</button>
            </div>
          </div>
        </article>
      `;
    }).join("");
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
    cartCount.textContent = String(state.cart.length);
    memberChip.classList.toggle("visible", state.owned.length > 0);
    renderCatalog();
  }

  async function loadBootstrap() {
    const result = await fetchJson("/api/loja-bootstrap", { method: "GET" });
    applyBootstrap(result.data);
  }

  function openDrawer(productId) {
    const product = productId ? findProduct(productId) : null;

    if (state.loggedIn) {
      authTitle.textContent = "Minha conta";
      authCopy.textContent = "Sua conta está pronta para continuar comprando, abrir o carrinho e acessar a biblioteca.";
      authHelper.textContent = state.cart.length ? "Seu carrinho está pronto para finalizar." : "Sua conta está pronta para novas compras.";
      loginTab.style.display = "none";
      signupTab.style.display = "none";
      nameField.style.display = "none";
      emailInput.closest(".field").style.display = "none";
      passwordInput.closest(".field").style.display = "none";
      phoneField.style.display = "none";
      cpfField.style.display = "none";
      document.querySelector(".auth-grid").style.display = "none";
      accountGrid.classList.add("visible");
      logoutDrawer.hidden = false;
      renderAccountDrawer();
      confirmLogin.textContent = state.cart.length ? "Abrir carrinho" : "Abrir biblioteca";
      drawerProductInfo.innerHTML = product
        ? `<strong>Produto selecionado</strong><span>${product.name} • ${product.price_label || product.priceLabel}</span>`
        : `<strong>Sua conta está ativa</strong><span>Entre no carrinho ou abra a biblioteca quando quiser.</span>`;
    } else {
      loginTab.style.display = "";
      signupTab.style.display = "";
      emailInput.closest(".field").style.display = "";
      passwordInput.closest(".field").style.display = "";
      document.querySelector(".auth-grid").style.display = "";
      accountGrid.classList.remove("visible");
      logoutDrawer.hidden = true;
      confirmLogin.textContent = "Continuar";
      drawerProductInfo.innerHTML = product
        ? `<strong>Produto selecionado</strong><span>${product.name} • ${product.price_label || product.priceLabel}</span>`
        : `<strong>Sua compra continua aqui</strong><span>Entre ou crie sua conta para seguir com tudo organizado.</span>`;
      setAuthMode(state.authMode || "login");
    }

    authDrawer.classList.add("open");
    authDrawer.setAttribute("aria-hidden", "false");
  }

  function closeDrawer() {
    authDrawer.classList.remove("open");
    authDrawer.setAttribute("aria-hidden", "true");
  }

  async function syncCart(action, productId) {
    const result = await fetchJson("/api/loja-cart", {
      method: "POST",
      body: JSON.stringify({ action, productId }),
    });
    applyBootstrap(result.data);
  }

  async function buyProduct(productId) {
    if (!state.loggedIn) {
      state.pendingProductId = productId;
      openDrawer(productId);
      return;
    }

    if (state.owned.includes(productId)) {
      window.location.href = "/loja/membros.html";
      return;
    }

    if (state.cart.includes(productId)) {
      window.location.href = "/loja/carrinho.html";
      return;
    }

    await syncCart("add", productId);
  }

  async function logout() {
    const result = await fetchJson("/api/loja-logout", {
      method: "POST",
      body: JSON.stringify({}),
    });
    applyBootstrap(result.data);
    closeDrawer();
  }

  document.addEventListener("click", async function (event) {
    const button = event.target.closest("[data-action='buy']");
    if (!button) return;
    await buyProduct(button.getAttribute("data-product"));
  });

  document.getElementById("loginToggle").addEventListener("click", function () {
    openDrawer(state.pendingProductId);
  });

  document.getElementById("searchToggle").addEventListener("click", function () {
    catalogSearch.focus();
  });

  catalogSearch.addEventListener("input", function (event) {
    state.searchTerm = event.target.value || "";
    renderCatalog();
  });

  document.getElementById("cartToggle").addEventListener("click", function () {
    window.location.href = "/loja/carrinho.html";
  });

  confirmLogin.addEventListener("click", async function () {
    if (state.loggedIn) {
      closeDrawer();
      window.location.href = state.cart.length ? "/loja/carrinho.html" : "/loja/membros.html";
      return;
    }

    const result = await fetchJson("/api/loja-auth", {
      method: "POST",
      body: JSON.stringify({
        mode: state.authMode,
        name: nameInput.value.trim(),
        email: emailInput.value.trim(),
        password: passwordInput.value.trim(),
        phone: phoneInput.value.trim(),
        cpf: cpfInput.value.trim(),
      }),
    });

    applyBootstrap(result.data);
    nameInput.value = "";
    emailInput.value = "";
    passwordInput.value = "";
    phoneInput.value = "";
    cpfInput.value = "";

    if (state.pendingProductId) {
      await syncCart("add", state.pendingProductId);
      state.pendingProductId = null;
      window.location.href = "/loja/carrinho.html";
      return;
    }

    closeDrawer();
  });

  loginTab.addEventListener("click", function () {
    setAuthMode("login");
  });

  signupTab.addEventListener("click", function () {
    setAuthMode("signup");
  });

  logoutDrawer.addEventListener("click", function () {
    logout().catch(function (error) {
      console.error(error);
    });
  });

  memberChip.addEventListener("click", function () {
    window.location.href = "/loja/membros.html";
  });

  closeDrawerButton.addEventListener("click", closeDrawer);

  authDrawer.addEventListener("click", function (event) {
    if (event.target === authDrawer) closeDrawer();
  });

  loadBootstrap().catch(function (error) {
    console.error(error);
  });

  setAuthMode("login");
})();
