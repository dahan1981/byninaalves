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
    authMode: "login",
  };

  const memberChip = document.getElementById("memberChip");
  const cartCount = document.getElementById("cartCount");
  const loginWrap = document.getElementById("loginWrap");
  const checkoutWrap = document.getElementById("checkoutWrap");
  const emptyWrap = document.getElementById("emptyWrap");
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
  const cartList = document.getElementById("cartList");
  const cartTotal = document.getElementById("cartTotal");
  const cartStatus = document.getElementById("cartStatus");
  const checkoutEmail = document.getElementById("checkoutEmail");
  const checkoutPhone = document.getElementById("checkoutPhone");
  const checkoutAddress = document.getElementById("checkoutAddress");
  const confirmCheckout = document.getElementById("confirmCheckout");
  const checkoutFeedback = document.getElementById("checkoutFeedback");
  const accountName = document.getElementById("accountName");
  const accountEmailDisplay = document.getElementById("accountEmailDisplay");
  const consentDataUse = document.getElementById("consentDataUse");
  const consentTransactional = document.getElementById("consentTransactional");

  function formatCents(value) {
    const amount = Number(value || 0) / 100;
    return amount.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  }

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

  function cartProducts() {
    return state.products.filter(function (product) {
      return state.cart.includes(product.id);
    });
  }

  function render() {
    const items = cartProducts();

    cartCount.textContent = String(state.cart.length);
    memberChip.classList.toggle("visible", state.owned.length > 0);

    if (!state.loggedIn) {
      loginWrap.hidden = false;
      checkoutWrap.classList.remove("visible");
      emptyWrap.classList.remove("visible");
      return;
    }

    loginWrap.hidden = true;
    accountName.textContent = state.name || "Cliente";
    accountEmailDisplay.textContent = state.email || "—";
    checkoutEmail.value = state.email || "";
    checkoutPhone.value = state.phone || "";

    if (!items.length) {
      checkoutWrap.classList.remove("visible");
      emptyWrap.classList.add("visible");
      return;
    }

    emptyWrap.classList.remove("visible");
    checkoutWrap.classList.add("visible");

    const total = items.reduce(function (sum, product) {
      return sum + Number(product.price_cents || 0);
    }, 0);

    cartList.innerHTML = items.map(function (product) {
      return `
        <div class="summary-item">
          <div class="summary-item-media">
            <img src="${productImage(product.id)}" alt="${product.name}">
          </div>
          <div>
            <h3 class="summary-item-title">${product.name}</h3>
            <p class="summary-item-copy">${product.tag}</p>
            <a class="summary-item-copy" href="${productHref(product.id)}">Ver produto</a>
          </div>
          <div class="summary-item-side">
            <strong>${product.price_label || product.priceLabel}</strong>
            <button class="remove-btn" type="button" data-remove-product="${product.id}">Remover</button>
          </div>
        </div>
      `;
    }).join("");

    cartTotal.textContent = formatCents(total);
    cartStatus.textContent = "Pedido montado e pronto para seguir.";
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

  async function removeFromCart(productId) {
    const result = await fetchJson("/api/loja-cart", {
      method: "POST",
      body: JSON.stringify({
        action: "remove",
        productId,
      }),
    });

    applyBootstrap(result.data);
  }

  async function clearCart() {
    const products = cartProducts();
    for (const product of products) {
      const result = await fetchJson("/api/loja-cart", {
        method: "POST",
        body: JSON.stringify({
          action: "remove",
          productId: product.id,
        }),
      });
      applyBootstrap(result.data);
    }
  }

  async function logout() {
    const result = await fetchJson("/api/loja-logout", {
      method: "POST",
      body: JSON.stringify({}),
    });
    applyBootstrap(result.data);
  }

  async function submitCheckout() {
    if (!checkoutEmail.value.trim() || !checkoutPhone.value.trim() || !checkoutAddress.value.trim()) {
      checkoutFeedback.textContent = "Preencha e-mail, contato operacional e endereço para continuar.";
      return;
    }

    if (!consentDataUse.checked || !consentTransactional.checked) {
      checkoutFeedback.textContent = "Confirme as autorizações para seguir para o pagamento.";
      return;
    }

    const selectedPayment = document.querySelector('input[name="paymentMethod"]:checked');
    if (!selectedPayment) {
      checkoutFeedback.textContent = "Escolha a forma de pagamento para continuar.";
      return;
    }

    const result = await fetchJson("/api/loja-checkout", {
      method: "POST",
      body: JSON.stringify({
        customer: {
          email: checkoutEmail.value.trim(),
          phone: checkoutPhone.value.trim(),
          address: checkoutAddress.value.trim(),
        },
        consents: {
          dataUse: consentDataUse.checked,
          transactionalEmail: consentTransactional.checked,
        },
        paymentMethod: selectedPayment.value,
      }),
    });

    applyBootstrap(result.data);
    window.location.href = "/loja/membros.html";
  }

  loginButton.addEventListener("click", function () {
    loginFeedback.textContent = "";
    submitAuth().catch(function (error) {
      loginFeedback.textContent = error.message || "Não foi possível continuar agora.";
    });
  });

  loginTab.addEventListener("click", function () {
    setAuthMode("login");
  });

  signupTab.addEventListener("click", function () {
    setAuthMode("signup");
  });

  cartList.addEventListener("click", function (event) {
    const removeButton = event.target.closest("[data-remove-product]");
    if (!removeButton) return;

    removeFromCart(removeButton.getAttribute("data-remove-product")).catch(function (error) {
      checkoutFeedback.textContent = error.message || "Não foi possível atualizar o carrinho.";
    });
  });

  confirmCheckout.addEventListener("click", function () {
    checkoutFeedback.textContent = "";
    submitCheckout().catch(function (error) {
      checkoutFeedback.textContent = error.message || "Não foi possível continuar com a compra.";
    });
  });

  document.getElementById("searchToggle").addEventListener("click", function () {
    window.location.href = "/loja";
  });

  document.getElementById("loginToggle").addEventListener("click", function () {
    if (state.loggedIn) {
      window.location.href = "/loja/membros.html";
      return;
    }
    loginEmail.focus();
  });

  document.getElementById("cartToggle").addEventListener("click", function () {
    window.location.href = "/loja/carrinho.html";
  });

  document.getElementById("clearCartButton").addEventListener("click", function () {
    clearCart().catch(function (error) {
      checkoutFeedback.textContent = error.message || "Não foi possível limpar o carrinho.";
    });
  });

  document.getElementById("logoutButton").addEventListener("click", function () {
    logout().catch(function (error) {
      checkoutFeedback.textContent = error.message || "Não foi possível sair da conta.";
    });
  });

  document.getElementById("emptyShopping").addEventListener("click", function () {
    window.location.href = "/loja";
  });

  loadBootstrap().catch(function (error) {
    console.error(error);
    loginFeedback.textContent = error.message || "Não foi possível carregar o carrinho.";
  });

  setAuthMode("login");
})();
