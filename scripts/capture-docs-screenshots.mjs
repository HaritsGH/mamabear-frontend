// Captures the screenshots used in content/docs/user-guide into public/images/docs.
// Requires the frontend (BASE_URL, default http://localhost:3001) and backend running with seed data.
// Usage: npm run docs:screenshots [-- guest|customer|chat|admin]
// The chat group sends real messages to the AI assistant (uses OpenRouter credits).
import { chromium } from "playwright";
import { fileURLToPath } from "node:url";

const BASE = process.env.BASE_URL ?? "http://localhost:3001";
const OUT = fileURLToPath(new URL("../public/images/docs/", import.meta.url));
const PASSWORD = process.env.SEED_PASSWORD ?? "admin"; // seed password from mamabear-backend/prisma/data.ts
const PRODUCT = "/products/mamabear-asi-booster-30-kapsul";
const only = process.argv[2];
// The assistant asks clarifying questions (pregnant vs breastfeeding, product format) before recommending.
const CHAT_MESSAGES = [
  "Produk apa yang bagus buat nambah ASI?",
  "Saya sedang menyusui, bayi saya 3 bulan.",
  "Kapsul atau teh, mana saja boleh.",
];

const browser = await chromium.launch();

async function session(email, viewport = { width: 1440, height: 900 }) {
  const ctx = await browser.newContext({ viewport });
  ctx.setDefaultNavigationTimeout(180000);
  ctx.setDefaultTimeout(60000);
  await ctx.addInitScript(() => localStorage.setItem("newsletter-dismissed", "true"));
  const page = await ctx.newPage();
  if (email) await login(page, email);
  return page;
}

const hasSession = async (ctx) => (await ctx.cookies()).some((c) => c.name.endsWith("next-auth.session-token"));

// Login can silently fail on a cold dev server (callback 200, no session cookie), so verify and retry.
async function login(page, email) {
  for (let attempt = 1; attempt <= 3; attempt++) {
    await page.goto(`${BASE}/login`, { waitUntil: "load" });
    await page.waitForTimeout(2000); // let the form hydrate before submitting
    await page.fill('input[type="email"]', email);
    await page.fill('input[placeholder="Minimal 8 karakter"]', PASSWORD);
    await page.click('button[type="submit"]');
    for (let i = 0; i < 20 && !(await hasSession(page.context())); i++) await page.waitForTimeout(500);
    if (await hasSession(page.context())) return;
    console.warn(`login attempt ${attempt} for ${email} got no session, retrying`);
  }
  throw new Error(`Could not log in as ${email}`);
}

async function go(page, path, wait = 4000) {
  await page.goto(BASE + path, { waitUntil: "load" }).catch((e) => console.warn("goto", path, e.message.split("\n")[0]));
  await page.waitForTimeout(wait);
}

let failed = 0;

async function snap(page, name) {
  // Never overwrite a doc image with the login page if the session was lost.
  if (new URL(page.url()).pathname.startsWith("/login")) {
    console.error("FAIL", name, "redirected to", page.url());
    failed++;
    return;
  }
  try {
    await page.screenshot({ path: `${OUT}${name}.png`, animations: "disabled" });
    console.log("ok", name);
  } catch (e) {
    console.error("FAIL", name, e.message.split("\n")[0]);
    failed++;
  }
}

// Fresh tab per shot so a stuck page cannot block later shots.
async function shot(page, path, name, wait) {
  const p = await page.context().newPage();
  await go(p, path, wait);
  await snap(p, name);
  await p.close().catch(() => {});
}

if (!only || only === "guest") {
  const p = await session();
  await shot(p, "/", "home");
  await shot(p, "/products", "products");
  await shot(p, PRODUCT, "product-detail");
  await shot(p, "/search?q=asi", "search");
  await shot(p, "/login", "login");
  await p.context().close();
}

if (!only || only === "customer") {
  // Note: adds one item to this seed user's cart.
  const p = await session("siti.rahayu@email.com");
  await go(p, PRODUCT);
  await p.click("text=Masukkan Keranjang");
  await p.waitForTimeout(800);
  await snap(p, "add-to-cart-modal");
  await p.click("text=Konfirmasi");
  await p.waitForTimeout(2000);
  await shot(p, "/cart", "cart");
  await shot(p, "/checkout", "checkout");
  await shot(p, "/account/addresses", "account-addresses");
  await shot(p, "/account/orders", "account-orders");
  await p.context().close();
}

// Recommendation cards load after the chat's own auto-scroll, so scroll message panes again before a shot.
const scrollChatToBottom = (page) =>
  page.evaluate(() => document.querySelectorAll(".overflow-y-auto").forEach((el) => (el.scrollTop = el.scrollHeight)));

if (!only || only === "chat") {
  const guest = await session();
  await shot(guest, "/chat", "chat-login-required");
  await guest.context().close();

  const p = await session("siti.rahayu@email.com");
  await go(p, "/chat");
  await p.click("text=Chat Baru");
  for (const text of CHAT_MESSAGES) {
    await p.fill('textarea[placeholder="Tulis pertanyaan Mama..."]', text);
    await p.keyboard.press("Enter");
    await p.waitForTimeout(1000);
    // Reply spinner and recommendation-card loader both use .animate-spin (free models can be slow).
    await p.waitForFunction(() => !document.querySelector("section .animate-spin"), null, { timeout: 180000 });
  }
  if (!(await p.locator('section a[href^="/products/"]').count())) console.warn("no recommendation cards in AI reply");
  await p.waitForTimeout(2000);
  await scrollChatToBottom(p);
  await snap(p, "chat-conversation");

  // Widget on the home page reopens the latest session.
  await go(p, "/");
  await p.locator("div.fixed.bottom-6.right-6 > button").last().click();
  await p.waitForTimeout(5000);
  await scrollChatToBottom(p);
  await snap(p, "chat-widget");
  await p.context().close();

  const m = await session("siti.rahayu@email.com", { width: 390, height: 844 });
  await go(m, "/chat");
  await m.click("button:has(svg.lucide-history)"); // label is hidden below md
  await m.waitForTimeout(1500);
  await snap(m, "chat-mobile-history");
  await m.context().close();
}

if (!only || only === "admin") {
  const p = await session("admin@mamabear.id");
  for (const s of ["dashboard", "products", "orders", "customers", "reports", "settings"])
    await shot(p, `/admin/${s}`, `admin-${s}`);
  await go(p, "/admin/settings");
  await p.click("text=Model AI");
  await p.waitForTimeout(1500);
  await snap(p, "admin-settings-ai");
  await p.context().close();
}

await browser.close();
if (failed) {
  console.error(`${failed} screenshot(s) failed`);
  process.exit(1);
}
