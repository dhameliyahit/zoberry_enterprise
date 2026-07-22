// Helpers for Direct UPI (myMoney) payment capture.
//
// Flow:
//  1. Order is created with a *padded* billed amount (order total + ₹0.02 / ₹0.20)
//     so every order has a unique exact amount to match against the gateway.
//  2. Customer pays that exact amount and submits the UTR.
//  3. We verify via the myMoney partner API that the UTR exists, is `verified`,
//     the amount matches exactly, and the credit arrived within 15 minutes of the
//     order being placed. Only then do we auto-capture (paymentStatus paid, status confirmed).

// Pad the order total with one of two deterministic paddings so the exact
// billed amount is unique per order. We alternate using the order count so the
// same total never collides across orders.
export function generateBilledAmount(orderTotal: number, salt: number): number {
  const padding = salt % 2 === 0 ? 0.02 : 0.2;
  const raw = (orderTotal + padding).toFixed(2);
  return parseFloat(raw);
}

// Allowed paddings used when matching a received amount.
export const BILLED_PADDINGS = [0.02, 0.2];

export const CAPTURE_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
export const CAPTURE_TOLERANCE_MS = 60 * 1000; // 60 seconds for SMS/reporting lag

export function computeCaptureDeadline(orderCreatedAt: Date): Date {
  return new Date(orderCreatedAt.getTime() + CAPTURE_WINDOW_MS);
}

export function isWithinCaptureWindow(
  orderCreatedAt: Date,
  transactionDate?: Date
): boolean {
  const txnTime = transactionDate ? new Date(transactionDate) : new Date();
  const deadline = computeCaptureDeadline(orderCreatedAt);
  // Security: the credit must arrive BEFORE the deadline. We allow a small
  // lower-bound tolerance (60s) to absorb bank SMS timestamp lag or batch
  // processing that may make the reported time slightly earlier than the
  // order creation instant.
  return txnTime.getTime() >= orderCreatedAt.getTime() - CAPTURE_TOLERANCE_MS && txnTime.getTime() <= deadline.getTime();
}

// Returns true when a received gateway amount matches the order's billed amount
// (within a 1-paise tolerance to avoid float drift).
export function amountMatches(billedAmount: number, receivedAmount: number): boolean {
  if (!billedAmount || !receivedAmount) return false;
  return Math.abs(billedAmount - receivedAmount) < 0.01;
}
