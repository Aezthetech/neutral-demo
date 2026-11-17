const $ = id => document.getElementById(id);
let tab = "stock";

document.title = "Inventory – " + SHOP.name;
document.querySelectorAll("[data-shop-name]").forEach(el => el.textContent = SHOP.name);

function render() {
  const ps = Store.products();
  const out = ps.filter(p => p.stock === 0).length;
  const low = ps.filter(p => p.stock > 0 && p.stock <= SHOP.lowStock).length;
  const value = ps.reduce((t, p) => t + p.price * p.stock, 0);
  $("stats").innerHTML =
    `<div class="stat"><b>${ps.length}</b><span>Products</span></div>
     <div class="stat"><b class="low">${low}</b><span>Low stock</span></div>
     <div class="stat"><b class="out">${out}</b><span>Out of stock</span></div>
     <div class="stat"><b>${money(value)}</b><span>Stock value</span></div>`;

  $("stockBody").innerHTML = ps.map(p => {
    const cls = p.stock === 0 ? "out" : p.stock <= SHOP.lowStock ? "low" : "ok";
    const txt = p.stock === 0 ? "Out of stock" : p.stock <= SHOP.lowStock ? "Low" : "OK";
    return `<tr><td><img src="${p.img}" alt=""></td><td>${p.name}</td><td>${p.category}</td><td>${money(p.price)}</td>
      <td><b>${p.stock}</b></td><td class="${cls}">${txt}</td>
      <td><button class="mini" data-d="${p.id}:-1">−1</button><button class="mini" data-d="${p.id}:1">+1</button><button class="mini" data-d="${p.id}:10">+10</button></td></tr>`;
  }).join("");

  const orders = Store.orders();
  $("orderBody").innerHTML = orders.length ? orders.map(o =>
    `<tr><td>${o.code}</td><td>${o.time}</td><td>${o.items.join(", ")}</td><td>${o.phone}</td><td>${money(o.total)}</td></tr>`).join("")
    : '<tr><td colspan="5">No orders yet. Place one on the shop page and it will show up here.</td></tr>';

  $("pStock").hidden = tab !== "stock";
  $("pOrders").hidden = tab !== "orders";
  document.querySelectorAll("[data-tab]").forEach(b => b.setAttribute("aria-pressed", b.dataset.tab === tab));
}

document.addEventListener("click", e => {
  const t = e.target.closest("button"); if (!t) return;
  if (t.dataset.d) {
    const [id, delta] = t.dataset.d.split(":").map(Number);
    const p = Store.products().find(x => x.id === id);
    Store.setStock(id, p.stock + delta); render();
  }
  if (t.dataset.tab) { tab = t.dataset.tab; render(); }
  if (t.id === "reset" && confirm("Reset all stock and orders back to the starting demo data?")) { Store.reset(); render(); }
});
render();
