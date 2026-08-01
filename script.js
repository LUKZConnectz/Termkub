const AUTH_KEY = 'freal_boxser_user';
const ALERT_TIMEOUT = 4200;
const CART_KEY = 'freal_boxser_cart';
const ORDERS_KEY = 'freal_boxser_orders';
const PRODUCTS_KEY = 'freal_boxser_products';
const DONATE_KEY = 'freal_boxser_donations';
const THEME_KEY = 'freal_boxser_theme';
const USERS_KEY = 'freal_boxser_users';
const PRODUCT = { id: 'night-vision', name: 'Night Vision Goggles', description: 'อุปกรณ์มองกลางคืน เหมาะสำหรับภารกิจลับหรือดูแลเวลากลางคืน', price: 3500, stock: 4, featured: true };

function getUser() {
  try { return JSON.parse(localStorage.getItem(AUTH_KEY)); } catch { return null; }
}

function setUser(user) {
  localStorage.setItem(AUTH_KEY, JSON.stringify(user));
}

function refreshIcons(root = document) {
  if (window.lucide) window.lucide.createIcons({ attrs: { 'aria-hidden': 'true' }, root });
}

function ensureAlertRegion() {
  let region = document.querySelector('[data-alert-region]');
  if (!region) {
    region = document.createElement('div');
    region.className = 'alert-region';
    region.dataset.alertRegion = '';
    region.setAttribute('aria-live', 'polite');
    region.setAttribute('aria-relevant', 'additions');
    document.body.appendChild(region);
  }
  return region;
}

function escapeHTML(value) {
  return String(value).replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
}


function readList(key) {
  try { return JSON.parse(localStorage.getItem(key)) || []; } catch { return []; }
}

