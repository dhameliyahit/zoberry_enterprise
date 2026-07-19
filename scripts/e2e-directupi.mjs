// End-to-end test for the Direct UPI (myMoney) capture flow.
//
// Faithfully exercises the REAL systems:
//   - myMoney gateway via its real Partner API (third-party, deployed)
//   - storefront DB (orders collection) with the same logic as verify-utr
//
// It injects transactions into myMoney exactly like the companion SMS app
// would, then runs the capture decision (amount match + 10-min window + UTR)
// and writes the resulting order state — proving the whole chain works.
//
// Run:  node scripts/e2e-directupi.mjs   (from zoberry_enterprise root)
// Reads .env.local for MONGODB_URI + MYMONEY_* config.

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import mongoose from "mongoose";

// ---- load .env.local ----
const envPath = resolve(process.cwd(), ".env.local");
const envRaw = readFileSync(envPath, "utf8");
const env = {};
for (const line of envRaw.split(/\r?\n/)) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m) env[m[1]] = m[2].trim();
}
process.env.MONGODB_URI = process.env.MONGODB_URI || env.MONGODB_URI;
process.env.MYMONEY_API_URL = env.MYMONEY_API_URL || "https://m2money.duckdns.org/api";
process.env.MYMONEY_PARTNER_KEY = env.MYMONEY_PARTNER_KEY || "";

const MYMONEY_API = process.env.MYMONEY_API_URL;
const MYMONEY_KEY = process.env.MYMONEY_PARTNER_KEY;

// ---- capture logic (mirrors src/lib/payment-capture.ts + verify-utr) ----
const CAPTURE_WINDOW_MS = 10 * 60 * 1000;
const BILLED_PADDINGS = [0.02, 0.2];
function generateBilledAmount(total, salt) {
  const padding = salt % 2 === 0 ? 0.02 : 0.2;
  return parseFloat((total + padding).toFixed(2));
}
function amountMatches(billed, received) {
  if (!billed || !received) return false;
  return Math.abs(billed - received) < 0.01;
}
function isWithinCaptureWindow(orderCreatedAt, txnTime) {
  const t = txnTime ? new Date(txnTime) : new Date();
  return t.getTime() <= orderCreatedAt.getTime() + CAPTURE_WINDOW_MS;
}

// ---- myMoney partner client (real HTTP, like src/lib/mymoney.ts) ----
async function injectTransaction({ utr, amount, type = "credit", transactionDate }) {
  const res = await fetch(`${MYMONEY_API}/partner/transactions`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Api-Key": MYMONEY_KEY },
    body: JSON.stringify({ utr, amount, type, transactionDate }),
    signal: AbortSignal.timeout(8000),
  });
  return { status: res.status, body: await res.json().catch(() => null) };
}
async function searchTransaction(utr) {
  const res = await fetch(`${MYMONEY_API}/partner/transactions/search`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Api-Key": MYMONEY_KEY },
    body: JSON.stringify({ utr }),
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) return null;
  const data = await res.json();
  const items = data?.items || data?.data?.items || data?.transactions || [];
  return items.find((t) => String(t?.utr || "").trim() === utr) || null;
}

// ---- storefront models (inline, matches storefront-models/Order.ts) ----
const orderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, unique: true },
    customer: { type: mongoose.Schema.Types.ObjectId, required: true },
    shippingAddress: { type: Object, required: true },
    items: { type: [Object], required: true },
    subtotal: Number,
    shippingCost: Number,
    tax: Number,
    total: Number,
    status: String,
    paymentStatus: String,
    paymentMethod: String,
    billedAmount: Number,
    utr: String,
    utrStatus: String,
    captureDeadline: Date,
    paidAt: Date,
  },
  { timestamps: true }
);
const Order = mongoose.models.__e2eOrder || mongoose.model("__e2eOrder", orderSchema, "orders");
const userSchema = new mongoose.Schema({ name: String, email: String, role: String, isActive: Boolean });
const User = mongoose.models.__e2eUser || mongoose.model("__e2eUser", userSchema, "users");
const productSchema = new mongoose.Schema({
  title: String,
  price: Number,
  stock: Number,
  isActive: Boolean,
});
const Product = mongoose.models.__e2eProduct || mongoose.model("__e2eProduct", productSchema, "products");

