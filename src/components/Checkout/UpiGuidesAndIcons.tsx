import React from "react";

export type AppTab = "phonepe" | "googlepay" | "paytm" | "bhim" | "bank";

export const APP_GUIDES: Record<AppTab, {
  name: string; color: string; bg: string; steps: string[]; note?: string;
}> = {
  phonepe: {
    name: "PhonePe",
    color: "#5F259F",
    bg: "#F3ECFF",
    steps: [
      "Open PhonePe app → tap the History tab at the bottom",
      "Tap on the payment you just made to Zoberry",
      "Scroll down to see Transaction Details",
      "Find the field labelled Transaction ID or UPI Ref No",
      "Copy the 12-digit number — that is your UTR",
    ],
    note: "PhonePe UTRs start with digits like 408… or 512…",
  },
  googlepay: {
    name: "Google Pay",
    color: "#1A73E8",
    bg: "#E8F0FE",
    steps: [
      "Open Google Pay → tap your profile photo (top-right)",
      "Tap 'Manage Google Pay account' → 'Transactions'",
      "Or: tap the magnifying glass → search for your payment",
      "Tap on the transaction to expand it",
      "Find 'UPI transaction ID' — copy the 12-digit number",
    ],
    note: "Google Pay also sends a confirmation SMS with the UTR/Ref number",
  },
  paytm: {
    name: "Paytm",
    color: "#00BAF2",
    bg: "#E0F7FF",
    steps: [
      "Open Paytm → tap 'Balance & History' or 'Passbook'",
      "Tap 'UPI' from the category tabs at the top",
      "Find and tap your payment to Zoberry",
      "Look for Reference No or Transaction ID",
      "Copy the 12-digit number — that is your UTR",
    ],
    note: "Paytm also shows the UTR in the payment success SMS from your bank",
  },
  bhim: {
    name: "BHIM / Any App",
    color: "#007B5E",
    bg: "#E8F5F1",
    steps: [
      "Open BHIM or your bank's UPI app → tap Transactions",
      "Tap on the payment you made",
      "Find the field called UPI Ref / Transaction Ref / UTR No",
      "It will be a 12-digit number",
      "Copy it and paste below",
    ],
    note: "Works the same way in iMobile, Yono SBI, Kotak, Axis Dhan, etc.",
  },
  bank: {
    name: "Bank SMS",
    color: "#E65100",
    bg: "#FFF3E0",
    steps: [
      "Open your SMS inbox",
      "Look for a message from your bank (HDFC, ICICI, SBI, Axis…)",
      "The message will say 'debited' with a Ref No",
      "The Ref No / UTR is a 12-digit number in that SMS",
      "Copy it from the SMS and paste below",
    ],
    note: "Example SMS: 'INR 999 debited … UPI Ref 408212345678 …'",
  },
};

export const APP_TABS: AppTab[] = ["phonepe", "googlepay", "paytm", "bhim", "bank"];

export function PhonePeIcon({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <rect width="48" height="48" rx="10" fill="#5F259F" />
      <path d="M14 13h10c5.5 0 10 4.5 10 10s-4.5 10-10 10h-4v5l-6-5V13z" fill="white" />
      <circle cx="24" cy="23" r="3" fill="#5F259F" />
    </svg>
  );
}

export function GooglePayIcon({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <rect width="48" height="48" rx="10" fill="white" stroke="#e0e0e0" />
      <text x="7" y="30" fontSize="11" fontWeight="800" fontFamily="Arial,sans-serif">
        <tspan fill="#4285F4">G</tspan>
        <tspan fill="#EA4335">o</tspan>
        <tspan fill="#FBBC05">o</tspan>
        <tspan fill="#4285F4">g</tspan>
        <tspan fill="#34A853">l</tspan>
        <tspan fill="#EA4335">e</tspan>
      </text>
      <text x="7" y="42" fontSize="8" fontWeight="700" fontFamily="Arial,sans-serif" fill="#5F6368">Pay</text>
    </svg>
  );
}

export function PaytmIcon({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <rect width="48" height="48" rx="10" fill="#00BAF2" />
      <text x="5" y="28" fontSize="9" fontWeight="900" fontFamily="Arial,sans-serif" fill="white">paytm</text>
    </svg>
  );
}

export function BhimIcon({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <rect width="48" height="48" rx="10" fill="#00A550" />
      <text x="5" y="30" fontSize="12" fontWeight="900" fontFamily="Arial,sans-serif" fill="white">BHIM</text>
    </svg>
  );
}

export function BankSmsIcon({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <rect width="48" height="48" rx="10" fill="#E65100" />
      <rect x="8" y="14" width="32" height="22" rx="3" fill="white" />
      <path d="M8 17l16 11 16-11" stroke="#E65100" strokeWidth="2" />
    </svg>
  );
}

export function AppIcon({ app, size }: { app: AppTab; size?: number }) {
  if (app === "phonepe") return <PhonePeIcon size={size} />;
  if (app === "googlepay") return <GooglePayIcon size={size} />;
  if (app === "paytm") return <PaytmIcon size={size} />;
  if (app === "bhim") return <BhimIcon size={size} />;
  return <BankSmsIcon size={size} />;
}

export function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="8" fill="#22c55e" />
      <path d="M4.5 8l2.5 2.5 4.5-4.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function InfoIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <circle cx="7" cy="7" r="6.5" stroke="#6b7280" />
      <path d="M7 6v4M7 4.5v.5" stroke="#6b7280" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

export function CopyIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <rect x="4" y="4" width="8" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
      <path d="M2 2h6v2H2V2z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
    </svg>
  );
}

export function WhatsAppIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="#25D366">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
      <path d="M12.004 2.003c-5.514 0-9.997 4.48-9.997 9.99 0 1.763.464 3.416 1.268 4.853L2 22l5.29-1.249A9.964 9.964 0 0012.004 22c5.514 0 9.997-4.48 9.997-9.99 0-5.514-4.483-9.007-9.997-9.007zm0 18.214a8.226 8.226 0 01-4.197-1.148l-.301-.178-3.122.736.78-2.997-.196-.309A8.19 8.19 0 013.78 12c0-4.527 3.693-8.217 8.224-8.217 4.532 0 8.224 3.69 8.224 8.217 0 4.528-3.692 8.217-8.224 8.217z" />
    </svg>
  );
}

export function EmailIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="M2 7l10 7 10-7" />
    </svg>
  );
}

export function ShieldIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}
