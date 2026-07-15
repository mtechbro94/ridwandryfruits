// --- APPLICATION CONFIGURATION ---
const SHOP_CONFIG = {
  whatsappNumber: "919906999999", // CHANGE THIS to owner's actual WhatsApp number (with country code, no +)
  deliveryChargeThreshold: 1500,  // Free shipping above ₹1500
  standardDeliveryCharge: 80,      // Flat rate under threshold
  orderLogEndpoint: "",            // Optional: Google Sheet Apps Script Web App URL for order logging
};

// --- GLOBAL STATE ---
let cart = [];
let activeCategory = "all";
let searchQuery = "";
let sortOption = "featured";

// --- INITIALIZATION ---
document.addEventListener("DOMContentLoaded", () => {
  initCart();
  initRouter();
  initEventListeners();
  renderProducts();
  renderCart();
  updateCartBadge();
});

// --- ROUTER SYSTEM ---
function initRouter() {
  const handleRoute = () => {
    let hash = window.location.hash || "#home";
    
    // Normalize hash
    if (!["#home", "#shop", "#purity", "#about", "#contact"].includes(hash)) {
      hash = "#home";
    }

    // Toggle active sections
    document.querySelectorAll(".view-section").forEach(section => {
      section.classList.remove("active");
    });
    
    const targetSection = document.querySelector(`${hash}-view`);
    if (targetSection) {
      targetSection.classList.add("active");
    }

    // Update Nav Links
    document.querySelectorAll(".nav-links a").forEach(link => {
      if (link.getAttribute("href") === hash) {
        link.classList.add("active");
      } else {
        link.classList.remove("active");
      }
    });

    // Mobile nav close
    const nav = document.getElementById("main-nav");
    if (nav) {
      nav.classList.remove("mobile-active");
    }

    // Scroll to top
    window.scrollTo({ top: 0, behavior: "smooth" });
    
    // Extra page-specific logic
    if (hash === "#purity") {
      resetPuritySimulation();
    }
  };

  window.addEventListener("hashchange", handleRoute);
  handleRoute(); // Execute once on load
}

