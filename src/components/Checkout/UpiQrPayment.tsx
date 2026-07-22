"use client";

import React, {
  useState,
  useEffect,
  useMemo,
  useRef,
  useCallback,
} from "react";
import QRCode from "qrcode";
import { motion, AnimatePresence } from "framer-motion";
import {
  Lightbulb,
  ShieldCheck,
  Lightning,
  Lock,
  ChatsCircle,
  WhatsappLogo,
  EnvelopeSimple,
  Copy,
  Check,
  QrCode,
  ArrowDown,
  CaretDown,
} from "@phosphor-icons/react";
import { orderService } from "@/services/order.service";
import toast from "react-hot-toast";

//===================================
// Types
//===================================

type AppTab = (typeof PAYMENT_APPS)[number]["id"];

type VerifyStatus =
  | "idle"
  | "checking"
  | "monitoring"
  | "auto_verified"
  | "submitted"
  | "not_found"
  | "amount_mismatch"
  | "outside_window";

interface UpiQrPaymentProps {
  orderId: string;
  orderNumber: string;
  amount: number;
  vpa?: string;
  vpaName?: string;
  onSuccess?: (data: { utr: string; amount: number }) => void;
  onFailed?: (reason: string) => void;
}

interface PaymentApp {
  id: "phonepe" | "googlepay" | "paytm" | "bank";
  name: string;
  logo: string;
  primary: string;
  background: string;
  description: string;
  tipTitle: string;
  tipDescription: string;
  steps: readonly string[];
  cta: string;
}

//===================================
// Constants
//===================================

const UPI_VPA = "heetdhameliya59-2@oksbi";
const VPA_NAME = "Zoberry";
const SUPPORT_WHATSAPP = "919825078450";
const SUPPORT_EMAIL = "support@zoberry.in";

const fmt = (n: number) => (n ?? 0).toLocaleString("en-IN");

const PAYMENT_APPS = [
  {
    id: "phonepe",
    name: "PhonePe",
    logo: "/logos/phonepe.svg",
    primary: "#5F259F",
    background: "#F4EEFB",
    description: "Find your UTR in the PhonePe app history.",
    tipTitle: "Heads up",
    tipDescription: "PhonePe UTRs usually start with digits like 408… or 512…",
    cta: "Open in PhonePe",
    steps: [
      "Open PhonePe and tap the History tab at the bottom.",
      "Tap the payment you just made to Zoberry.",
      "Scroll down to Transaction Details.",
      "Copy the 12-digit UPI Ref No / Transaction ID.",
    ],
  },
  {
    id: "googlepay",
    name: "Google Pay",
    logo: "/logos/googlepay.svg",
    primary: "#1A73E8",
    background: "#EAF1FE",
    description: "Find your UTR inside Google Pay transactions.",
    tipTitle: "Heads up",
    tipDescription: "GPay also sends a confirmation SMS with the UTR/Ref number.",
    cta: "Open in Google Pay",
    steps: [
      "Open Google Pay and tap your profile photo (top-right).",
      "Tap 'Manage Google Pay account' then 'Transactions'.",
      "Tap the transaction to expand it.",
      "Copy the 12-digit 'UPI transaction ID'.",
    ],
  },
  {
    id: "paytm",
    name: "Paytm",
    logo: "/logos/paytm.svg",
    primary: "#00BAF2",
    background: "#E6F8FE",
    description: "Find your UTR in the Paytm passbook.",
    tipTitle: "Heads up",
    tipDescription: "Paytm also shows the UTR in the bank's success SMS.",
    cta: "Open in Paytm",
    steps: [
      "Open Paytm and tap 'Balance & History' / 'Passbook'.",
      "Tap 'UPI' from the top category tabs.",
      "Tap your payment to Zoberry.",
      "Copy the 12-digit Reference No / Transaction ID.",
    ],
  },
  {
    id: "bank",
    name: "Bank SMS",
    logo: "/logos/bank-sms.svg",
    primary: "#E65100",
    background: "#FDEEE3",
    description: "Find your UTR from your bank's debit SMS.",
    tipTitle: "Heads up",
    tipDescription: "Example: 'INR 999 debited … UPI Ref 408212345678 …'",
    cta: "Open SMS App",
    steps: [
      "Open your SMS inbox.",
      "Find the debit message from your bank.",
      "Locate the 'Ref No' in the text.",
      "Copy the 12-digit UTR from the SMS.",
    ],
  },
] as const satisfies readonly PaymentApp[];

