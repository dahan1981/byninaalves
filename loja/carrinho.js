(function () {
  const state = {
    loggedIn: false,
    name: "",
    email: "",
    owned: [],
    cart: [],
    products: [],
    pendingProductId: null,
  };

  const memberChip = document.getElementById("memberChip");
  const cartCount = document.getElementById("cartCount");
  const loginWrap = document.getElementById("loginWrap");
  const checkoutWrap = document.getElementById("checkoutWrap");
  const emptyWrap = document.getElementById("emptyWrap");
  const loginName = document.getElementById("loginName");
  const loginEmail = document.getElementById("loginEmail");
  const loginPassword = document.getElementById("loginPassword");
  const loginButton = document.getElementById("loginButton");
  const loginFeedback = document.getElementById("loginFeedback");
  const cartList = document.getElementById("cartList");
  const cartTotal = document.getElementById("cartTotal");
  const cartStatus = document.getElementById("cartStatus");
  const checkoutEmail = document.getElementById("checkoutEmail");
  const checkoutPhone = document.getElementById("checkoutPhone");
  const checkoutAddress = document.getElementById("checkoutAddress");
  const consentDataUse = document.getElementById("consentDataUse");
  const consentTransactional = document.getElementById("consentTransactional");
  const confirmCheckout = document.getElementById("confirmCheckout");
  const checkoutFeedback = document.getElementById("checkoutFeedback");

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

  function applyBootstrap(data) {
    state.products = Array.isArray(data.products) ? data.products : [];
    state.loggedIn = Boolean(data.session);
    state.name = data.session ? data.session.name : "";
    state.email = data.session ? data.session.email : "";
    state.owned = Array.isArray(data.ownedProductIds) ? data.ownedProductIds : [];
    state.cart = Array.isArray(data.cartProductIds) ? data.cartProductIds : [];
    render();
  }

  function render() {
    cartCount.textContent = String(state.cart.length);
    memberChip.classList.toggle("visible", state.owned.length > 0);

    if (!state.loggedIn) {
      loginWrap.hidden = false;
      checkoutWrap.classList.remove("visible");
      emptyWrap.classList.remove("visible");
      return;
    }

    loginWrap.hidden = true;
    const cartProducts = state.products.filter(function (product) {
      return state.cart.includes(product.id);
    });

    if (!cartProducts.length) {
      checkoutWrap.classList.remove("visible");
      emptyWrap.classList.add("visible");
      return;
    }

    emptyWrap.classList.remove("visible");
    checkoutWrap.classList.add("visible");

    const total = cartProducts.reduce(function (sum, product) {
      return sum + Number(product.price_cents || 0);
    }, 0);

    cartList.innerHTML = cartProducts.map(function (product) {
      return `
        <div class="summary-item">
          <div>
            <strong>${product.name}</strong>
            <span>${product.tag}</span>
          </div>
          <strong>${product.price_label || product.priceLabel}</strong>
        </div>
      `;
    }).join("");

    cartTotal.textContent = formatCents(total);
    cartStatus.textContent = "Tudo pronto para seguir para o pagamento.";
    checkoutEmail.value = state.email || "";
  }

  async function loadBootstrap() {
    const result = await fetchJson("/api/loja-bootstrap", { method: "GET" });
    applyBootstrap(result.data);
  }

  async function submitLogin() {
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
    submitLogin().catch(function (error) {
      loginFeedback.textContent = error.message || "Não foi possível entrar agora.";
    });
  });

  confirmCheckout.addEventListener("click", function () {
    submitCheckout().catch(function (error) {
      checkoutFeedback.textContent = error.message || "Não foi possível continuar com a compra.";
    });
  });

  document.getElementById("searchToggle").addEventListener("click", function () {
    window.location.href = "/loja";
  });

  document.getElementById("loginToggle").addEventListener("click", function () {
    if (state.loggedIn && state.owned.length > 0) {
      window.location.href = "/loja/membros.html";
      return;
    }
    loginEmail.focus();
  });

  document.getElementById("cartToggle").addEventListener("click", function () {
    window.location.href = "/loja/carrinho.html";
  });

  document.getElementById("continueShopping").addEventListener("click", function () {
    window.location.href = "/loja";
  });

  document.getElementById("emptyShopping").addEventListener("click", function () {
    window.location.href = "/loja";
  });

  loadBootstrap().catch(function (error) {
    console.error(error);
    loginFeedback.textContent = error.message || "Não foi possível carregar o carrinho.";
  });
})();