// --- EVENT LISTENERS ---
function initEventListeners() {
  // Mobile menu toggle
  const menuBtn = document.getElementById("menu-toggle");
  const nav = document.getElementById("main-nav");
  if (menuBtn && nav) {
    menuBtn.addEventListener("click", () => {
      nav.classList.toggle("mobile-active");
    });
  }

  // Cart Drawer open/close
  const cartToggle = document.getElementById("cart-toggle");
  const cartClose = document.getElementById("cart-close");
  const cartOverlay = document.getElementById("cart-overlay");
  
  if (cartToggle) {
    cartToggle.addEventListener("click", openCartDrawer);
  }
  if (cartClose) {
    cartClose.addEventListener("click", closeCartDrawer);
  }
  if (cartOverlay) {
    cartOverlay.addEventListener("click", closeCartDrawer);
  }

  // Category filters (Desktop & Mobile)
  document.querySelectorAll(".filter-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
      e.target.classList.add("active");
      activeCategory = e.target.getAttribute("data-category");
      renderProducts();
    });
  });

  // Sort Selector
  const sortSelect = document.getElementById("sort-products");
  if (sortSelect) {
    sortSelect.addEventListener("change", (e) => {
      sortOption = e.target.value;
      renderProducts();
    });
  }

  // Search Input
  const searchInput = document.getElementById("search-input");
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      searchQuery = e.target.value.toLowerCase().trim();
      renderProducts();
    });
  }

  // Checkout toggle form
  const checkoutToggle = document.getElementById("checkout-toggle-btn");
  const checkoutForm = document.getElementById("checkout-form");
  if (checkoutToggle && checkoutForm) {
    checkoutToggle.addEventListener("click", () => {
      checkoutForm.classList.toggle("active");
      if (checkoutForm.classList.contains("active")) {
        checkoutToggle.innerText = "Hide Shipping Form";
        // Scroll to form inside body
        document.getElementById("cart-body").scrollTo({
          top: checkoutForm.offsetTop,
          behavior: "smooth"
        });
      } else {
        checkoutToggle.innerText = "Proceed to Checkout";
      }
    });
  }

  // Payment Option Cards
  document.querySelectorAll(".pay-option-card").forEach(card => {
    card.addEventListener("click", (e) => {
      const targetCard = e.currentTarget;
      document.querySelectorAll(".pay-option-card").forEach(c => c.classList.remove("selected"));
      targetCard.classList.add("selected");
      
      const paymentMethod = targetCard.getAttribute("data-method");
      document.getElementById("selected-payment-method").value = paymentMethod;
      
      // Update checkout button text based on method
      const submitBtn = document.getElementById("submit-order-btn");
      if (paymentMethod === "whatsapp") {
        submitBtn.innerHTML = '<span class="fab fa-whatsapp"></span> Send Order via WhatsApp';
        submitBtn.style.backgroundColor = "#25d366";
      } else if (paymentMethod === "razorpay") {
        submitBtn.innerHTML = 'Pay Online via Razorpay';
        submitBtn.style.backgroundColor = "#0c2b64";
      } else {
        submitBtn.innerHTML = 'Confirm Order (COD)';
        submitBtn.style.backgroundColor = "var(--primary-green)";
      }
    });
  });

  // Submit Order Form
  const orderForm = document.getElementById("order-details-form");
  if (orderForm) {
    orderForm.addEventListener("submit", (e) => {
      e.preventDefault();
      processCheckout();
    });
  }

  // Close Product Details Modal
  const modalClose = document.getElementById("modal-close");
  const modalOverlay = document.getElementById("modal-overlay");
  if (modalClose) modalClose.addEventListener("click", closeModal);
  if (modalOverlay) {
    modalOverlay.addEventListener("click", (e) => {
      if (e.target === modalOverlay) closeModal();
    });
  }

  // Saffron purity simulation trigger
  const runSimBtn = document.getElementById("run-purity-sim");
  if (runSimBtn) {
    runSimBtn.addEventListener("click", runPuritySimulation);
  }
}

// --- CART LOGIC ---
function initCart() {
  const localCart = localStorage.getItem("ridwan_cart");
  if (localCart) {
    try {
      cart = JSON.parse(localCart);
    } catch (e) {
      cart = [];
    }
  }
}

function saveCart() {
  localStorage.setItem("ridwan_cart", JSON.stringify(cart));
  updateCartBadge();
  renderCart();
}

function addToCart(productId, weightOptionIndex, quantity = 1) {
  const product = PRODUCTS.find(p => p.id === productId);
  if (!product) return;

  const option = product.options[weightOptionIndex];
  // Composite Key: product-id + weight (so Saffron 1g and 5g are separate items)
  const cartItemId = `${productId}_${option.weight.replace(/\s+/g, '-').toLowerCase()}`;

  const existingItemIndex = cart.findIndex(item => item.cartItemId === cartItemId);

  if (existingItemIndex > -1) {
    cart[existingItemIndex].quantity += quantity;
  } else {
    cart.push({
      cartItemId,
      id: product.id,
      name: product.name,
      image: product.image,
      weight: option.weight,
      price: option.price,
      quantity: quantity
    });
  }

  saveCart();
  openCartDrawer();
  
  // Quick animation notification on badge
  const badge = document.getElementById("cart-badge");
  if (badge) {
    badge.style.transform = "scale(1.3)";
    setTimeout(() => {
      badge.style.transform = "scale(1)";
    }, 200);
  }
}

function updateQuantity(cartItemId, delta) {
  const itemIndex = cart.findIndex(item => item.cartItemId === cartItemId);
  if (itemIndex > -1) {
    cart[itemIndex].quantity += delta;
    if (cart[itemIndex].quantity <= 0) {
      cart.splice(itemIndex, 1);
    }
    saveCart();
  }
}