const PAYMENT_APP_MAP = PAYMENT_APPS.reduce(
  (acc, app) => {
    acc[app.id] = app;
    return acc;
  },
  {} as Record<AppTab, (typeof PAYMENT_APPS)[number]>
);

const TRUST_BADGES = [
  { label: "Secure", icon: Lock },
  { label: "Fast Verification", icon: Lightning },
  { label: "Encrypted", icon: ShieldCheck },
  { label: "24×7 Support", icon: ChatsCircle },
] as const;

//===================================
// Shared primitives
//===================================

function AppLogo({ app }: { app: AppTab }) {
  const { logo, name, primary } = PAYMENT_APP_MAP[app];
  return (
    <span
      className="flex items-center justify-center w-14 h-14 rounded-2xl overflow-hidden ring-1 ring-black/5"
      style={{ backgroundColor: `${primary}1A` }}
    >
      <img
        src={logo}
        alt={`${name} logo`}
        className="w-9 h-9 object-contain"
        onError={(e) => {
          const el = e.currentTarget;
          el.style.display = "none";
          const parent = el.parentElement;
          if (parent) {
            parent.textContent = name.charAt(0);
            parent.style.color = primary;
            parent.style.fontWeight = "700";
            parent.style.fontSize = "1.5rem";
          }
        }}
      />
    </span>
  );
}

