const $ = id => document.getElementById(id);
let cart = {};          // { productId: quantity }
let category = "All";
let toastTimer;

document.title = SHOP.name;
document.querySelectorAll("[data-shop-name]").forEach(el => el.textContent = SHOP.name);
document.querySelectorAll("[data-tagline]").forEach(el => el.textContent = SHOP.tagline);

/* ---------- helpers ---------- */
const product = id => Store.products().find(p => p.id === id);
const left = p => p.stock - (cart[p.id] || 0);
const cartTotal = () => Store.products().reduce((t, p) => t + (cart[p.id] || 0) * p.price, 0);

/* ---------- shop grid ---------- */
function renderFilters() {
  const cats = ["All", ...new Set(PRODUCTS.map(p => p.category))];
  $("filters").innerHTML = cats.map(c => `<button aria-pressed="${c === category}" data-cat="${c}">${c}</button>`).join("");
}
function renderGrid() {
  $("grid").innerHTML = Store.products().filter(p => category === "All" || p.category === category).map(p => {
    const l = left(p);
    const stock = p.stock === 0 ? '<span class="stock out">Out of stock</span>'
      : p.stock <= SHOP.lowStock ? `<span class="stock low">Only ${p.stock} left</span>`
      : `<span class="stock ok">${p.stock} in stock</span>`;
    const label = p.stock === 0 ? "Out of stock" : l <= 0 ? "All in your cart" : "Add to cart";
    return `<article class="card">
      <button class="imgbtn" data-zoom="${p.id}" aria-label="View larger image of ${p.name}"><img src="${p.img}" alt="${p.name}" loading="lazy"></button>
      <div class="cbody"><h3>${p.name}</h3><span class="price">${money(p.price)}</span>${stock}
      <button class="add" data-add="${p.id}" ${l <= 0 ? "disabled" : ""}>${label}</button></div></article>`;
  }).join("");
}

/* ---------- cart ---------- */
function renderCart() {
  const rows = Store.products().filter(p => cart[p.id]);
  $("cc").textContent = rows.reduce((t, p) => t + cart[p.id], 0);
  $("items").innerHTML = rows.length ? rows.map(p => `<div class="crow">
      <img src="${p.img}" alt="">
      <div class="cinfo"><b>${p.name}</b><small>${money(p.price)} each</small></div>
      <div class="qty"><button data-dec="${p.id}" aria-label="Remove one">−</button><span>${cart[p.id]}</span>
      <button data-inc="${p.id}" aria-label="Add one" ${left(p) <= 0 ? "disabled" : ""}>+</button></div></div>`).join("")
    : '<p class="empty">Your cart is empty. Add something from the shop.</p>';
  $("tot").textContent = money(cartTotal());
  $("payBtn").disabled = !rows.length;
}
function renderAll() { renderFilters(); renderGrid(); renderCart(); }

function addToCart(id) {
  const p = product(id);
  if (p && left(p) > 0) { cart[id] = (cart[id] || 0) + 1; toast("Added: " + p.name); renderAll(); }
}
function removeOne(id) {
  cart[id]--; if (cart[id] <= 0) delete cart[id]; renderAll();
}
function openCart(on) { $("drawer").classList.toggle("on", on); $("scrim").classList.toggle("on", on); }
function toast(msg) {
  const t = $("toast"); t.textContent = msg; t.classList.add("on");
  clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove("on"), 1400);
}
function zoom(id) {
  const p = product(id);
  $("zoomImg").src = p.img; $("zoomImg").alt = p.name;
  $("zoomCap").textContent = p.name + " – " + money(p.price);
  $("zoom").classList.add("on");
}

/* ---------- M-Pesa demo payment ---------- */
function popup(html) { $("box").innerHTML = html; $("modal").classList.add("on"); }
function pay() {
  const phone = $("phone").value.replace(/\s/g, "");
  if (!/^(?:\+?254|0)[71]\d{8}$/.test(phone)) { $("err").textContent = "Enter a Safaricom number like 0712 345 678."; return; }
  $("err").textContent = "";
  const total = cartTotal();
  popup(`<h2>Check your phone</h2><p>An M-Pesa prompt was sent to ${$("phone").value}.</p>
    <div class="stk"><b>${SHOP.name}</b><br>Pay ${money(total)}<br><small>Enter your M-Pesa PIN to confirm</small></div>
    <button class="btn" id="pin">I’ve entered my PIN (demo)</button> <button class="ghost" id="cx">Cancel</button>`);
  $("cx").onclick = () => $("modal").classList.remove("on");
  $("pin").onclick = () => { popup("<h2>Confirming payment…</h2><p>Waiting for M-Pesa.</p>"); setTimeout(() => finish(total, $("phone").value), 1500); };
}
function finish(total, phone) {
  const code = "S" + Math.random().toString(36).slice(2, 11).toUpperCase();
  const items = [];
  Store.products().forEach(p => { const q = cart[p.id]; if (q) { Store.setStock(p.id, p.stock - q); items.push(q + "× " + p.name); } });
  Store.addOrder({ code, items, phone, total, time: new Date().toLocaleString("en-KE") });
  cart = {}; renderAll(); openCart(false);
  popup(`<h2>Payment received</h2><p>M-Pesa code <b>${code}</b></p><p>Thank you for your order.</p><button class="btn" id="ok">Back to shop</button>`);
  $("ok").onclick = () => $("modal").classList.remove("on");
}

/* ---------- clicks ---------- */
document.addEventListener("click", e => {
  const t = e.target.closest("button"); if (!t) return;
  const d = t.dataset;
  if (d.cat) { category = d.cat; renderFilters(); renderGrid(); }
  if (d.add) addToCart(+d.add);
  if (d.inc) addToCart(+d.inc);
  if (d.dec) removeOne(+d.dec);
  if (d.zoom) zoom(+d.zoom);
});
$("cartBtn").onclick = () => openCart(true);
$("closeCart").onclick = () => openCart(false);
$("scrim").onclick = () => openCart(false);
$("payBtn").onclick = pay;
$("zoom").onclick = () => $("zoom").classList.remove("on");
document.addEventListener("keydown", e => { if (e.key === "Escape") { $("zoom").classList.remove("on"); openCart(false); } });

/* ---------- age gate: 18+ only, otherwise entry is denied ---------- */
const AGE_KEY = "shopDemo.age";
const getAge = () => { try { return sessionStorage.getItem(AGE_KEY); } catch (e) { return window._age || null; } };
const setAge = v => { try { sessionStorage.setItem(AGE_KEY, v); } catch (e) { window._age = v; } };
function denied() {
  $("gateBox").innerHTML = "<h2>Entry denied</h2><p>This website is for adults aged 18 and over. You can’t enter.</p>";
}
function enter() { $("gate").hidden = true; $("app").hidden = false; renderAll(); }
$("yes").onclick = () => { setAge("ok"); enter(); };
$("no").onclick = () => { setAge("no"); denied(); };
if (getAge() === "ok") enter(); else if (getAge() === "no") denied();