function removeFromCart(cartItemId) {
  cart = cart.filter(item => item.cartItemId !== cartItemId);
  saveCart();
}

function updateCartBadge() {
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const badges = document.querySelectorAll(".cart-badge");
  badges.forEach(badge => {
    badge.innerText = totalItems;
    badge.style.display = totalItems > 0 ? "flex" : "none";
  });
}

function openCartDrawer() {
  document.getElementById("cart-overlay").style.display = "block";
  setTimeout(() => {
    document.getElementById("cart-drawer").classList.add("open");
  }, 10);
}

function closeCartDrawer() {
  document.getElementById("cart-drawer").classList.remove("open");
  setTimeout(() => {
    document.getElementById("cart-overlay").style.display = "none";
  }, 300);
}

// --- RENDER FUNCTIONS ---

// Render Shop Product Cards
function renderProducts() {
  const container = document.getElementById("shop-products-grid");
  if (!container) return;

  // Filter
  let filtered = PRODUCTS.filter(p => {
    const matchesCategory = activeCategory === "all" || p.category === activeCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery) || 
                          p.shortDescription.toLowerCase().includes(searchQuery) ||
                          p.tagline.toLowerCase().includes(searchQuery);
    return matchesCategory && matchesSearch;
  });

  // Sort
  if (sortOption === "price-low") {
    filtered.sort((a, b) => a.options[0].price - b.options[0].price);
  } else if (sortOption === "price-high") {
    // Sort by largest option price
    filtered.sort((a, b) => b.options[b.options.length - 1].price - a.options[a.options.length - 1].price);
  } else if (sortOption === "alphabetical") {
    filtered.sort((a, b) => a.name.localeCompare(b.name));
  } // Featured leaves it as configured in products.js

  // Update counter
  const resultsCounter = document.getElementById("shop-results-count");
  if (resultsCounter) {
    resultsCounter.innerText = `Showing ${filtered.length} products`;
  }

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="cart-empty-state" style="grid-column: 1/-1;">
        <div class="cart-empty-icon">🔍</div>
        <h4>No products found</h4>
        <p>Try resetting filters or checking your search query.</p>
      </div>
    `;
    return;
  }

  // Populate Grid HTML
  container.innerHTML = filtered.map(p => {
    // Generate Weight Select Dropdown Options
    const selectOptions = p.options.map((opt, index) => 
      `<option value="${index}">Size: ${opt.weight} — ₹${opt.price.toLocaleString('en-IN')}</option>`
    ).join('');

    const lowStockTag = p.stockStatus === "low-stock" ? `<span class="badge-tag low-stock">Low Stock</span>` : '';

    return `
      <div class="product-card" id="card-${p.id}">
        <div class="product-img-wrapper" onclick="openProductDetails('${p.id}')">
          ${lowStockTag}
          <img src="${p.image}" alt="${p.name}">
        </div>
        <div class="product-card-body">
          <div class="product-card-tagline">${p.tagline}</div>
          <h3 class="product-card-title" onclick="openProductDetails('${p.id}')">${p.name}</h3>
          <p class="product-card-desc">${p.shortDescription}</p>
          
          <div class="product-selector-group">
            <label for="select-${p.id}">Choose Pack Size</label>
            <select id="select-${p.id}" class="weight-selector-dropdown" onchange="updateCardPrice('${p.id}')">
              ${selectOptions}
            </select>
          </div>
          
          <div class="product-card-footer">
            <div class="product-price-box">
              <span class="price-label">Price</span>
              <span class="price-value" id="price-display-${p.id}">₹${p.options[0].price.toLocaleString('en-IN')}</span>
            </div>
            <button class="btn btn-primary" style="padding: 10px 16px; font-size: 0.9rem;" onclick="addCardToCart('${p.id}')">
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');
  
  // Also update Home Featured Section if we're rendering it
  renderHomeFeatured();
}