function StepBadge({ step, done }: { step: number; done?: boolean }) {
  return (
    <span
      className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
        done ? "bg-green text-white" : "bg-dark text-white"
      }`}
    >
      {done ? <Check weight="bold" size={16} /> : step}
    </span>
  );
}

function SectionTitle({
  step,
  title,
  subtitle,
  done,
}: {
  step: number;
  title: string;
  subtitle?: string;
  done?: boolean;
}) {
  return (
    <div className="flex items-start gap-3 mb-6">
      <StepBadge step={step} done={done} />
      <div>
        <h4 className="font-semibold text-lg text-dark leading-tight">{title}</h4>
        {subtitle && <p className="text-[13px] text-dark-4 mt-0.5">{subtitle}</p>}
      </div>
    </div>
  );
}

function StepTimeline({ steps }: { steps: readonly string[] }) {
  return (
    <ol className="flex flex-col gap-1.5">
      {steps.map((label, i) => (
        <li key={i} className="flex items-center gap-3">
          <span className="flex-shrink-0 w-7 h-7 rounded-full bg-green text-white flex items-center justify-center">
            <Check weight="bold" size={14} />
          </span>
          <span className="flex-1 text-[13px] text-dark-3 leading-relaxed">{label}</span>
          {i < steps.length - 1 && (
            <ArrowDown className="text-gray-4 flex-shrink-0" size={16} weight="bold" />
          )}
        </li>
      ))}
    </ol>
  );
}

function TipBox({ title, description, primary }: { title: string; description: string; primary: string }) {
  return (
    <div
      className="flex items-start gap-3 rounded-2xl p-3.5 mt-4 border"
      style={{ backgroundColor: `${primary}12`, borderColor: `${primary}33` }}
    >
      <Lightbulb size={18} weight="fill" style={{ color: primary }} className="flex-shrink-0 mt-0.5" />
      <div>
        <p className="text-[12px] font-semibold" style={{ color: primary }}>
          {title}
        </p>
        <p className="text-[12px] text-dark-3 leading-relaxed mt-0.5">{description}</p>
      </div>
    </div>
  );
}

function AppDetailCard({ app }: { app: AppTab }) {
  const data = PAYMENT_APP_MAP[app];
  return (
    <div className="rounded-2xl border border-gray-3 bg-gray-1 p-5">
      <div className="flex items-center gap-3 mb-4">
        <AppLogo app={app} />
        <div>
          <p className="font-semibold text-dark leading-tight">{data.name}</p>
          <p className="text-[12px] text-dark-4">{data.description}</p>
        </div>
      </div>
      <StepTimeline steps={data.steps} />
      <TipBox title={data.tipTitle} description={data.tipDescription} primary={data.primary} />
    </div>
  );
}

//===================================
// Step 1 — Choose UPI app
//===================================

function AppSelector({
  activeTab,
  onToggle,
}: {
  activeTab: AppTab | null;
  onToggle: (app: AppTab) => void;
}) {
  const renderCard = (app: (typeof PAYMENT_APPS)[number], layout: "mobile" | "desktop") => {
    const isActive = activeTab === app.id;
    const base =
      "flex flex-col items-center gap-2 px-3 rounded-2xl border-2 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue focus-visible:ring-offset-2";
    const state = isActive
      ? "border-blue bg-blue-light-5 shadow-1"
      : "border-gray-3 bg-white hover:border-blue-light-2 hover:bg-gray-1";
    const hover =
      layout === "desktop" && !isActive ? " hover:-translate-y-0.5" : "";
    return (
      <button
        key={app.id}
        onClick={() => onToggle(app.id)}
        aria-expanded={isActive}
        aria-pressed={isActive}
        className={
          layout === "mobile"
            ? `snap-start flex-shrink-0 w-[140px] py-4 ${base} ${state}`
            : `group py-5 ${base} ${state}${hover}`
        }
      >
        <AppLogo app={app.id} />
        <span className={`text-[12px] font-semibold ${isActive ? "text-blue" : "text-dark-3"}`}>
          {app.name}
        </span>
        <span
          className={`text-[11px] text-center leading-tight ${
            isActive ? "text-blue/80" : "text-dark-4"
          } ${layout === "desktop" ? "px-1" : ""}`}
        >
          {app.description}
        </span>
        <CaretDown
          size={16}
          weight="bold"
          className={`text-dark-4 transition-transform duration-300 ${isActive ? "rotate-180" : ""}`}
        />
      </button>
    );
  };

  return (
    <>
      <div className="-mx-1 pb-1 lg:hidden flex gap-2.5 overflow-x-auto snap-x snap-mandatory scrollbar-thin">
        {PAYMENT_APPS.map((app) => renderCard(app, "mobile"))}
      </div>
      <div className="hidden lg:grid grid-cols-4 gap-3">
        {PAYMENT_APPS.map((app) => renderCard(app, "desktop"))}
      </div>

      <AnimatePresence initial={false}>
        {activeTab && (
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="mt-4">
              <AppDetailCard app={activeTab} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

//===================================
// Step 2 — Scan & pay
//===================================

function QrFrame({
  qrDataUrl,
  qrError,
  amount,
  vpa,
  vpaName,
  onEnlarge,
}: {
  qrDataUrl: string;
  qrError: boolean;
  amount: number;
  vpa: string;
  vpaName: string;
  onEnlarge: () => void;
}) {
  return (
    <div className="flex flex-col items-center">
      <p className="text-[11px] font-semibold text-dark-4 uppercase tracking-[0.12em] mb-1.5">
        Amount to pay
      </p>
      <p className="text-[52px] font-bold text-dark tracking-tight leading-none mb-1.5">
        ₹{fmt(amount)}
      </p>
      <p className="text-[13px] text-dark-4 mb-6">
        to <strong className="text-dark-2">{vpaName}</strong>
      </p>

      {qrError ? (
        <p className="text-xs text-red mb-4">QR failed to load. Please retry.</p>
      ) : qrDataUrl ? (
        <button
          onClick={onEnlarge}
          className="group relative cursor-zoom-in rounded-3xl border-2 border-gray-3 bg-white p-4 transition-all duration-200 hover:shadow-2 hover:border-blue-light-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue focus-visible:ring-offset-2"
          aria-label="Enlarge QR code"
        >
          <img
            src={qrDataUrl}
            alt="UPI QR code to scan and pay"
            className="w-[300px] h-[300px] sm:w-[320px] sm:h-[320px] rounded-2xl"
          />
          <span className="absolute bottom-3 right-3.5 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-gray-4 transition-colors group-hover:text-blue">
            <QrCode size={12} weight="bold" /> Tap to enlarge
          </span>
        </button>
      ) : (
        <div className="w-[300px] h-[300px] sm:w-[320px] sm:h-[320px] rounded-3xl bg-gray-3 animate-pulse" />
      )}

      <div className="flex items-center gap-2 bg-white border border-gray-3 rounded-xl py-2.5 px-3.5 mt-6 w-full max-w-[360px] text-left">
        <span className="text-[10px] text-dark-4 font-bold uppercase whitespace-nowrap">UPI ID</span>
        <span className="flex-1 text-[13px] font-semibold text-dark break-all">{vpa}</span>
      </div>
    </div>
  );
}

function ScanAndPay({
  amount,
  upiLink,
  qrDataUrl,
  qrError,
  copied,
  ctaLabel,
  vpa,
  onEnlarge,
  onCopyVpa,
  onDownloadQr,
}: {
  amount: number;
  upiLink: string;
  qrDataUrl: string;
  qrError: boolean;
  copied: boolean;
  ctaLabel: string;
  vpa: string;
  vpaName: string;
  onEnlarge: () => void;
  onCopyVpa: () => void;
  onDownloadQr: () => void;
}) {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center gap-8">
      <div className="flex-shrink-0 flex justify-center lg:w-[360px]">
        <QrFrame
          qrDataUrl={qrDataUrl}
          qrError={qrError}
          amount={amount}
          vpa={vpa}
          vpaName={VPA_NAME}
          onEnlarge={onEnlarge}
        />
      </div>

      <div className="flex-1 w-full flex flex-col">
        <a
          href={upiLink}
          className="w-full bg-dark text-white font-semibold py-3 px-6 rounded-xl duration-200 hover:bg-dark/90 active:scale-[0.99] transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-dark focus-visible:ring-offset-2 flex items-center justify-center gap-2 text-sm"
        >
          {ctaLabel}
        </a>

        <div className="flex gap-2.5 mt-3">
          <button
            onClick={onCopyVpa}
            className="flex-1 bg-white text-dark-3 border border-gray-3 hover:bg-gray-2 hover:border-dark-5 active:scale-[0.99] py-2.5 px-3 rounded-xl text-[13px] font-medium transition-all inline-flex items-center justify-center gap-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue focus-visible:ring-offset-2"
            aria-label={copied ? "UPI ID copied" : "Copy UPI ID"}
          >
            {copied ? <Check weight="bold" size={16} /> : <Copy size={16} weight="bold" />}
            <span>{copied ? "Copied!" : "Copy UPI ID"}</span>
          </button>
          <button
            onClick={onDownloadQr}
            className="inline-flex items-center justify-center gap-1.5 bg-white text-dark-3 border border-gray-3 hover:bg-gray-2 hover:border-dark-5 active:scale-[0.99] py-2.5 px-3 rounded-xl text-[13px] font-medium transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-blue focus-visible:ring-offset-2"
            aria-label="Download QR"
          >
            <QrCode size={16} weight="bold" />
            <span className="hidden sm:inline">Download</span>
          </button>
        </div>

        <p className="text-[12px] text-dark-4 leading-relaxed mt-5 bg-gray-1 border border-gray-3 rounded-xl p-3.5">
          No QR scanner? Tap <span className="font-semibold text-dark-3">{ctaLabel}</span> to open
          your app directly, or copy the UPI ID above.
        </p>
      </div>
    </div>
  );
}

//===================================
// Step 3 — Verify
//===================================

function StatusBanner({ status, amount, utr }: { status: VerifyStatus; amount: number; utr: string }) {
  if (status === "auto_verified")
    return (
      <div className="text-center bg-green-light-6 border border-green rounded-2xl p-5 mb-4">
        <div className="w-10 h-10 rounded-full bg-green text-white flex items-center justify-center mx-auto mb-2">
          <Check weight="bold" size={20} />
        </div>
        <h4 className="text-sm font-semibold text-green-dark mb-1">Payment captured</h4>
        <p className="text-[13px] text-dark-3 mb-2 leading-relaxed">
          We received your payment of ₹{fmt(amount)} and your order is confirmed.
        </p>
        <p className="text-[11px] text-dark-4">UTR: <strong>{utr}</strong></p>
      </div>
    );
  if (status === "submitted")
    return (
      <div className="text-center bg-blue-light-5 border border-blue-light-2 rounded-2xl p-5 mb-4">
        <div className="w-10 h-10 rounded-full bg-blue text-white flex items-center justify-center mx-auto mb-2 animate-pulse">
          <QrCode size={20} weight="bold" />
        </div>
        <h4 className="text-sm font-semibold text-blue-dark mb-1">Reference received</h4>
        <p className="text-[13px] text-dark-3 mb-2 leading-relaxed">We'll confirm your order automatically in a moment.</p>
        <p className="text-[11px] text-dark-4">UTR: <strong>{utr}</strong></p>
      </div>
    );
  return null;
}

function SupportBar({ orderNumber, amount, utr }: { orderNumber: string; amount: number; utr: string }) {
  const wa = `https://wa.me/${SUPPORT_WHATSAPP}?text=${encodeURIComponent(
    `Hi! I need help with my Zoberry order ${orderNumber} (₹${amount}). UTR: ${utr || "not submitted yet"}`
  )}`;
  const mail = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(
    `Payment help - Order ${orderNumber}`
  )}&body=${encodeURIComponent(`Order: ${orderNumber}\nAmount: ₹${amount}\nUTR: ${utr || "not submitted yet"}\n\nIssue: `)}`;
  return (
    <div className="border-t border-gray-3 pt-5 mt-5">
      <p className="text-[11px] text-dark-4 font-medium mb-2.5">Need help?</p>
      <div className="flex gap-2.5">
        <a
          href={wa}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 inline-flex items-center justify-center gap-1.5 bg-[#25D366] text-white py-2 px-3.5 rounded-xl text-[11px] font-medium hover:bg-[#1ebe5d] transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366] focus-visible:ring-offset-2"
        >
          <WhatsappLogo size={15} weight="fill" /> WhatsApp Chat
        </a>
        <a
          href={mail}
          className="flex-1 inline-flex items-center justify-center gap-1.5 bg-white text-dark-3 border border-gray-3 py-2 px-3.5 rounded-xl text-[11px] font-medium hover:bg-gray-2 hover:border-dark-5 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-blue focus-visible:ring-offset-2"
        >
          <EnvelopeSimple size={15} weight="bold" /> Email Support
        </a>
      </div>
    </div>
  );
}

