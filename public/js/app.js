// ============================================================
//  Dreamcream Parlor — Shared Frontend JS
// ============================================================

const API = '';  // same origin

// ---- Auth helpers ----
function getToken()   { return localStorage.getItem('dc_token'); }
function getUser()    { try { return JSON.parse(atob(getToken().split('.')[1])); } catch { return null; } }
function isLoggedIn() { const t = getToken(); if (!t) return false; try { return getUser().exp * 1000 > Date.now(); } catch { return false; } }
function logout()     { localStorage.removeItem('dc_token'); window.location.href = 'login.html'; }

// ---- Cart helpers ----
function getCart()           { try { return JSON.parse(localStorage.getItem('dc_cart') || '[]'); } catch { return []; } }
function saveCart(cart)      { localStorage.setItem('dc_cart', JSON.stringify(cart)); updateCartBadge(); }
function getCartCount()      { return getCart().reduce((s, i) => s + i.quantity, 0); }
function clearCart()         { localStorage.removeItem('dc_cart'); updateCartBadge(); }

function addToCart(product) {
  const cart = getCart();
  const idx  = cart.findIndex(i => i.id === product.id);
  if (idx >= 0) { cart[idx].quantity++; } else { cart.push({ ...product, quantity: 1 }); }
  saveCart(cart);
  showToast(`${product.name} added to cart! 🍦`);
  updateCartBadge();
}

function removeFromCart(productId) {
  saveCart(getCart().filter(i => i.id !== productId));
}

function updateQty(productId, delta) {
  const cart = getCart();
  const idx  = cart.findIndex(i => i.id === productId);
  if (idx < 0) return;
  cart[idx].quantity = Math.max(1, cart[idx].quantity + delta);
  saveCart(cart);
}

// ---- API fetch helper ----
async function apiFetch(url, options = {}) {
  options.headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (isLoggedIn()) options.headers['Authorization'] = 'Bearer ' + getToken();
  const res = await fetch(API + url, options);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

// ---- Toast notification ----
function showToast(msg, type = 'success') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.style.cssText = 'position:fixed;top:80px;right:20px;z-index:9999;';
    document.body.appendChild(container);
  }
  const toast = document.createElement('div');
  toast.className = `dc-toast dc-toast-${type}`;
  toast.innerHTML = msg;
  container.appendChild(toast);
  setTimeout(() => toast.classList.add('show'), 10);
  setTimeout(() => { toast.classList.remove('show'); setTimeout(() => toast.remove(), 400); }, 3000);
}

// ---- Navbar update ----
function updateCartBadge() {
  document.querySelectorAll('.cart-badge').forEach(el => {
    const c = getCartCount();
    el.textContent = c;
    el.style.display = c > 0 ? 'inline-block' : 'none';
  });
}

function buildNavbar() {
  const placeholder = document.getElementById('navbar-placeholder');
  if (!placeholder) return;
  const loggedIn = isLoggedIn();
  const user = loggedIn ? getUser() : null;
  const cartCount = getCartCount();
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';

  const navLinks = [
    { href: 'index.html',    label: 'Home' },
    { href: 'about-us.html', label: 'About Us' },
    { href: 'products.html', label: 'Our Products' },
    { href: 'promotion.html',label: 'Promotions' },
    { href: 'contact-us.html',label:'Contact' },
  ];

  let authHtml = '';
  if (loggedIn) {
    authHtml = `
      <li class="nav-item">
        <a class="nav-link cart-nav-link" href="cart.html">
          <i class="fa fa-shopping-cart"></i> Cart
          <span class="cart-badge badge badge-warning ml-1" style="display:${cartCount>0?'inline-block':'none'}">${cartCount}</span>
        </a>
      </li>
      <li class="nav-item"><a class="nav-link" href="orders.html"><i class="fa fa-list-alt"></i> My Orders</a></li>
      <li class="nav-item dropdown">
        <a class="nav-link dropdown-toggle" href="#" id="userDropdown" data-toggle="dropdown">
          <i class="fa fa-user-circle"></i> ${user.name.split(' ')[0]}
        </a>
        <div class="dropdown-menu dropdown-menu-right">
          <span class="dropdown-item-text text-muted small">${user.email}</span>
          <div class="dropdown-divider"></div>
          <a class="dropdown-item text-danger" href="#" onclick="logout()"><i class="fa fa-sign-out"></i> Logout</a>
        </div>
      </li>`;
  } else {
    authHtml = `
      <li class="nav-item"><a class="nav-link" href="register.html"><i class="fa fa-user-plus"></i> Register</a></li>
      <li class="nav-item"><a class="nav-link btn-nav-login" href="login.html"><i class="fa fa-sign-in"></i> Login</a></li>`;
  }

  placeholder.innerHTML = `
  <nav class="navbar navbar-expand-md navbar-dark fixed-top dc-navbar" role="banner">
    <div class="container">
      <a class="navbar-brand" href="index.html">🍦 Dreamcream Parlor</a>
      <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#main-nav">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="main-nav">
        <ul class="navbar-nav ml-auto">
          ${navLinks.map(l => `<li class="nav-item"><a class="nav-link${currentPage===l.href?' active':''}" href="${l.href}">${l.label}</a></li>`).join('')}
          ${authHtml}
        </ul>
      </div>
    </div>
  </nav>`;
}

// ---- Run on every page load ----
document.addEventListener('DOMContentLoaded', () => {
  buildNavbar();
  updateCartBadge();
});