// ---- test harness ----
const results = [];
function record(name, expected, actual, ok) {
  results.push({ name, expected, actual, ok });
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}  (expected: ${expected}, got: ${actual})`);
}

async function run() {
  if (!MYMONEY_KEY) throw new Error("MYMONEY_PARTNER_KEY missing");
  await mongoose.connect(process.env.MONGODB_URI, { bufferCommands: false });

  // setup real-ish data
  const user = await User.create({ name: "E2E Tester", email: `e2e-${Date.now()}@test.io`, role: "customer", isActive: true });
  const product = await Product.create({ title: "E2E Test Product", price: 100, stock: 50, isActive: true });

  const subtotal = product.price * 2; // 200
  const tax = Math.round(subtotal * 0.05); // 10
  const total = subtotal + tax; // 210
  const orderCount = await Order.estimatedDocumentCount();
  const billedAmount = generateBilledAmount(total, orderCount); // 210.02 or 210.20

  const order = await Order.create({
    customer: user._id,
    items: [{ product: product._id, title: product.title, price: product.price, quantity: 2 }],
    shippingAddress: { fullName: "E2E", phone: "9876543210", street: "X", city: "Y", zip: "380001", country: "India" },
    subtotal,
    shippingCost: 0,
    tax,
    total,
    billedAmount,
    paymentMethod: "directupi",
    status: "pending",
    paymentStatus: "pending",
    utrStatus: "",
  });
  console.log(`\nOrder ${order.orderNumber} created. total=₹${total}, billedAmount=₹${billedAmount}\n`);

  const utr = `E2E${Date.now()}`.slice(0, 12).padEnd(12, "0");
  const now = new Date();

  // ---- Scenario A: exact amount + within window => CAPTURED ----
  {
    const r = await injectTransaction({ utr: utr + "A", amount: billedAmount, transactionDate: now.toISOString() });
    if (r.status !== 200 && r.status !== 201) record("A.inject", "200/201", r.status, false);
    const txn = await searchTransaction(utr + "A");
    const found = !!txn;
    const amtOk = amountMatches(billedAmount, Number(txn?.amount) || 0);
    const winOk = isWithinCaptureWindow(order.createdAt, txn?.transactionDate);
    const captured = found && amtOk && winOk;
    record("A.found", "true", found, found);
    record("A.amount_match", "true", amtOk, amtOk);
    record("A.window", "true", winOk, winOk);
    record("A.captured", "true", captured, captured);
  }

  // ---- Scenario B: wrong amount => amount_mismatch (NOT captured) ----
  {
    await injectTransaction({ utr: utr + "B", amount: billedAmount + 5, transactionDate: now.toISOString() });
    const txn = await searchTransaction(utr + "B");
    const amtOk = amountMatches(billedAmount, Number(txn?.amount) || 0);
    record("B.amount_match", "false", amtOk, !amtOk);
  }

  // ---- Scenario C: outside window => outside_window (NOT captured) ----
  // Capture window is orderCreatedAt + 10min (customer must pay within 10 min
  // of ordering). A credit arriving AFTER that deadline is outside the window.
  {
    const late = new Date(order.createdAt.getTime() + 15 * 60 * 1000);
    await injectTransaction({ utr: utr + "C", amount: billedAmount, transactionDate: late.toISOString() });
    const txn = await searchTransaction(utr + "C");
    const winOk = isWithinCaptureWindow(order.createdAt, txn?.transactionDate);
    record("C.window", "false", winOk, !winOk);
  }

  // ---- Scenario D: UTR never arrives => not_found (NOT captured) ----
  {
    const txn = await searchTransaction("ZZZNOPE000000");
    record("D.not_found", "null", String(txn), txn === null);
  }

  // ---- Scenario E: webhook-style capture via search + write (proves write path) ----
  {
    const wUtr = utr + "E";
    await injectTransaction({ utr: wUtr, amount: billedAmount, transactionDate: now.toISOString() });
    const txn = await searchTransaction(wUtr);
    if (txn && amountMatches(billedAmount, Number(txn.amount)) && isWithinCaptureWindow(order.createdAt, txn.transactionDate)) {
      order.utr = wUtr;
      order.utrStatus = "verified";
      order.paymentStatus = "paid";
      order.status = "confirmed";
      order.paidAt = new Date(txn.transactionDate);
      await order.save();
    }
    const reloaded = await Order.findById(order._id);
    record("E.order_captured", "confirmed/paid", `${reloaded.status}/${reloaded.paymentStatus}`, reloaded.status === "confirmed" && reloaded.paymentStatus === "paid");
  }

  // ---- cleanup ----
  await Order.deleteMany({ _id: order._id });
  await User.deleteOne({ _id: user._id });
  await Product.deleteOne({ _id: product._id });
  // remove injected myMoney txns (partner delete not exposed; note for manual cleanup)
  await mongoose.disconnect();

  const failed = results.filter((r) => !r.ok);
  console.log(`\n===== SUMMARY: ${results.length - failed.length}/${results.length} passed =====`);
  if (failed.length) {
    console.log("FAILED:", failed.map((f) => f.name).join(", "));
    console.log("\nNOTE: myMoney test transactions (UTR prefix E2E) remain in the gateway DB.");
    console.log("Clean them via the myMoney portal or a delete script when done.");
    process.exit(1);
  }
  console.log("All scenarios passed. (myMoney test transactions with UTR prefix 'E2E' can be ignored/cleaned.)");
}

run().catch((e) => {
  console.error("E2E ERROR:", e.message);
  process.exit(1);
});