const ERROR_BORDER =
  "border-red focus:border-red focus:ring-2 focus:ring-red/30";
const DEFAULT_BORDER =
  "border-gray-3 focus:border-blue focus:ring-2 focus:ring-blue/20";

function UtrField({
  utr,
  verifyStatus,
  loading,
  amount,
  onChange,
  onSubmit,
}: {
  utr: string;
  verifyStatus: VerifyStatus;
  loading: boolean;
  amount: number;
  onChange: (value: string) => void;
  onSubmit: () => void;
}) {
  const hasError = (utr.length > 0 && utr.length < 12) || verifyStatus === "not_found";
  const borderClass = hasError ? ERROR_BORDER : DEFAULT_BORDER;

  return (
    <div>
      <p className="text-[13px] text-dark-3 leading-relaxed mb-5">
        Once you've paid, paste your <strong>12-digit UTR</strong> below. We'll confirm your order
        the moment it matches.
      </p>
      <label
        htmlFor="utr-input"
        className="block text-[11px] font-medium text-dark-3 uppercase tracking-wider mb-2"
      >
        UTR / Reference Number
      </label>
      <div className="relative flex items-center">
        <input
          id="utr-input"
          value={utr}
          onChange={(e) => onChange(e.target.value)}
          placeholder="e.g. 408212345678"
          inputMode="numeric"
          maxLength={22}
          aria-invalid={hasError}
          className={`w-full px-4 py-3 border-2 rounded-xl text-sm font-semibold tracking-wider bg-white text-dark outline-none transition-all placeholder:font-normal placeholder:tracking-normal placeholder:text-dark-4 ${borderClass}`}
        />
        {verifyStatus === "checking" && (
          <span className="absolute right-4 text-[11px] text-dark-4 animate-pulse">Verifying…</span>
        )}
        {verifyStatus === "monitoring" && (
          <span className="absolute right-4 text-[11px] text-blue animate-pulse">Monitoring…</span>
        )}
      </div>

      {utr.length > 0 && utr.length < 12 && (
        <p className="text-[11px] text-red mt-1.5">Enter at least 12 digits ({utr.length}/12)</p>
      )}
      {verifyStatus === "not_found" && (
        <p className="text-[11px] text-red mt-1.5">
          Payment not found yet. Pay exact ₹{fmt(amount)} and try again.
        </p>
      )}
      {verifyStatus === "amount_mismatch" && (
        <p className="text-[11px] text-red mt-1.5">We received a different amount than ₹{fmt(amount)}.</p>
      )}
      {verifyStatus === "outside_window" && (
        <p className="text-[11px] text-red mt-1.5">Payment arrived outside the 15-minute window.</p>
      )}
      {utr.length >= 12 && verifyStatus === "idle" && (
        <p className="text-[11px] text-green mt-1.5 flex items-center gap-1 font-medium">
          <Check weight="bold" size={14} /> Looks good — ready to verify
        </p>
      )}
      {verifyStatus === "monitoring" && (
        <p className="text-[11px] text-blue mt-1.5 flex items-center gap-1 font-medium">
          <span className="w-3 h-3 border-2 border-blue/40 border-t-blue rounded-full animate-spin" />
          Payment not yet received — auto-checking for the next 15 minutes.
        </p>
      )}

      <button
        onClick={onSubmit}
        disabled={loading || utr.length < 12}
        className="w-full mt-5 bg-blue text-white font-semibold py-3 px-6 rounded-xl duration-200 hover:bg-blue-dark active:scale-[0.99] transition-all disabled:bg-gray-4 disabled:text-white/80 disabled:cursor-not-allowed text-sm flex items-center justify-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue focus-visible:ring-offset-2"
      >
        {loading ? (
          <span className="w-4 h-4 border-2 border-white/35 border-t-white rounded-full animate-spin" />
        ) : (
          <>
            <ShieldCheck size={16} weight="fill" /> Verify Payment
          </>
        )}
      </button>
    </div>
  );
}

