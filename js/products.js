/* ===== SHOP SETTINGS: change the name and text here ===== */
const SHOP = {
  name: "Your Shop Name",
  tagline: "Hookahs, shisha and accessories with live stock counts and M-Pesa checkout. Your products, prices and branding go here.",
  currency: "KES",
  lowStock: 5            // stock at or below this number shows as "low"
};

/* ===== PRODUCTS: edit, add or remove items here =====
   img = a file in the images folder. To use a real photo, put it in images/
   and change the img path, for example "images/my-hookah.jpg" */
const PRODUCTS = [
  { id: 1,  name: "Brass hookah, 2-hose",   category: "Hookahs",     price: 9500,  stock: 6,  img: "images/hookah-brass.svg" },
  { id: 2,  name: "Glass hookah, large",    category: "Hookahs",     price: 12500, stock: 3,  img: "images/hookah-glass.svg" },
  { id: 3,  name: "Shisha 50g, double apple", category: "Shisha",    price: 650,   stock: 24, img: "images/shisha-apple.svg" },
  { id: 4,  name: "Shisha 50g, mint",       category: "Shisha",      price: 650,   stock: 18, img: "images/shisha-mint.svg" },
  { id: 5,  name: "Shisha 50g, grape",      category: "Shisha",      price: 650,   stock: 2,  img: "images/shisha-grape.svg" },
  { id: 6,  name: "Coconut charcoal, 1 kg", category: "Charcoal",    price: 900,   stock: 12, img: "images/charcoal.svg" },
  { id: 7,  name: "Silicone hookah hose",   category: "Accessories", price: 800,   stock: 15, img: "images/hose.svg" },
  { id: 8,  name: "Mouth tips, pack of 10", category: "Accessories", price: 300,   stock: 40, img: "images/tips.svg" },
  { id: 9,  name: "Steel tongs",            category: "Accessories", price: 450,   stock: 0,  img: "images/tongs.svg" },
  { id: 10, name: "Windproof lighter",      category: "Accessories", price: 1800,  stock: 7,  img: "images/lighter.svg" }
];

/* ===== STORE: keeps stock and orders in the browser so the shop page and
   the inventory page share the same numbers. You don't need to edit this. ===== */
const Store = (() => {
  const SK = "shopDemo.stock", OK = "shopDemo.orders";
  const mem = {};
  const get = (k, d) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return k in mem ? mem[k] : d; } };
  const set = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { mem[k] = v; } };
  return {
    products() { const st = get(SK, {}); return PRODUCTS.map(p => ({ ...p, stock: p.id in st ? st[p.id] : p.stock })); },
    setStock(id, n) { const st = get(SK, {}); st[id] = Math.max(0, n); set(SK, st); },
    orders() { return get(OK, []); },
    addOrder(o) { const a = get(OK, []); a.unshift(o); set(OK, a); },
    reset() { set(SK, {}); set(OK, []); }
  };
})();

const money = n => SHOP.currency + " " + n.toLocaleString("en-KE");
