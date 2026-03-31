(function () {
  const product = window.PRODUCT_PAGE;
  if (!product) return;

  const state = {
    loggedIn: false,
    name: "",
    email: "",
    owned: [],
    cart: [],
    authMode: "login",
    pendingProductId: product.id,
  };

  const cartCount = document.getElementById("cartCount");
  const memberChip = document.getElementById("memberChip");
  const purchaseStatus = document.getElementById("purchaseStatus");
  const addToCartButton = document.getElementById("addToCartButton");

  const authDrawer = document.getElementById("authDrawer");
  const authTitle = document.getElementById("authTitle");
  const authCopy = document.getElementById("authCopy");
  const authHelper = document.getElementById("authHelper");
  const drawerProductInfo = document.getElementById("drawerProductInfo");
  const loginTab = document.getElementById("loginTab");
  const signupTab = document.getElementById("signupTab");
  const nameInput = document.getElementById("nameInput");
  const emailInput = document.getElementById("emailInput");
  const passwordInput = document.getElementById("passwordInput");
  const confirmLogin = document.getElementById("confirmLogin");
  const closeDrawerBtn = document.getElementById("closeDrawer");

  function findProduct(productId) {
    return (state.products || []).find(function (item) {
      return item.id === productId;
    });
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
      ? "Entre na sua conta para adicionar este produto ao carrinho e seguir com a compra."
      : "Crie sua conta para comprar com mais facilidade e acessar sua biblioteca depois.";
    authHelper.textContent = isLogin
      ? "Use seus dados para continuar normalmente."
      : "Cadastre sua conta para seguir com este produto no carrinho.";
  }

  function renderState() {
    const cartItems = state.cart.length;
    const owned = state.owned.includes(product.id);
    const inCart = state.cart.includes(product.id);

    cartCount.textContent = String(cartItems);
    memberChip.classList.toggle("visible", state.owned.length > 0);

    if (owned) {
      addToCartButton.textContent = "Acesso liberado";
      addToCartButton.disabled = true;
      purchaseStatus.innerHTML = 'Este produto já está liberado na sua conta. <a class="page-link" href="/loja/membros.html">Ir para a área de membros</a>';
      return;
    }

    if (inCart) {
      addToCartButton.textContent = "No carrinho";
      purchaseStatus.innerHTML = 'Este produto já está no seu carrinho. <a class="page-link" href="/loja">Ir para a loja</a>';
      return;
    }

    addToCartButton.disabled = false;
    addToCartButton.textContent = "Adicionar ao carrinho";
    purchaseStatus.textContent = state.loggedIn
      ? "Sua conta está pronta. Adicione este produto ao carrinho e continue a compra quando quiser."
      : "Entre na sua conta para adicionar este produto ao carrinho.";
  }

  function applyBootstrap(data) {
    state.products = Array.isArray(data.products) ? data.products : [];
    state.loggedIn = Boolean(data.session);
    state.name = data.session ? data.session.name : "";
    state.email = data.session ? data.session.email : "";
    state.owned = Array.isArray(data.ownedProductIds) ? data.ownedProductIds : [];
    state.cart = Array.isArray(data.cartProductIds) ? data.cartProductIds : [];
    renderState();
  }

  async function loadBootstrap() {
    const result = await fetchJson("/api/loja-bootstrap", { method: "GET" });
    applyBootstrap(result.data);
  }

  function openDrawer() {
    drawerProductInfo.innerHTML = "<strong>Produto selecionado</strong><span>" + product.name + " • " + product.priceLabel + "</span>";
    setAuthMode(state.authMode || "login");
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
      body: JSON.stringify({ action: action, productId: productId }),
    });
    applyBootstrap(result.data);
  }

  async function handleBuy() {
    if (!state.loggedIn) {
      openDrawer();
      return;
    }

    if (state.owned.includes(product.id) || state.cart.includes(product.id)) {
      window.location.href = "/loja";
      return;
    }

    await syncCart("add", product.id);
  }

  addToCartButton.addEventListener("click", function () {
    handleBuy().catch(function (error) {
      console.error(error);
      purchaseStatus.textContent = error.message || "Não foi possível adicionar este produto ao carrinho.";
    });
  });

  document.getElementById("loginToggle").addEventListener("click", function () {
    if (state.loggedIn) {
      window.location.href = "/loja/membros.html";
      return;
    }
    openDrawer();
  });

  document.getElementById("cartToggle").addEventListener("click", function () {
    window.location.href = "/loja";
  });

  document.getElementById("searchToggle").addEventListener("click", function () {
    window.location.href = "/loja";
  });

  closeDrawerBtn.addEventListener("click", closeDrawer);
  authDrawer.addEventListener("click", function (event) {
    if (event.target === authDrawer) closeDrawer();
  });

  loginTab.addEventListener("click", function () {
    setAuthMode("login");
  });

  signupTab.addEventListener("click", function () {
    setAuthMode("signup");
  });

  confirmLogin.addEventListener("click", async function () {
    const result = await fetchJson("/api/loja-auth", {
      method: "POST",
      body: JSON.stringify({
        mode: state.authMode,
        name: nameInput.value.trim(),
        email: emailInput.value.trim(),
        password: passwordInput.value.trim(),
      }),
    });

    applyBootstrap(result.data);
    nameInput.value = "";
    emailInput.value = "";
    passwordInput.value = "";
    closeDrawer();
    await handleBuy();
  });

  loadBootstrap().catch(function (error) {
    console.error(error);
    purchaseStatus.textContent = error.message || "Não foi possível carregar o estado da sua conta.";
  });
})();