//===================================
// QR modal
//===================================

function QrModal({
  open,
  amount,
  qrDataUrl,
  vpa,
  vpaName,
  upiLink,
  onClose,
  onDownload,
}: {
  open: boolean;
  amount: number;
  qrDataUrl: string;
  vpa: string;
  vpaName: string;
  upiLink: string;
  onClose: () => void;
  onDownload: () => void;
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[9999] bg-black/60 flex items-center justify-center p-4 backdrop-blur-[2px]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-label="Enlarged UPI QR code"
        >
          <motion.div
            className="bg-white rounded-[20px] p-6 max-w-[400px] w-full text-center shadow-2"
            initial={{ scale: 0.92, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.92, opacity: 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 26 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4 border-b border-gray-3 pb-2.5">
              <h4 className="text-sm font-medium text-dark">Scan to Pay ₹{fmt(amount)}</h4>
              <button
                onClick={onClose}
                className="w-7 h-7 rounded-full bg-gray-2 border-0 cursor-pointer text-lg flex items-center justify-center hover:bg-gray-3 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue focus-visible:ring-offset-2"
                aria-label="Close"
              >
                ×
              </button>
            </div>
            <img
              src={qrDataUrl}
              alt="UPI QR code to scan and pay"
              className="w-[300px] h-[300px] sm:w-[320px] sm:h-[320px] mx-auto mb-2 block rounded-2xl border-2 border-gray-3 p-1 bg-white"
            />
            <p className="font-semibold text-[13px] text-dark mb-0.5">{vpa}</p>
            <p className="text-[11px] text-dark-4 mb-4">{vpaName}</p>
            <div className="flex gap-2.5 justify-center">
              <button
                onClick={onDownload}
                className="bg-white text-dark-3 border border-gray-3 hover:bg-gray-2 hover:border-dark-5 py-2 px-4 rounded-xl text-[13px] font-medium transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-blue focus-visible:ring-offset-2"
              >
                Download
              </button>
              <a
                href={upiLink}
                className="bg-dark text-white hover:bg-dark/90 py-2 px-4 rounded-xl text-[13px] font-medium transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-dark focus-visible:ring-offset-2"
              >
                Open App
              </a>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

//===================================
// Main Component
//===================================

const UpiQrPayment = ({
  orderId,
  orderNumber,
  amount,
  vpa = UPI_VPA,
  vpaName = VPA_NAME,
  onSuccess,
  onFailed,
}: UpiQrPaymentProps) => {
  const [activeTab, setActiveTab] = useState<AppTab | null>("phonepe");
  const [utr, setUtr] = useState("");
  const [loading, setLoading] = useState(false);
  const [verifyStatus, setVerifyStatus] = useState<VerifyStatus>("idle");
  const [showQrModal, setShowQrModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [autoVerifyData, setAutoVerifyData] = useState<{ status: string; amount?: number } | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [qrError, setQrError] = useState(false);
  const utrCheckRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pollRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pollDeadlineRef = useRef<number>(0);

  const resolvedVpa = vpa?.trim() || UPI_VPA;
  const resolvedVpaName = vpaName?.trim() || VPA_NAME;

  const upiLink = useMemo(() => {
    const params = new URLSearchParams({
      pa: resolvedVpa,
      pn: resolvedVpaName,
      am: String(amount),
      tn: `Order ${orderNumber}`,
      tr: orderNumber,
      cu: "INR",
    });
    return `upi://pay?${params.toString()}`;
  }, [resolvedVpa, resolvedVpaName, amount, orderNumber]);

  useEffect(() => {
    let cancelled = false;
    setQrError(false);
    QRCode.toDataURL(upiLink, {
      width: 560,
      margin: 2,
      errorCorrectionLevel: "M",
      color: { dark: "#111827", light: "#ffffff" },
    })
      .then((url) => !cancelled && setQrDataUrl(url))
      .catch(() => !cancelled && setQrError(true));
    return () => {
      cancelled = true;
    };
  }, [upiLink]);

  useEffect(
    () => () => {
      if (utrCheckRef.current) clearTimeout(utrCheckRef.current);
      if (pollRef.current) clearTimeout(pollRef.current);
    },
    []
  );

  const stopPolling = () => {
    if (pollRef.current) clearTimeout(pollRef.current);
    pollRef.current = null;
  };

  // Auto-capture loop. Polls the gateway for up to the 15-minute capture
  // window. The companion SMS app may deliver the credit a few seconds after
  // the customer pays, so we keep checking by ORDER (no UTR needed — the
  // gateway matches the unique padded billed amount). A manually typed UTR, if
  // present, is passed along as a hint.
  const checkWithMyMoney = useCallback(
    async (utrValue = "", { poll = false }: { poll?: boolean } = {}) => {
      setVerifyStatus(poll ? "monitoring" : "checking");
      try {
        const res = await orderService.verifyMymoneyUtr(orderId, utrValue);
        const d = res?.data;
        if (d?.captured) {
          stopPolling();
          setAutoVerifyData({ status: "verified", amount: d.amount ?? amount });
          setVerifyStatus("auto_verified");
          toast.success("Payment matched & captured automatically!");
          onSuccess?.({ utr: d.utr || utrValue, amount: d.amount ?? amount });
          return;
        }
        if (d?.found) {
          if (d.reason === "amount_mismatch") {
            stopPolling();
            setVerifyStatus("amount_mismatch");
            toast.error("Amount received doesn't match the exact billed amount.");
            onFailed?.("amount_mismatch");
          } else if (d.reason === "outside_window") {
            stopPolling();
            setVerifyStatus("outside_window");
            toast.error("Payment received outside the 15-minute window.");
            onFailed?.("outside_window");
          } else {
            setVerifyStatus("idle");
          }
          return;
        }
        // Not received yet — keep monitoring if we're still inside the window.
        if (poll && Date.now() < pollDeadlineRef.current) {
          const delay = Math.min(5000, pollDeadlineRef.current - Date.now());
          pollRef.current = setTimeout(
            () => checkWithMyMoney(utrValue, { poll: true }),
            delay
          );
        } else if (!utrValue) {
          // Auto mode finished its window without a credit — fall back to manual.
          setVerifyStatus("idle");
        } else {
          setVerifyStatus("not_found");
        }
      } catch {
        stopPolling();
        setVerifyStatus("idle");
      }
    },
    [orderId, amount]
  );

  const startAutoCapture = useCallback(() => {
    stopPolling();
    pollDeadlineRef.current = Date.now() + 15 * 60 * 1000;
    checkWithMyMoney("", { poll: true });
  }, [checkWithMyMoney]);


  // Start automatic capture as soon as the order is shown — no UTR needed.
  useEffect(() => {
    startAutoCapture();
    return () => stopPolling();
  }, [startAutoCapture]);

  const handleUtrChange = (value: string) => {
    const cleaned = value.replace(/\D/g, "").slice(0, 22);
    setUtr(cleaned);
    setVerifyStatus("idle");
    setAutoVerifyData(null);
    stopPolling();
    if (utrCheckRef.current) clearTimeout(utrCheckRef.current);
    if (cleaned.length >= 12) {
        utrCheckRef.current = setTimeout(() => {
          pollDeadlineRef.current = Date.now() + 15 * 60 * 1000;
          checkWithMyMoney(cleaned, { poll: true });
        }, 800);
      }
  };

  const submitUtr = async () => {
    if (utr.trim().length < 12) {
      toast.error("Enter a valid 12-digit UTR / reference number");
      return;
    }
    try {
      setLoading(true);
      const res = await orderService.submitDirectUpiUtr(orderId, utr.trim());
      if (res.success) {
        const data = res.data || {};
        if (data.captured) {
          setAutoVerifyData({ status: "verified", amount: data.amount ?? amount });
          setVerifyStatus("auto_verified");
          toast.success("Payment matched & captured automatically!");
          onSuccess?.({ utr: utr.trim(), amount: data.amount ?? amount });
        } else if (data.reason === "amount_mismatch") {
          setVerifyStatus("amount_mismatch");
          toast.error("Amount received didn't match the exact billed amount.");
        } else if (data.reason === "outside_window") {
          setVerifyStatus("outside_window");
          toast.error("Payment received outside the 15-minute window.");
        } else {
          setVerifyStatus("submitted");
          toast.success("Reference received — confirming payment automatically.");
          // Credit may not have arrived yet; keep monitoring the gateway.
          pollDeadlineRef.current = Date.now() + 15 * 60 * 1000;
          checkWithMyMoney(utr.trim(), { poll: true });
        }
      } else {
        toast.error(res.error || "Failed to submit reference");
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to submit reference");
    } finally {
      setLoading(false);
    }
  };

  const copyVpa = async () => {
    try {
      await navigator.clipboard.writeText(resolvedVpa);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Could not copy");
    }
  };

  const downloadQr = () => {
    if (!qrDataUrl) return;
    const a = document.createElement("a");
    a.href = qrDataUrl;
    a.download = `zoberry-upi-qr-${orderNumber}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const toggleApp = (app: AppTab) => {
    setActiveTab((prev) => (prev === app ? null : app));
  };

  const isConfirmed = verifyStatus === "auto_verified" || verifyStatus === "submitted";
  const ctaLabel = activeTab ? PAYMENT_APP_MAP[activeTab].cta : "Open UPI App";

  return (
    <div className="bg-white shadow-1 rounded-[20px]">
      {/* Header */}
      <div className="border-b border-gray-3 py-5 px-4 sm:px-8.5 flex items-center gap-2.5">
        <span className="text-blue">
          <ShieldCheck size={20} weight="fill" />
        </span>
        <h3 className="font-semibold text-xl text-dark">Secure UPI Checkout</h3>
        <span className="ml-auto text-[13px] font-semibold text-blue">₹{fmt(amount)}</span>
      </div>

      <div className="p-4 sm:p-8.5 flex flex-col gap-10">
        {/* STEP 1 — Choose app */}
        <section>
          <SectionTitle
            step={1}
            title="Choose your UPI app"
            subtitle="Pick the app you'll use to pay, then find your reference number."
          />
          <AppSelector activeTab={activeTab} onToggle={toggleApp} />
        </section>

        {/* STEP 2 — Scan & pay */}
        <section>
          <SectionTitle
            step={2}
            title="Scan & pay"
            subtitle={`Scan the QR with any UPI app to pay ₹${fmt(amount)}.`}
          />
          <ScanAndPay
            amount={amount}
            upiLink={upiLink}
            qrDataUrl={qrDataUrl}
            qrError={qrError}
            copied={copied}
            ctaLabel={ctaLabel}
            vpa={resolvedVpa}
            vpaName={resolvedVpaName}
            onEnlarge={() => setShowQrModal(true)}
            onCopyVpa={copyVpa}
            onDownloadQr={downloadQr}
          />
        </section>

        {/* STEP 3 — Verify */}
        <section>
          <SectionTitle
            step={3}
            title="Verify your payment"
            subtitle={isConfirmed ? "Your payment is confirmed." : "Enter the 12-digit UTR from your app or bank SMS."}
            done={isConfirmed}
          />
          {isConfirmed ? (
            <StatusBanner status={verifyStatus} amount={autoVerifyData?.amount ?? amount} utr={utr} />
          ) : (
            <UtrField
              utr={utr}
              verifyStatus={verifyStatus}
              loading={loading}
              amount={amount}
              onChange={handleUtrChange}
              onSubmit={submitUtr}
            />
          )}
          <SupportBar orderNumber={orderNumber} amount={amount} utr={utr} />
        </section>

        {/* Trust badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-gray-3 pt-5">
          {TRUST_BADGES.map((t) => {
            const Icon = t.icon;
            return (
              <div
                key={t.label}
                className="flex items-center justify-center gap-2 text-[11px] text-dark-3 font-medium"
              >
                <span className="text-blue">
                  <Icon size={16} weight="bold" />
                </span>
                {t.label}
              </div>
            );
          })}
        </div>
      </div>

      <QrModal
        open={showQrModal}
        amount={amount}
        qrDataUrl={qrDataUrl}
        vpa={resolvedVpa}
        vpaName={resolvedVpaName}
        upiLink={upiLink}
        onClose={() => setShowQrModal(false)}
        onDownload={downloadQr}
      />
    </div>
  );
};

export default UpiQrPayment;