function writeList(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function getProducts() {
  const products = readList(PRODUCTS_KEY);
  return products.length ? products : Array.from({ length: 10 }, (_, index) => ({ ...PRODUCT, id: `${PRODUCT.id}-${index + 1}`, featured: index === 0 }));
}

function saveProducts(products) { writeList(PRODUCTS_KEY, products); }

function getUsers() { return readList(USERS_KEY); }
function saveUsers(users) { writeList(USERS_KEY, users); }
function findUser(username) { return getUsers().find((item) => String(item.username).toLowerCase() === String(username).toLowerCase()); }

function isAdmin(user = getUser()) { return user?.role === 'admin' || String(user?.username || '').toLowerCase() === 'admin'; }

function formatMoney(value) {
  return `฿ ${Number(value || 0).toFixed(2)}`;
}

function makeId() {
  return (crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`);
}

function addCartItem(product, quantity) {
  const cart = readList(CART_KEY);
  const current = cart.find((item) => item.id === product.id);
  if (current) current.quantity += quantity;
  else cart.push({ ...product, quantity });
  writeList(CART_KEY, cart);
}

function decrementStock(items) {
  const products = getProducts();
  items.forEach((item) => {
    const product = products.find((entry) => entry.id === item.id);
    if (product) product.stock = Math.max(Number(product.stock || 0) - Number(item.quantity || 0), 0);
  });
  saveProducts(products);
}

function createOrder(items) {
  const orders = readList(ORDERS_KEY);
  const order = {
    id: makeId(),
    transactionId: makeId(),
    createdAt: new Date().toISOString(),
    status: 'pending',
    items: items.map((item) => ({ ...item })),
  };
  orders.unshift(order);
  writeList(ORDERS_KEY, orders);
  return order;
}

function formatThaiDate(value) {
  const date = value ? new Date(value) : new Date();
  const buddhistYear = date.getFullYear() + 543;
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${buddhistYear} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

function showAlert({ title, message = '', type = 'success' }) {
  const region = ensureAlertRegion();
  const icons = { success: 'circle-check', error: 'circle-alert', info: 'info', warning: 'triangle-alert' };
  const alert = document.createElement('div');
  alert.className = `app-alert app-alert-${type}`;
  alert.setAttribute('role', type === 'error' ? 'alert' : 'status');
  alert.innerHTML = `
    <span class="alert-icon"><i data-lucide="${icons[type] || icons.info}"></i></span>
    <span class="alert-copy">
      <strong>${escapeHTML(title)}</strong>
      ${message ? `<small>${escapeHTML(message)}</small>` : ''}
    </span>
    <button class="alert-close" type="button" aria-label="ปิดแจ้งเตือน"><i data-lucide="x"></i></button>
  `;

  const close = () => {
    alert.classList.add('is-leaving');
    window.setTimeout(() => alert.remove(), 180);
  };

  alert.querySelector('.alert-close').addEventListener('click', close);
  region.appendChild(alert);
  refreshIcons(alert);
  window.setTimeout(close, ALERT_TIMEOUT);
}

function logout() {
  localStorage.removeItem(AUTH_KEY);
  window.location.href = 'login.html';
}

function requireAuth() {
  const user = getUser();
  if (!user) {
    window.location.href = 'login.html';
    return null;
  }
  document.querySelectorAll('[data-username]').forEach((el) => { el.textContent = user.displayName || user.username; });
  document.querySelectorAll('.admin-only').forEach((el) => { el.hidden = !isAdmin(user); });
  return user;
}


function applyTheme(theme = localStorage.getItem(THEME_KEY) || 'light') {
  document.body.classList.toggle('theme-dark', theme === 'dark');
  document.querySelectorAll('[data-theme-toggle]').forEach((button) => button.setAttribute('aria-pressed', theme === 'dark'));
}

function initChrome() {
  applyTheme();
  document.querySelectorAll('[data-theme-toggle]').forEach((button) => button.addEventListener('click', () => {
    const theme = document.body.classList.contains('theme-dark') ? 'light' : 'dark';
    localStorage.setItem(THEME_KEY, theme);
    applyTheme(theme);
  }));
  const page = document.body.dataset.page;
  document.querySelectorAll(`[data-nav="${page}"]`).forEach((link) => link.classList.add('is-active'));
  const count = readList(CART_KEY).reduce((sum, item) => sum + Number(item.quantity || 1), 0);
  document.querySelectorAll('[data-cart-count]').forEach((el) => { el.textContent = count; el.hidden = count === 0; });
}

function initLogin() {
  const form = document.querySelector('[data-login-form]');
  const error = document.querySelector('[data-login-error]');
  if (!form) return;

  if (getUser()) {
    window.location.href = 'index.html';
    return;
  }

  const showLoginError = (message) => {
    error.textContent = message;
    error.hidden = false;
    showAlert({ title: 'เข้าสู่ระบบไม่สำเร็จ', message, type: 'error' });
  };

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const username = String(formData.get('username') || '').trim();
    const password = String(formData.get('password') || '').trim();

    if (!username || !password) {
      showLoginError('กรุณากรอกชื่อผู้ใช้และรหัสผ่าน');
      return;
    }

    const users = getUsers();
    const existing = findUser(username);

    if (existing) {
      if (existing.password !== password) {
        showLoginError('ชื่อผู้ใช้นี้มีอยู่แล้วและรหัสผ่านไม่ถูกต้อง');
        return;
      }
      existing.lastLogin = new Date().toISOString();
      saveUsers(users);
      setUser({ ...existing });
    } else {
      const newUser = {
        id: makeId(),
        username,
        password,
        role: username.toLowerCase() === 'admin' ? 'admin' : 'user',
        displayName: username,
        balance: 0,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
      };
      users.push(newUser);
      saveUsers(users);
      setUser({ ...newUser });
    }

    showAlert({ title: 'เข้าสู่ระบบสำเร็จ', message: `ยินดีต้อนรับ ${username}`, type: 'success' });
    window.setTimeout(() => { window.location.href = 'index.html'; }, 450);
  });
}

function initStore() {
  if (!requireAuth()) return;
  renderStoreProducts();
  const modal = document.querySelector('[data-product-modal]');
  if (!modal) return;

  const title = modal.querySelector('#modal-product-title');
  const description = modal.querySelector('[data-modal-description]');
  const priceEl = modal.querySelector('[data-modal-price]');
  const quantity = modal.querySelector('[data-quantity]');
  const remaining = modal.querySelector('[data-remaining]');
  const closeButtons = modal.querySelectorAll('[data-close-modal]');
  const grid = document.querySelector('.product-grid');
  const cartButton = modal.querySelector('[data-add-cart]');
  const orderButton = modal.querySelector('[data-order-now]');
  let currentProduct = null;

  const cartQuantityFor = (productId) => readList(CART_KEY).filter((item) => item.id === productId).reduce((sum, item) => sum + Number(item.quantity || 0), 0);

  const openModal = (productId) => {
    const product = getProducts().find((item) => item.id === productId);
    if (!product) return;
    currentProduct = product;
    const stock = Number(product.stock || 0);
    const availableNow = Math.max(stock - cartQuantityFor(product.id), 0);

    title.textContent = product.name;
    description.textContent = product.description;
    priceEl.textContent = formatMoney(product.price);
    remaining.textContent = stock;
    quantity.max = String(Math.max(availableNow, 1));
    quantity.value = availableNow > 0 ? '1' : '0';
    quantity.disabled = availableNow <= 0;
    cartButton.disabled = availableNow <= 0;
    orderButton.disabled = availableNow <= 0;

    modal.classList.add('is-open');
    modal.removeAttribute('aria-hidden');
    document.body.classList.add('modal-open');
    quantity.focus();
  };

  const closeModal = () => {
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
    currentProduct = null;
  };

  const getQuantity = () => Math.min(Math.max(Number(quantity.value) || 1, 1), Number(quantity.max) || 1);

  grid?.addEventListener('click', (event) => {
    const card = event.target.closest('[data-product-id]');
    if (!card) return;
    openModal(card.dataset.productId);
  });
  grid?.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    const card = event.target.closest('[data-product-id]');
    if (!card) return;
    event.preventDefault();
    openModal(card.dataset.productId);
  });

  quantity.addEventListener('input', () => { quantity.value = getQuantity(); });
  cartButton?.addEventListener('click', () => {
    if (!currentProduct) return;
    const stock = Number(currentProduct.stock || 0);
    const alreadyInCart = cartQuantityFor(currentProduct.id);
    const qty = getQuantity();
    if (alreadyInCart + qty > stock) {
      showAlert({ title: 'สินค้าไม่พอ', message: `เหลือในสต็อกอีก ${Math.max(stock - alreadyInCart, 0)} ชิ้น`, type: 'error' });
      return;
    }
    addCartItem(currentProduct, qty);
    showAlert({ title: 'เพิ่มลงตะกร้าแล้ว', message: `${currentProduct.name} จำนวน ${qty} ชิ้น`, type: 'success' });
    closeModal();
  });
  orderButton?.addEventListener('click', () => {
    if (!currentProduct) return;
    const stock = Number(currentProduct.stock || 0);
    const qty = getQuantity();
    if (qty > stock) {
      showAlert({ title: 'สินค้าไม่พอ', message: `เหลือในสต็อกอีก ${stock} ชิ้น`, type: 'error' });
      return;
    }
    createOrder([{ ...currentProduct, quantity: qty }]);
    decrementStock([{ id: currentProduct.id, quantity: qty }]);
    renderStoreProducts();
    showAlert({ title: 'สั่งซื้อสำเร็จ', message: 'กำลังพาไปตรวจสอบคำสั่งซื้อ', type: 'success' });
    closeModal();
    window.setTimeout(() => { window.location.href = 'orders.html'; }, 500);
  });

  closeButtons.forEach((button) => button.addEventListener('click', closeModal));
  modal.addEventListener('click', (event) => { if (event.target === modal) closeModal(); });
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape' && modal.classList.contains('is-open')) closeModal(); });
}


function renderStoreProducts() {
  const grid = document.querySelector('.product-grid');
  if (!grid) return;
  grid.innerHTML = getProducts().map((product, index) => `<article class="product-card ${product.featured || index === 0 ? 'featured' : ''}" data-product-id="${escapeHTML(product.id)}" tabindex="0" role="button"><span class="badge ${product.featured || index === 0 ? 'red' : 'dark'}">${product.featured || index === 0 ? 'สินค้าแนะนำ' : 'สินค้ายอดนิยม'}</span><div class="product-image"></div><div class="product-body"><h2>${escapeHTML(product.name)}</h2><p>${escapeHTML(product.description)}</p><strong class="price">${formatMoney(product.price)}</strong>${Number(product.stock || 0) <= 0 ? '<em class="stock-out">สินค้าหมด</em>' : ''}</div></article>`).join('');
}

function initHeroSlider() {
  const slider = document.querySelector('[data-hero-slider]');
  if (!slider) return;
  const slides = Array.from(slider.querySelectorAll('[data-slide]'));
  const prev = slider.querySelector('[data-slide-prev]');
  const next = slider.querySelector('[data-slide-next]');
  if (slides.length < 2) return;
  let active = 0;
  let timer;
  const show = (index) => {
    active = (index + slides.length) % slides.length;
    slides.forEach((slide, slideIndex) => slide.classList.toggle('is-active', slideIndex === active));
  };
  const start = () => { timer = window.setInterval(() => show(active + 1), 3600); };
  const restart = () => { window.clearInterval(timer); start(); };
  prev?.addEventListener('click', () => { show(active - 1); restart(); });
  next?.addEventListener('click', () => { show(active + 1); restart(); });
  slider.addEventListener('mouseenter', () => window.clearInterval(timer));
  slider.addEventListener('mouseleave', start);
  start();
}

function initAdmin() {
  if (document.body.dataset.page !== 'admin') return;
  const user = requireAuth();
  if (!user) return;
  if (!isAdmin(user)) { showAlert({ title: 'ไม่มีสิทธิ์เข้าระบบหลังบ้าน', message: 'หน้านี้สำหรับผู้ดูแลเท่านั้น', type: 'error' }); window.setTimeout(() => { window.location.href = 'index.html'; }, 700); return; }
  const list = document.querySelector('[data-admin-order-list]');
  const ordersMetric = document.querySelector('[data-admin-orders]');
  const salesMetric = document.querySelector('[data-admin-sales]');
  const refresh = document.querySelector('[data-admin-refresh]');
  const productForm = document.querySelector('[data-admin-product-form]');
  const productsMetric = document.querySelector('[data-admin-products]');
  const productsList = document.querySelector('[data-admin-products-list]');
  const statusText = { pending: 'รอชำระเงิน', cancelled: 'ยกเลิกแล้ว', paid: 'ชำระเงินแล้ว' };

  const render = () => {
    const orders = readList(ORDERS_KEY);
    const sales = orders.filter((order) => order.status === 'paid').reduce((sum, order) => sum + order.items.reduce((lineSum, item) => lineSum + item.price * item.quantity, 0), 0);
    ordersMetric.textContent = orders.length;
    salesMetric.textContent = formatMoney(sales);
    const products = getProducts();
    if (productsMetric) productsMetric.textContent = products.length;
    if (productsList) productsList.innerHTML = products.map((product) => `<article class="admin-order" data-product-id="${escapeHTML(product.id)}"><div><h3>${escapeHTML(product.name)}</h3><p>${formatMoney(product.price)} · คงเหลือ ${Number(product.stock || 0)} ชิ้น</p></div><button class="pill" type="button" data-delete-product>ลบ</button></article>`).join('');
    list.innerHTML = orders.length ? orders.map((order) => `
      <article class="admin-order">
        <div><h3>${escapeHTML(order.id)}</h3><p>${formatThaiDate(order.createdAt)} · ${escapeHTML(statusText[order.status] || order.status)}</p></div>
        <strong>${formatMoney(order.items.reduce((sum, item) => sum + item.price * item.quantity, 0))}</strong>
      </article>
    `).join('') : '<p class="empty-state">ยังไม่มีคำสั่งซื้อให้จัดการ</p>';
  };

  refresh?.addEventListener('click', () => { render(); showAlert({ title: 'รีเฟรชข้อมูลแล้ว', message: 'อัปเดตรายการคำสั่งซื้อในระบบหลังบ้านสำเร็จ', type: 'success' }); });
  productForm?.addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(productForm);
    const products = getProducts();
    products.unshift({ id: makeId(), name: String(formData.get('product-name') || 'สินค้าใหม่'), description: String(formData.get('product-description') || 'สินค้าในร้าน Freal Boxser'), price: Number(formData.get('product-price') || 0), stock: Number(formData.get('product-stock') || 1), featured: false });
    saveProducts(products);
    productForm.reset();
    render();
    showAlert({ title: 'เพิ่มสินค้าสำเร็จ', message: 'สินค้าใหม่ถูกเพิ่มเข้าระบบหลังบ้านแล้ว', type: 'success' });
  });
  productsList?.addEventListener('click', (event) => {
    const card = event.target.closest('[data-product-id]');
    if (!card || !event.target.closest('[data-delete-product]')) return;
    saveProducts(getProducts().filter((product) => product.id !== card.dataset.productId));
    render();
    showAlert({ title: 'ลบสินค้าแล้ว', message: 'อัปเดตรายการสินค้าเรียบร้อย', type: 'success' });
  });
  render();
}

function initCart() {
  if (document.body.dataset.page !== 'cart') return;
  if (!requireAuth()) return;
  const list = document.querySelector('[data-cart-list]');
  const total = document.querySelector('[data-cart-total]');
  const checkout = document.querySelector('[data-checkout]');
  if (!list) return;

  const render = () => {
    const cart = readList(CART_KEY);
    list.innerHTML = cart.length ? cart.map((item) => `
      <article class="cart-item">
        <div>
          <h2>${escapeHTML(item.name)}</h2>
          <p>${escapeHTML(item.description)}</p>
          <small>จำนวน ${Number(item.quantity || 1)}</small>
        </div>
        <strong class="item-price">${formatMoney(item.price * item.quantity)}</strong>
      </article>
    `).join('') : '<p class="empty-state">ยังไม่มีสินค้าในตะกร้า กลับไปเลือกสินค้าได้ที่หน้าร้าน</p>';
    total.textContent = formatMoney(cart.reduce((sum, item) => sum + item.price * item.quantity, 0));
    checkout.disabled = !cart.length;
  };

  checkout?.addEventListener('click', () => {
    const cart = readList(CART_KEY);
    if (!cart.length) return;
    const products = getProducts();
    const outOfStock = cart.find((item) => {
      const product = products.find((entry) => entry.id === item.id);
      return product && Number(item.quantity || 0) > Number(product.stock || 0);
    });
    if (outOfStock) {
      showAlert({ title: 'สินค้าไม่พอ', message: `${outOfStock.name} มีไม่พอในสต็อกแล้ว กรุณาปรับจำนวนในตะกร้า`, type: 'error' });
      return;
    }
    createOrder(cart);
    decrementStock(cart);
    writeList(CART_KEY, []);
    showAlert({ title: 'สั่งซื้อสำเร็จ', message: 'ไปยังหน้ารายการคำสั่งซื้อเพื่อตรวจสอบสถานะ', type: 'success' });
    window.setTimeout(() => { window.location.href = 'orders.html'; }, 500);
  });
  render();
}

function initOrders() {
  if (document.body.dataset.page !== 'orders') return;
  if (!requireAuth()) return;
  const list = document.querySelector('[data-orders-list]');
  if (!list) return;
  const statusText = { pending: 'รอชำระเงิน', cancelled: 'ยกเลิกแล้ว', paid: 'ชำระเงินแล้ว' };
  const render = () => {
    const orders = readList(ORDERS_KEY);
    list.innerHTML = orders.length ? orders.map((order) => `
      <article class="order-card" data-order-id="${escapeHTML(order.id)}">
        <div class="order-head"><div><h2>รหัสคำสั่งซื้อ: ${escapeHTML(order.id)}</h2><p class="order-meta">วันที่: ${formatThaiDate(order.createdAt)}</p><p class="order-meta">การชำระเงิน: <span class="status ${order.status}">${statusText[order.status] || order.status}</span></p></div><p class="order-code">รหัสธุรกรรม:<br>${escapeHTML(order.transactionId)}</p></div>
        <div class="order-lines">${order.items.map((item) => `<div class="order-line"><div><h3>${escapeHTML(item.name)}</h3><small>จำนวน: ${Number(item.quantity || 1)}</small></div><strong class="order-price">${formatMoney(item.price * item.quantity)}<small>(${Number(item.price).toFixed(2)} x ${Number(item.quantity || 1)})</small></strong></div>`).join('')}</div>
        <div class="order-detail" hidden>รายละเอียดคำสั่งซื้อ: สินค้าทั้งหมด ${order.items.reduce((sum, item) => sum + Number(item.quantity || 1), 0)} ชิ้น ยอดรวม ${formatMoney(order.items.reduce((sum, item) => sum + item.price * item.quantity, 0))} สถานะ ${statusText[order.status] || order.status}</div>
        <div class="order-actions"><button class="pill" type="button" data-cancel-order>ยกเลิกคำสั่งซื้อ</button><button class="pill pay-btn" type="button" data-pay-order>ชำระเงิน</button><button class="pill" type="button" data-toggle-detail>ดูรายละเอียด</button></div>
      </article>
    `).join('') : '<p class="empty-state">ยังไม่มีคำสั่งซื้อ</p>';
    refreshIcons(list);
  };
  list.addEventListener('click', (event) => {
    const card = event.target.closest('[data-order-id]');
    if (!card) return;
    const id = card.dataset.orderId;
    const orders = readList(ORDERS_KEY);
    const order = orders.find((item) => item.id === id);
    if (event.target.closest('[data-toggle-detail]')) card.querySelector('.order-detail').hidden = !card.querySelector('.order-detail').hidden;
    if (event.target.closest('[data-cancel-order]') && order) { order.status = 'cancelled'; writeList(ORDERS_KEY, orders); render(); showAlert({ title: 'ยกเลิกคำสั่งซื้อแล้ว', message: 'อัปเดตสถานะในระบบสำเร็จ', type: 'success' }); }
    if (event.target.closest('[data-pay-order]') && order) { order.status = 'paid'; writeList(ORDERS_KEY, orders); render(); showAlert({ title: 'ยืนยันการชำระเงินสำเร็จ', message: 'คำสั่งซื้อถูกปรับเป็นชำระเงินแล้ว', type: 'success' }); }
  });
  render();
}

function initTopup() {
  if (!requireAuth()) return;
  const form = document.querySelector('[data-topup-form]');
  if (!form) return;

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const input = form.querySelector('[name="slip-url"]');
    const value = input.value.trim();

    if (!value) {
      showAlert({ title: 'เติมเงินไม่สำเร็จ', message: 'กรุณาใส่ลิงก์อั่งเปาก่อนเติมเงิน', type: 'error' });
      input.focus();
      return;
    }

    showAlert({ title: 'ส่งข้อมูลเติมเงินแล้ว', message: 'ระบบกำลังตรวจสอบลิงก์อั่งเปาของคุณ', type: 'success' });
    form.reset();
  });
}


function maskEmail(email) {
  if (!email) return 'kaerz.03.00@gmail...';
  const [name, domain = ''] = String(email).split('@');
  return `${name}@${domain}`.length > 18 ? `${name}@${domain}`.slice(0, 18) + '...' : `${name}@${domain}`;
}

function getProfileId(user) {
  const source = String(user?.id || user?.username || 'user');
  let hash = 0;
  for (let index = 0; index < source.length; index += 1) hash = ((hash << 5) - hash + source.charCodeAt(index)) >>> 0;
  return hash.toString(16).padStart(8, '0').slice(0, 8);
}

function initProfile() {
  if (document.body.dataset.page !== 'profile') return;
  const user = requireAuth(); if (!user) return;
  const displayName = user.displayName || user.username || 'ผู้ใช้งาน';
  const username = user.username || displayName;
  const orders = readList(ORDERS_KEY);
  const lastLogin = user.lastLogin || user.createdAt || new Date().toISOString();

  document.querySelectorAll('[data-profile-name]').forEach((el) => { el.textContent = displayName; });
  document.querySelector('[data-profile-username]')?.replaceChildren(document.createTextNode(username));
  document.querySelector('[data-profile-id]')?.replaceChildren(document.createTextNode(user.id || getProfileId(user)));
  document.querySelector('[data-profile-email]')?.replaceChildren(document.createTextNode(maskEmail(user.email)));
  document.querySelector('[data-last-login]')?.replaceChildren(document.createTextNode(formatThaiDate(lastLogin)));
  document.querySelectorAll('[data-user-role]').forEach((el) => { el.textContent = isAdmin(user) ? 'ผู้ดูแลระบบ' : 'สมาชิก'; });
  document.querySelector('[data-wallet-balance]')?.replaceChildren(document.createTextNode(formatMoney(user.balance || 0)));
  document.querySelector('[data-profile-orders]')?.replaceChildren(document.createTextNode(orders.length));
  const form = document.querySelector('[data-profile-form]');
  const nameInput = form?.querySelector('[name="displayName"]');
  if (nameInput) nameInput.value = displayName;
  form?.addEventListener('submit', (event) => {
    event.preventDefault();
    const newName = new FormData(form).get('displayName') || user.displayName;
    user.displayName = newName;
    setUser(user);
    const account = findUser(user.username);
    if (account) { account.displayName = newName; saveUsers(getUsers().map((item) => (item.username === account.username ? account : item))); }
    requireAuth();
    showAlert({ title: 'บันทึกโปรไฟล์แล้ว', type: 'success' });
  });
}

function initDonate() {
  if (document.body.dataset.page !== 'donate') return;
  if (!requireAuth()) return;
  const goal = 10000, form = document.querySelector('[data-donate-form]'), list = document.querySelector('[data-donate-list]');
  const render = () => { const items = readList(DONATE_KEY); const total = items.reduce((s,i)=>s+Number(i.amount||0),0); document.querySelector('[data-donate-total]').textContent = `${formatMoney(total)} / ${formatMoney(goal)}`; document.querySelector('[data-donate-bar]').style.width = `${Math.min(total / goal * 100, 100)}%`; list.innerHTML = items.length ? items.map(i => `<article class="donate-row"><strong>${escapeHTML(i.donor)}</strong><span>${formatMoney(i.amount)}</span></article>`).join('') : '<p class="empty-state">ยังไม่มีผู้โดเนท เป็นคนแรกได้เลย!</p>'; };
  form?.addEventListener('submit', (event) => { event.preventDefault(); const fd = new FormData(form); const amount = Number(fd.get('amount') || 0); if (amount <= 0) return showAlert({ title: 'กรุณาใส่ยอดโดเนท', type: 'error' }); const items = readList(DONATE_KEY); items.unshift({ donor: fd.get('donor') || getUser().username, amount, createdAt: new Date().toISOString() }); writeList(DONATE_KEY, items); form.reset(); render(); showAlert({ title: 'ขอบคุณสำหรับการโดเนท', message: formatMoney(amount), type: 'success' }); });
  render();
}

document.addEventListener('DOMContentLoaded', () => {
  initChrome();
  refreshIcons();
  document.querySelectorAll('[data-logout]').forEach((button) => button.addEventListener('click', logout));
  if (document.body.dataset.page === 'login') initLogin();
  initHeroSlider();
  if (document.body.dataset.protected === 'true') {
    initStore();
    initCart();
    initOrders();
    initTopup();
    initAdmin();
    initProfile();
    initDonate();
  }
});