// Dynamically update the price displayed on the product card when selecting a different weight
window.updateCardPrice = function(productId) {
  const product = PRODUCTS.find(p => p.id === productId);
  const selector = document.getElementById(`select-${productId}`);
  const priceDisplay = document.getElementById(`price-display-${productId}`);
  
  if (product && selector && priceDisplay) {
    const selectedOption = product.options[selector.value];
    priceDisplay.innerText = `₹${selectedOption.price.toLocaleString('en-IN')}`;
  }
};

// Handler for Add to Cart button on Card
window.addCardToCart = function(productId) {
  const selector = document.getElementById(`select-${productId}`);
  const optionIndex = parseInt(selector.value);
  addToCart(productId, optionIndex);
};

// Render Featured Section on Home Page (takes first 3 items)
function renderHomeFeatured() {
  const container = document.getElementById("featured-products-grid");
  if (!container) return;

  const featured = PRODUCTS.slice(0, 3);
  container.innerHTML = featured.map(p => {
    return `
      <div class="product-card">
        <div class="product-img-wrapper" onclick="openProductDetails('${p.id}')">
          <img src="${p.image}" alt="${p.name}">
        </div>
        <div class="product-card-body">
          <div class="product-card-tagline">${p.tagline}</div>
          <h3 class="product-card-title" onclick="openProductDetails('${p.id}')">${p.name}</h3>
          <p class="product-card-desc">${p.shortDescription}</p>
          <div class="product-card-footer">
            <div class="product-price-box">
              <span class="price-label">Starting at</span>
              <span class="price-value">₹${p.options[0].price.toLocaleString('en-IN')}</span>
            </div>
            <button class="btn btn-secondary" onclick="openProductDetails('${p.id}')">
              View Details
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// Render Cart items in drawer
function renderCart() {
  const container = document.getElementById("cart-items-container");
  const checkoutSection = document.getElementById("cart-checkout-section");
  const checkoutToggle = document.getElementById("checkout-toggle-btn");
  const checkoutForm = document.getElementById("checkout-form");
  
  if (!container) return;

  if (cart.length === 0) {
    container.innerHTML = `
      <div class="cart-empty-state">
        <div class="cart-empty-icon">🛒</div>
        <h4>Your Cart is Empty</h4>
        <p>Explore our organic Kashmiri collection and add products to your cart.</p>
        <a href="#shop" class="btn btn-primary" onclick="closeCartDrawer()">Shop Now</a>
      </div>
    `;
    if (checkoutSection) checkoutSection.classList.remove("visible");
    if (checkoutForm) {
      checkoutForm.classList.remove("active");
      checkoutToggle.innerText = "Proceed to Checkout";
    }
    return;
  }

  // Populate list
  container.innerHTML = `
    <div class="cart-items-list">
      ${cart.map(item => `
        <div class="cart-item">
          <div class="cart-item-img">
            <img src="${item.image}" alt="${item.name}">
          </div>
          <div class="cart-item-details">
            <h5 class="cart-item-name">${item.name}</h5>
            <div class="cart-item-weight">${item.weight}</div>
            <div class="cart-item-price">₹${(item.price * item.quantity).toLocaleString('en-IN')}</div>
            <div class="cart-item-controls">
              <div class="qty-counter">
                <span class="qty-btn" onclick="updateQuantity('${item.cartItemId}', -1)">-</span>
                <span class="qty-value">${item.quantity}</span>
                <span class="qty-btn" onclick="updateQuantity('${item.cartItemId}', 1)">+</span>
              </div>
              <span class="cart-item-remove" onclick="removeFromCart('${item.cartItemId}')">Remove</span>
            </div>
          </div>
        </div>
      `).join('')}
    </div>
  `;

  // Calculate prices
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const delivery = subtotal >= SHOP_CONFIG.deliveryChargeThreshold ? 0 : SHOP_CONFIG.standardDeliveryCharge;
  const grandTotal = subtotal + delivery;

  // Render totals panel
  document.getElementById("cart-subtotal").innerText = `₹${subtotal.toLocaleString('en-IN')}`;
  
  const deliveryEl = document.getElementById("cart-delivery");
  if (delivery === 0) {
    deliveryEl.innerText = "FREE";
    deliveryEl.style.color = "var(--primary-green)";
  } else {
    deliveryEl.innerText = `₹${delivery}`;
    deliveryEl.style.color = "inherit";
  }
  
  document.getElementById("cart-grand-total").innerText = `₹${grandTotal.toLocaleString('en-IN')}`;

  if (checkoutSection) checkoutSection.classList.add("visible");
}

// --- PRODUCT DETAILS MODAL ---
window.openProductDetails = function(productId) {
  const product = PRODUCTS.find(p => p.id === productId);
  if (!product) return;

  const modal = document.getElementById("modal-overlay");
  
  // Details table rendering
  const detailsHtml = `
    <tr><td class="spec-name">Origin</td><td class="spec-value">${product.details.origin}</td></tr>
    <tr><td class="spec-name">Grade / Selection</td><td class="spec-value">${product.details.grade}</td></tr>
    <tr><td class="spec-name">Harvesting Period</td><td class="spec-value">${product.details.harvestDate}</td></tr>
    <tr><td class="spec-name">Packaging</td><td class="spec-value">${product.details.packaging}</td></tr>
    <tr><td class="spec-name">Recommended Usage</td><td class="spec-value">${product.details.usage}</td></tr>
  `;

  // Options rendering
  const optionsHtml = product.options.map((opt, index) => 
    `<option value="${index}">Size: ${opt.weight} — ₹${opt.price.toLocaleString('en-IN')}</option>`
  ).join('');

  // Saffron Trust Note
  let trustBannerHtml = '';
  if (product.category === 'saffron') {
    trustBannerHtml = `
      <div style="background-color: #fff9e6; border: 1px solid #ffe8a1; padding: 12px; border-radius: var(--border-radius-sm); margin-bottom: 1.5rem; display: flex; align-items: flex-start; gap: 10px;">
        <span style="color: var(--saffron-gold-dark); font-size: 1.25rem; font-weight: bold; line-height: 1;">✓</span>
        <p style="font-size: 0.8rem; margin: 0; color: #784803; line-height: 1.4;">
          <strong>Kashmiri Saffron Promise:</strong> Tested for purity. Free from colorants or fillers. Certified 100% Mongra. <a href="#purity" onclick="closeModal()" style="text-decoration: underline; font-weight: 600;">Learn how to test at home.</a>
        </p>
      </div>
    `;
  }

  // Populate HTML
  document.getElementById("modal-product-image").src = product.image;
  document.getElementById("modal-product-image").alt = product.name;
  document.getElementById("modal-title").innerText = product.name;
  document.getElementById("modal-tagline").innerText = product.tagline;
  document.getElementById("modal-desc").innerText = product.description;
  document.getElementById("modal-specs-body").innerHTML = detailsHtml;
  document.getElementById("modal-weight-selector").innerHTML = optionsHtml;
  document.getElementById("modal-trust-banner-container").innerHTML = trustBannerHtml;

  // Add stock tags
  const stockBox = document.getElementById("modal-stock-text");
  stockBox.innerText = product.stockText;
  if (product.stockStatus === 'low-stock') {
    stockBox.style.color = '#c0392b';
  } else {
    stockBox.style.color = 'var(--primary-green)';
  }

  // Set selected product ID on add button
  const addBtn = document.getElementById("modal-add-to-cart-btn");
  addBtn.setAttribute("data-id", product.id);
  
  // Set default initial price
  updateModalPrice(product);

  // Set onchange handler for weight selection
  const weightSelect = document.getElementById("modal-weight-selector");
  weightSelect.onchange = () => updateModalPrice(product);

  // Bind add btn click
  addBtn.onclick = () => {
    const optIdx = parseInt(weightSelect.value);
    addToCart(product.id, optIdx);
    closeModal();
  };

  // Show
  modal.style.display = "flex";
  document.body.style.overflow = "hidden"; // Prevent backpage scrolling
};

function updateModalPrice(product) {
  const select = document.getElementById("modal-weight-selector");
  const priceDisplay = document.getElementById("modal-price-value");
  if (select && priceDisplay) {
    const selectedOption = product.options[select.value];
    priceDisplay.innerText = `₹${selectedOption.price.toLocaleString('en-IN')}`;
  }
}

function closeModal() {
  document.getElementById("modal-overlay").style.display = "none";
  document.body.style.overflow = "auto";
}

// --- CHECKOUT PROCESSORS ---

// Submits order parameters asynchronously to Google Sheets Web App
function submitOrderToBackend(paymentMethod, name, phone, address) {
  if (!SHOP_CONFIG.orderLogEndpoint) return; // Fail silent if no sheet setup

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const delivery = subtotal >= SHOP_CONFIG.deliveryChargeThreshold ? 0 : SHOP_CONFIG.standardDeliveryCharge;
  const grandTotal = subtotal + delivery;

  const orderData = {
    timestamp: new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
    name: name,
    phone: phone,
    address: address,
    paymentMethod: paymentMethod,
    items: cart.map(item => `${item.name} (${item.weight}) x ${item.quantity} [₹${item.price * item.quantity}]`).join("; "),
    subtotal: subtotal,
    deliveryCharge: delivery,
    grandTotal: grandTotal
  };

  fetch(SHOP_CONFIG.orderLogEndpoint, {
    method: "POST",
    mode: "no-cors", // Workaround to run fire-and-forget without CORS preflight block
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(orderData)
  })
  .then(() => console.log("Order logged successfully in background Sheets API."))
  .catch(err => console.error("Error logging order backend:", err));
}

function processCheckout() {
  const name = document.getElementById("cust-name").value.trim();
  const phone = document.getElementById("cust-phone").value.trim();
  const address = document.getElementById("cust-address").value.trim();
  const paymentMethod = document.getElementById("selected-payment-method").value;

  if (!name || !phone || !address) {
    alert("Please fill out all delivery information fields.");
    return;
  }

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const delivery = subtotal >= SHOP_CONFIG.deliveryChargeThreshold ? 0 : SHOP_CONFIG.standardDeliveryCharge;
  const grandTotal = subtotal + delivery;

  if (paymentMethod === "whatsapp") {
    // Generate WhatsApp Order Message
    const orderItemsText = cart.map(item => 
      `- ${item.name} (${item.weight}) x ${item.quantity} - ₹${(item.price * item.quantity).toLocaleString('en-IN')}`
    ).join("\n");

    const message = `*New Order - Ridwan DryFruits*\n` +
      `---------------------------------\n` +
      `*Customer Details:*\n` +
      `👤 Name: ${name}\n` +
      `📞 Phone: ${phone}\n` +
      `📍 Delivery Address: ${address}\n\n` +
      `*Order Details:*\n` +
      `${orderItemsText}\n\n` +
      `---------------------------------\n` +
      `*Subtotal:* ₹${subtotal.toLocaleString('en-IN')}\n` +
      `*Delivery Charge:* ${delivery === 0 ? "FREE" : `₹${delivery}`}\n` +
      `*Grand Total:* ₹${grandTotal.toLocaleString('en-IN')}\n` +
      `*Payment Mode:* Cash On Delivery / Direct Transfer\n` +
      `---------------------------------\n` +
      `Please confirm my order and share delivery updates. Thank you!`;

    const encodedText = encodeURIComponent(message);
    const waUrl = `https://wa.me/${SHOP_CONFIG.whatsappNumber}?text=${encodedText}`;
    
    // Log to Google Sheet backend before clearing cart
    submitOrderToBackend("WhatsApp Redirect / COD", name, phone, address);

    // Clear cart and redirect
    cart = [];
    saveCart();
    closeCartDrawer();
    
    // Open WhatsApp
    window.open(waUrl, "_blank");
    
    alert("Thank you! Your order message has been generated. Sending you to WhatsApp to confirm with Ridwan DryFruits.");
    
  } else if (paymentMethod === "razorpay") {
    // Show Razorpay mock portal
    openRazorpayMock(grandTotal, name, phone);
  } else if (paymentMethod === "cod") {
    // Log to Google Sheet backend before clearing cart
    submitOrderToBackend("Cash on Delivery (COD)", name, phone, address);
    
    // Standard COD Success Flow
    alert(`Order Placed Successfully! (Cash on Delivery)\n\nThank you, ${name}. Your order total is ₹${grandTotal.toLocaleString('en-IN')}. We will crack your premium dry fruits and ship them shortly to:\n${address}`);
    
    cart = [];
    saveCart();
    closeCartDrawer();
    window.location.hash = "#home";
  }
}

// --- RAZORPAY MODAL SIMULATION ---
function openRazorpayMock(amount, name, phone) {
  const overlay = document.getElementById("rpay-overlay");
  const modalBody = document.getElementById("rpay-modal-body");
  
  // Set Amount Display
  document.getElementById("rpay-total-val").innerText = `₹${amount.toLocaleString('en-IN')}`;

  // Reset Modal state to payment methods selection
  modalBody.innerHTML = `
    <div class="rpay-simulation-step active" id="rpay-step-select">
      <p class="rpay-section-title">Select Payment Method</p>
      <div class="rpay-payment-methods">
        <div class="rpay-method-row" onclick="selectRpayMethod('UPI')">
          <div class="rpay-method-icon">📱</div>
          <div class="rpay-method-text">
            <h6>UPI - GPay / PhonePe / Paytm</h6>
            <p>Instant transfer using any UPI app</p>
          </div>
        </div>
        <div class="rpay-method-row" onclick="selectRpayMethod('Card')">
          <div class="rpay-method-icon">💳</div>
          <div class="rpay-method-text">
            <h6>Visa, Mastercard, RuPay, Maestro</h6>
            <p>Pay securely using credit or debit cards</p>
          </div>
        </div>
        <div class="rpay-method-row" onclick="selectRpayMethod('Netbanking')">
          <div class="rpay-method-icon">🏛️</div>
          <div class="rpay-method-text">
            <h6>Netbanking</h6>
            <p>All major Indian banks available</p>
          </div>
        </div>
      </div>
    </div>
    
    <div class="rpay-simulation-step" id="rpay-step-processing">
      <div class="rpay-loader"></div>
      <h5>Processing Payment...</h5>
      <p style="font-size: 0.8rem; color: #6b7280; margin-top: 5px;">Do not click back button or refresh the window.</p>
    </div>
    
    <div class="rpay-simulation-step" id="rpay-step-success">
      <div class="rpay-success-icon">✓</div>
      <h4 style="color: #10b981; font-weight: 700; margin-bottom: 8px;">Payment Successful!</h4>
      <p style="font-size: 0.85rem; color: #4b5563;">Order ID: <strong>RDP-${Math.floor(100000 + Math.random() * 900000)}</strong></p>
      <p style="font-size: 0.75rem; color: #9ca3af; margin-top: 15px;">Your invoice and shipping receipt will be shared shortly.</p>
      <button class="btn btn-primary" style="margin-top: 20px; width: 100%; border-radius: 4px; padding: 10px 0;" onclick="closeRpayMockSuccess()">Return to Store</button>
    </div>
  `;

  overlay.style.display = "flex";
}

window.selectRpayMethod = function(methodName) {
  // Hide select methods step
  document.getElementById("rpay-step-select").classList.remove("active");
  // Show processing loader
  const procStep = document.getElementById("rpay-step-processing");
  procStep.classList.add("active");
  procStep.querySelector("h5").innerText = `Connecting to ${methodName} Secure Gateway...`;

  // Simulate payment processing delay
  setTimeout(() => {
    procStep.classList.remove("active");
    document.getElementById("rpay-step-success").classList.add("active");
  }, 2500);
};

window.closeRpayMock = function() {
  const overlay = document.getElementById("rpay-overlay");
  if (confirm("Are you sure you want to cancel the payment? Your order will not be completed.")) {
    overlay.style.display = "none";
  }
};

window.closeRpayMockSuccess = function() {
  document.getElementById("rpay-overlay").style.display = "none";
  
  // Submit order log in background before clearing cart
  const name = document.getElementById("cust-name").value.trim();
  const phone = document.getElementById("cust-phone").value.trim();
  const address = document.getElementById("cust-address").value.trim();
  submitOrderToBackend("Razorpay Online", name, phone, address);

  // Clear cart, close drawer, redirect home
  cart = [];
  saveCart();
  closeCartDrawer();
  window.location.hash = "#home";
};

// --- SAFFRON PURITY SIMULATOR ---
let simTimeout1, simTimeout2, simTimeout3;

function resetPuritySimulation() {
  // Clear any active timeouts
  clearTimeout(simTimeout1);
  clearTimeout(simTimeout2);
  clearTimeout(simTimeout3);

  const pureBeaker = document.getElementById("beaker-pure");
  const fakeBeaker = document.getElementById("beaker-fake");
  const pureStatus = document.getElementById("pure-status-lbl");
  const fakeStatus = document.getElementById("fake-status-lbl");
  const button = document.getElementById("run-purity-sim");

  if (pureBeaker && fakeBeaker && pureStatus && fakeStatus && button) {
    // Reset classes
    pureBeaker.className = "beaker";
    fakeBeaker.className = "beaker";
    
    // Reset background styles
    const pureFluid = pureBeaker.querySelector(".beaker-fluid-pure");
    const fakeFluid = fakeBeaker.querySelector(".beaker-fluid-fake");
    if (pureFluid) pureFluid.className = "beaker-fluid-pure";
    if (fakeFluid) fakeFluid.className = "beaker-fluid-fake";

    // Hide labels
    pureStatus.style.opacity = "0";
    fakeStatus.style.opacity = "0";

    // Reset button
    button.innerText = "Start Purity Test Simulation";
    button.disabled = false;
    button.style.opacity = "1";
    button.style.cursor = "pointer";
  }
}

function runPuritySimulation() {
  const pureBeaker = document.getElementById("beaker-pure");
  const fakeBeaker = document.getElementById("beaker-fake");
  const pureFluid = pureBeaker.querySelector(".beaker-fluid-pure");
  const fakeFluid = fakeBeaker.querySelector(".beaker-fluid-fake");
  const pureStatus = document.getElementById("pure-status-lbl");
  const fakeStatus = document.getElementById("fake-status-lbl");
  const button = document.getElementById("run-purity-sim");

  // Disable button
  button.innerText = "Testing in Progress...";
  button.disabled = true;
  button.style.opacity = "0.6";
  button.style.cursor = "not-allowed";

  // Step 1: Drop threads
  pureBeaker.classList.add("dropping-threads");
  fakeBeaker.classList.add("fake-dropping-threads");

  // Step 2: Release Color
  simTimeout1 = setTimeout(() => {
    pureFluid.classList.add("pure-color-release");
    fakeFluid.classList.add("fake-color-release");
  }, 1000);

  // Step 3: Show Adulterated results first (fast color dye release)
  simTimeout2 = setTimeout(() => {
    fakeStatus.style.opacity = "1";
  }, 3000);

  // Step 4: Show Pure Kashmiri Saffron results (slow golden release)
  simTimeout3 = setTimeout(() => {
    pureStatus.style.opacity = "1";
    button.innerText = "Reset Simulation";
    button.disabled = false;
    button.style.opacity = "1";
    button.style.cursor = "pointer";
    
    // Bind click to reset
    button.onclick = () => {
      resetPuritySimulation();
      button.onclick = runPuritySimulation;
    };
  }, 6000);
}
