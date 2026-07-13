"use client";
import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import QRCode from "qrcode";
import { orderService } from "@/services/order.service";
import toast from "react-hot-toast";
import {
  APP_GUIDES,
  APP_TABS,
  AppIcon,
  CheckIcon,
  InfoIcon,
  CopyIcon,
  WhatsAppIcon,
  EmailIcon,
  ShieldIcon,
  type AppTab,
} from "./UpiGuidesAndIcons";

/* ─── CONFIG ──────────────────────────────────────────────────── */
const UPI_VPA = "heetdhameliya59-2@oksbi";
const VPA_NAME = "Zoberry";
const SUPPORT_WHATSAPP = "919825078450"; // ← replace with your WhatsApp number
const SUPPORT_EMAIL = "support@zoberry.in"; // ← replace with your email

/* ─── TYPES ───────────────────────────────────────────────────── */
interface UpiQrPaymentProps {
  orderId: string;
  orderNumber: string;
  amount: number;
  /** override VPA if needed, falls back to constant */
  vpa?: string;
  vpaName?: string;
}

type VerifyStatus = "idle" | "checking" | "auto_verified" | "submitted" | "not_found";

/* ─── MAIN COMPONENT ──────────────────────────────────────────── */
const UpiQrPayment = ({
  orderId,
  orderNumber,
  amount,
  vpa = UPI_VPA,
  vpaName = VPA_NAME,
}: UpiQrPaymentProps) => {
  const [activeTab, setActiveTab] = useState<AppTab>("phonepe");
  const [utr, setUtr] = useState("");
  const [loading, setLoading] = useState(false);
  const [verifyStatus, setVerifyStatus] = useState<VerifyStatus>("idle");
  const [showQrModal, setShowQrModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [autoVerifyData, setAutoVerifyData] = useState<{
    status: string; amount?: number; transactionDate?: string;
  } | null>(null);

  const utrCheckRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* ─── Resolved VPA (never empty) ── */
  const resolvedVpa = vpa && vpa.trim() ? vpa.trim() : UPI_VPA;
  const resolvedVpaName = vpaName && vpaName.trim() ? vpaName.trim() : VPA_NAME;

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

  /* ─── Client-side QR generation (no external API) ── */
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [qrError, setQrError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setQrError(false);
    QRCode.toDataURL(upiLink, {
      width: 400,
      margin: 2,
      errorCorrectionLevel: "M",
      color: { dark: "#111827", light: "#ffffff" },
    })
      .then((url) => { if (!cancelled) setQrDataUrl(url); })
      .catch(() => { if (!cancelled) setQrError(true); });
    return () => { cancelled = true; };
  }, [upiLink]);
  const checkWithMyMoney = useCallback(async (value: string) => {
    if (value.trim().length < 12) return;
    setVerifyStatus("checking");
    try {
      const res = await fetch("/api/payments/mymoney/verify-utr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ utr: value.trim() }),
      });
      const data = await res.json();
      if (data?.data?.found) {
        setAutoVerifyData(data.data);
        if (data.data.status === "verified") {
          setVerifyStatus("auto_verified");
          toast.success("UTR auto-verified via myMoney!");
        } else {
          setVerifyStatus("idle");
        }
      } else {
        setVerifyStatus("idle");
      }
    } catch {
      setVerifyStatus("idle");
    }
  }, []);

  const handleUtrChange = (value: string) => {
    const cleaned = value.replace(/\D/g, "").slice(0, 22);
    setUtr(cleaned);
    setVerifyStatus("idle");
    setAutoVerifyData(null);

    if (utrCheckRef.current) clearTimeout(utrCheckRef.current);
    if (cleaned.length >= 12) {
      utrCheckRef.current = setTimeout(() => checkWithMyMoney(cleaned), 800);
    }
  };

  useEffect(() => {
    return () => { if (utrCheckRef.current) clearTimeout(utrCheckRef.current); };
  }, []);

  /* ── Submit UTR ── */
  const submitUtr = async () => {
    if (utr.trim().length < 12) {
      toast.error("Enter a valid 12-digit UTR / reference number");
      return;
    }
    try {
      setLoading(true);
      const res = await orderService.submitDirectUpiUtr(orderId, utr.trim());
      if (res.success) {
        setVerifyStatus("submitted");
        toast.success("Reference submitted. We'll verify and confirm your order.");
      } else {
        toast.error(res.error || "Failed to submit reference");
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to submit reference");
    } finally {
      setLoading(false);
    }
  };

  /* ── Copy VPA ── */
  const copyVpa = async () => {
    try {
      await navigator.clipboard.writeText(resolvedVpa);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Could not copy");
    }
  };

  /* ── Download QR ── */
  const downloadQr = () => {
    if (!qrDataUrl) return;
    const a = document.createElement("a");
    a.href = qrDataUrl;
    a.download = `zoberry-upi-qr-${orderNumber}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  /* ── Guide ── */
  const guide = APP_GUIDES[activeTab];


  return (
    <div className="mmp-root">
      {/* ═══ STEP 1: GUIDE BAR ═══ */}
      <div className="mmp-guide-section">
        <div className="mmp-guide-header">
          <InfoIcon />
          <span>How to find your UTR after paying</span>
        </div>

        {/* App tabs */}
        <div className="mmp-app-tabs">
          {APP_TABS.map((app) => {
            const g = APP_GUIDES[app];
            return (
              <button
                key={app}
                onClick={() => setActiveTab(app)}
                className={`mmp-app-tab ${activeTab === app ? "mmp-app-tab--active" : ""}`}
                style={activeTab === app ? { borderColor: g.color, background: g.bg } : {}}
                title={g.name}
              >
                <AppIcon app={app} size={28} />
                <span className="mmp-app-tab-label">{g.name}</span>
              </button>
            );
          })}
        </div>

        {/* Step list */}
        <div
          className="mmp-steps-box"
          style={{ borderLeft: `3px solid ${guide.color}`, background: guide.bg }}
        >
          <p className="mmp-steps-title" style={{ color: guide.color }}>
            {guide.name} — Find your UTR
          </p>
          <ol className="mmp-steps-list">
            {guide.steps.map((step, i) => (
              <li key={i} className="mmp-step-item">
                <span className="mmp-step-num" style={{ background: guide.color }}>{i + 1}</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
          {guide.note && (
            <p className="mmp-steps-note">
              <InfoIcon /> {guide.note}
            </p>
          )}
        </div>
      </div>

      {/* ═══ STEP 2: PAY ═══ */}
      <div className="mmp-pay-section">
        <div className="mmp-pay-header">
          <span className="mmp-step-badge">Scan &amp; Pay</span>
          <p className="mmp-pay-amount">₹{amount.toLocaleString("en-IN")}</p>
          <p className="mmp-pay-label">to <strong>{vpaName}</strong></p>
        </div>

        <div className="mmp-qr-area">
          {qrError ? (
            <div className="mmp-qr-fallback">
              <p className="mmp-qr-fallback-text">QR failed to generate. Use the UPI link below.</p>
              <a href={upiLink} className="mmp-btn mmp-btn--green mmp-btn--full">
                Open UPI Payment Link
              </a>
            </div>
          ) : qrDataUrl ? (
            <div className="mmp-qr-frame" onClick={() => setShowQrModal(true)}>
              <img src={qrDataUrl} alt="UPI QR Code" className="mmp-qr-img" />
              <div className="mmp-qr-zoom-hint">Click to enlarge</div>
            </div>
          ) : (
            <div className="mmp-qr-skeleton" />
          )}

          {/* UPI ID row */}
          <div className="mmp-vpa-row">
            <span className="mmp-vpa-label">UPI ID:</span>
            <span className="mmp-vpa-value">{resolvedVpa}</span>
            <button onClick={copyVpa} className="mmp-copy-btn" title="Copy UPI ID">
              {copied ? <CheckIcon /> : <CopyIcon />}
              <span>{copied ? "Copied!" : "Copy"}</span>
            </button>
          </div>

          {/* Action buttons */}
          <div className="mmp-qr-actions">
            <button onClick={() => setShowQrModal(true)} className="mmp-btn mmp-btn--ghost">
              Enlarge QR
            </button>
            <button onClick={downloadQr} className="mmp-btn mmp-btn--ghost">
              Download
            </button>
            <button onClick={() => window.print()} className="mmp-btn mmp-btn--ghost">
              Print
            </button>
          </div>

          <a href={upiLink} className="mmp-btn mmp-btn--green mmp-btn--full mmp-open-upi-btn">
            Open in UPI App
          </a>
        </div>
      </div>

      {/* ═══ STEP 3: UTR VERIFICATION ═══ */}
      <div className="mmp-utr-section">
        {(verifyStatus === "submitted" || verifyStatus === "auto_verified") ? (
          <div className="mmp-success-box">
            <div className="mmp-success-icon">✓</div>
            <h4 className="mmp-success-title">
              {verifyStatus === "auto_verified"
                ? "Payment Auto-Verified!"
                : "Payment Reference Received"}
            </h4>
            <p className="mmp-success-body">
              {verifyStatus === "auto_verified"
                ? `Your payment of ₹${autoVerifyData?.amount ?? amount} has been automatically verified. Your order will be confirmed shortly.`
                : `We'll verify the ₹${amount} credit in our account and confirm your order. You'll receive an update within a few minutes.`}
            </p>
            {verifyStatus !== "auto_verified" && (
              <p className="mmp-success-note">
                UTR submitted: <strong>{utr}</strong>
              </p>
            )}
          </div>
        ) : (
          <>
            <div className="mmp-utr-header">
              <span className="mmp-step-badge">Enter UTR to Confirm</span>
              <p className="mmp-utr-desc">
                After paying, find the <strong>UTR / Reference Number</strong> in your UPI app
                (see the guide above) and enter it here.
              </p>
            </div>

            <div className="mmp-utr-input-wrap">
              <label className="mmp-utr-label">UTR / Transaction Reference Number</label>
              <div className="mmp-utr-input-row">
                <input
                  value={utr}
                  onChange={(e) => handleUtrChange(e.target.value)}
                  placeholder="e.g. 408212345678"
                  inputMode="numeric"
                  maxLength={22}
                  className={`mmp-utr-input ${
                    utr.length > 0 && utr.length < 12
                      ? "mmp-utr-input--error"
                      : ""
                  }`}
                />
                {verifyStatus === "checking" && (
                  <span className="mmp-utr-checking">Checking...</span>
                )}
              </div>
              {utr.length > 0 && utr.length < 12 && (
                <p className="mmp-utr-hint-error">
                  UTR must be at least 12 digits ({utr.length}/12)
                </p>
              )}
              {utr.length >= 12 && verifyStatus === "idle" && (
                <p className="mmp-utr-hint-ok">
                  <CheckIcon /> Looks good — tap submit below
                </p>
              )}
            </div>

            <button
              onClick={submitUtr}
              disabled={loading || utr.length < 12}
              className="mmp-btn mmp-btn--blue mmp-btn--full"
            >
              {loading ? (
                <span className="mmp-spinner" />
              ) : (
                "I have paid — submit reference"
              )}
            </button>

            <div className="mmp-utr-footer-note">
              <ShieldIcon />
              <span>
                Your UTR is stored securely. Once verified, your order is confirmed automatically.
              </span>
            </div>
          </>
        )}
      </div>

      {/* ═══ SUPPORT ═══ */}
      <div className="mmp-support-section">
        <p className="mmp-support-title">Need help with your payment?</p>
        <div className="mmp-support-buttons">
          <a
            href={`https://wa.me/${SUPPORT_WHATSAPP}?text=${encodeURIComponent(
              `Hi! I need help with my Zoberry order ${orderNumber} (₹${amount}). UTR: ${utr || "not submitted yet"}`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mmp-btn mmp-btn--whatsapp"
          >
            <WhatsAppIcon /> Chat on WhatsApp
          </a>
          <a
            href={`mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(
              `Payment help - Order ${orderNumber}`
            )}&body=${encodeURIComponent(
              `Order: ${orderNumber}\nAmount: ₹${amount}\nUTR: ${utr || "not submitted yet"}\n\nIssue: `
            )}`}
            className="mmp-btn mmp-btn--email"
          >
            <EmailIcon /> Email Support
          </a>
        </div>
      </div>

      {/* ═══ QR MODAL ═══ */}
      {showQrModal && (
        <div
          className="mmp-modal-overlay"
          onClick={() => setShowQrModal(false)}
        >
          <div className="mmp-modal" onClick={(e) => e.stopPropagation()}>
            <div className="mmp-modal-header">
              <h4 className="mmp-modal-title">Scan to Pay ₹{amount.toLocaleString("en-IN")}</h4>
              <button
                onClick={() => setShowQrModal(false)}
                className="mmp-modal-close"
                aria-label="Close"
              >
                ×
              </button>
            </div>
            <img src={qrDataUrl} alt="UPI QR Code" className="mmp-modal-qr" />
            <p className="mmp-modal-vpa">{resolvedVpa}</p>
            <p className="mmp-modal-name">{resolvedVpaName}</p>
            <div className="mmp-modal-actions">
              <button onClick={downloadQr} className="mmp-btn mmp-btn--ghost">Download</button>
              <button onClick={() => window.print()} className="mmp-btn mmp-btn--ghost">Print</button>
              <a href={upiLink} className="mmp-btn mmp-btn--green">Open App</a>
            </div>
          </div>
        </div>
      )}

      {/* ═══ STYLES ═══ */}
      <style>{`
        .mmp-root {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          color: #111827;
          border-radius: 16px;
          border: 1px solid #e5e7eb;
          background: #ffffff;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0,0,0,0.06);
        }

        /* ─── Guide ─── */
        .mmp-guide-section {
          padding: 20px;
          border-bottom: 1px solid #f3f4f6;
          background: #fafafa;
        }
        .mmp-guide-header {
          display: flex; align-items: center; gap: 6px;
          font-size: 0.78rem; font-weight: 600; color: #6b7280;
          text-transform: uppercase; letter-spacing: 0.5px;
          margin-bottom: 14px;
        }
        .mmp-app-tabs {
          display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 14px;
        }
        .mmp-app-tab {
          display: flex; flex-direction: column; align-items: center; gap: 5px;
          padding: 10px 12px; border-radius: 12px;
          border: 1.5px solid #e5e7eb; background: white;
          cursor: pointer; transition: all 0.18s ease; min-width: 70px;
        }
        .mmp-app-tab:hover { border-color: #9ca3af; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
        .mmp-app-tab--active { box-shadow: 0 2px 12px rgba(0,0,0,0.1); }
        .mmp-app-tab-label { font-size: 0.68rem; font-weight: 600; color: #374151; white-space: nowrap; }
        .mmp-steps-box {
          padding: 14px 16px; border-radius: 10px;
          border-left-width: 3px; border-left-style: solid;
        }
        .mmp-steps-title { font-size: 0.8rem; font-weight: 700; margin: 0 0 10px; }
        .mmp-steps-list { margin: 0; padding: 0; list-style: none; display: flex; flex-direction: column; gap: 8px; }
        .mmp-step-item { display: flex; align-items: flex-start; gap: 10px; font-size: 0.85rem; color: #374151; }
        .mmp-step-num {
          flex-shrink: 0; width: 20px; height: 20px; border-radius: 50%;
          color: white; font-size: 0.7rem; font-weight: 700;
          display: flex; align-items: center; justify-content: center;
        }
        .mmp-steps-note {
          display: flex; align-items: center; gap: 6px;
          margin: 10px 0 0; font-size: 0.78rem; color: #6b7280; font-style: italic;
        }

        /* ─── Pay Section ─── */
        .mmp-pay-section {
          padding: 20px; border-bottom: 1px solid #f3f4f6; text-align: center;
        }
        .mmp-pay-header { margin-bottom: 16px; }
        .mmp-step-badge {
          display: inline-block; font-size: 0.72rem; font-weight: 700;
          background: #111827; color: white;
          padding: 3px 10px; border-radius: 20px; letter-spacing: 0.4px; margin-bottom: 8px;
        }
        .mmp-pay-amount { font-size: 2rem; font-weight: 800; color: #111827; margin: 4px 0 2px; }
        .mmp-pay-label { font-size: 0.85rem; color: #6b7280; }
        .mmp-qr-area { display: flex; flex-direction: column; align-items: center; gap: 12px; }
        .mmp-qr-frame {
          position: relative; cursor: zoom-in; border-radius: 14px;
          border: 2px solid #e5e7eb; padding: 12px; display: inline-block;
          transition: box-shadow 0.2s;
        }
        .mmp-qr-frame:hover { box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
        .mmp-qr-img { width: 200px; height: 200px; display: block; border-radius: 6px; }
        .mmp-qr-zoom-hint {
          position: absolute; bottom: 6px; right: 8px;
          font-size: 0.65rem; color: #9ca3af; font-weight: 500;
        }
        .mmp-qr-fallback { text-align: center; padding: 24px 0; }
        .mmp-qr-fallback-text { font-size: 0.85rem; color: #ef4444; margin-bottom: 12px; }
        .mmp-qr-skeleton {
          width: 200px; height: 200px; border-radius: 12px;
          background: linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%);
          background-size: 200% 100%;
          animation: mmp-shimmer 1.4s infinite;
        }
        @keyframes mmp-shimmer { to { background-position: -200% 0; } }
        .mmp-vpa-row {
          display: flex; align-items: center; gap: 8px;
          background: #f9fafb; border: 1px solid #e5e7eb;
          border-radius: 8px; padding: 8px 12px; max-width: 320px; width: 100%;
        }
        .mmp-vpa-label { font-size: 0.75rem; color: #6b7280; font-weight: 600; white-space: nowrap; }
        .mmp-vpa-value { flex: 1; font-size: 0.85rem; font-weight: 600; color: #111827; word-break: break-all; text-align: left; }
        .mmp-copy-btn {
          display: flex; align-items: center; gap: 4px;
          font-size: 0.75rem; font-weight: 600; color: #6b7280;
          background: none; border: none; cursor: pointer; padding: 2px 6px;
          border-radius: 6px; transition: all 0.15s; white-space: nowrap;
        }
        .mmp-copy-btn:hover { background: #e5e7eb; color: #111827; }
        .mmp-qr-actions { display: flex; gap: 8px; flex-wrap: wrap; justify-content: center; }
        .mmp-open-upi-btn { max-width: 320px; text-decoration: none; display: flex; align-items: center; justify-content: center; }

        /* ─── UTR Section ─── */
        .mmp-utr-section { padding: 20px; border-bottom: 1px solid #f3f4f6; }
        .mmp-utr-header { margin-bottom: 16px; }
        .mmp-utr-desc { font-size: 0.85rem; color: #6b7280; margin: 8px 0 0; line-height: 1.5; }
        .mmp-utr-input-wrap { margin-bottom: 14px; }
        .mmp-utr-label { display: block; font-size: 0.8rem; font-weight: 600; color: #374151; margin-bottom: 6px; }
        .mmp-utr-input-row { position: relative; display: flex; align-items: center; }
        .mmp-utr-input {
          width: 100%; padding: 11px 14px; border: 1.5px solid #e5e7eb;
          border-radius: 10px; font-size: 1rem; font-weight: 600;
          letter-spacing: 0.5px; background: #fafafa; color: #111827;
          outline: none; transition: border-color 0.2s, box-shadow 0.2s;
          box-sizing: border-box;
        }
        .mmp-utr-input:focus { border-color: #111827; box-shadow: 0 0 0 3px rgba(17,24,39,0.08); background: white; }
        .mmp-utr-input--verified { border-color: #22c55e !important; background: #f0fdf4 !important; }
        .mmp-utr-input--error { border-color: #f87171; }
        .mmp-utr-checking { position: absolute; right: 12px; font-size: 0.75rem; color: #6b7280; }
        .mmp-utr-verified-badge {
          position: absolute; right: 10px;
          display: flex; align-items: center; gap: 4px;
          font-size: 0.75rem; font-weight: 700; color: #16a34a;
        }
        .mmp-utr-hint-error { font-size: 0.75rem; color: #ef4444; margin: 5px 0 0; }
        .mmp-utr-hint-ok { font-size: 0.75rem; color: #16a34a; margin: 5px 0 0; display: flex; align-items: center; gap: 4px; }
        .mmp-utr-footer-note {
          display: flex; align-items: center; gap: 6px;
          margin-top: 12px; font-size: 0.75rem; color: #9ca3af;
        }

        /* ─── Success ─── */
        .mmp-success-box {
          text-align: center; background: #f0fdf4;
          border: 1px solid #bbf7d0; border-radius: 12px; padding: 24px 20px;
        }
        .mmp-success-icon {
          width: 48px; height: 48px; border-radius: 50%;
          background: #22c55e; color: white;
          font-size: 24px; font-weight: 700;
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 12px;
        }
        .mmp-success-title { font-size: 1.05rem; font-weight: 700; color: #14532d; margin: 0 0 8px; }
        .mmp-success-body { font-size: 0.85rem; color: #166534; margin: 0 0 8px; line-height: 1.5; }
        .mmp-success-note { font-size: 0.8rem; color: #6b7280; margin: 8px 0 0; }

        /* ─── Support ─── */
        .mmp-support-section {
          padding: 16px 20px; background: #f9fafb; text-align: center;
        }
        .mmp-support-title { font-size: 0.82rem; color: #6b7280; margin: 0 0 12px; font-weight: 500; }
        .mmp-support-buttons { display: flex; gap: 10px; justify-content: center; flex-wrap: wrap; }

        /* ─── Buttons ─── */
        .mmp-btn {
          display: inline-flex; align-items: center; justify-content: center; gap: 7px;
          padding: 10px 18px; border-radius: 10px; font-size: 0.875rem; font-weight: 600;
          border: none; cursor: pointer; transition: all 0.18s ease; text-decoration: none;
          white-space: nowrap; position: relative; overflow: hidden;
        }
        .mmp-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .mmp-btn--full { width: 100%; }
        .mmp-btn--green { background: #16a34a; color: white; }
        .mmp-btn--green:hover { background: #15803d; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(22,163,74,0.3); }
        .mmp-btn--blue { background: #1d4ed8; color: white; }
        .mmp-btn--blue:hover:not(:disabled) { background: #1e40af; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(29,78,216,0.3); }
        .mmp-btn--ghost {
          background: white; color: #374151;
          border: 1px solid #e5e7eb;
        }
        .mmp-btn--ghost:hover { background: #f3f4f6; border-color: #d1d5db; }
        .mmp-btn--whatsapp { background: #25D366; color: white; }
        .mmp-btn--whatsapp:hover { background: #1ebe5d; box-shadow: 0 4px 12px rgba(37,211,102,0.3); }
        .mmp-btn--email { background: #f3f4f6; color: #374151; border: 1px solid #e5e7eb; }
        .mmp-btn--email:hover { background: #e5e7eb; }

        /* ─── Spinner ─── */
        .mmp-spinner {
          width: 18px; height: 18px;
          border: 2px solid rgba(255,255,255,0.35);
          border-top-color: white;
          border-radius: 50%;
          animation: mmp-spin 0.6s linear infinite;
          display: inline-block;
        }
        @keyframes mmp-spin { to { transform: rotate(360deg); } }

        /* ─── Modal ─── */
        .mmp-modal-overlay {
          position: fixed; inset: 0; z-index: 9999;
          background: rgba(0,0,0,0.6);
          display: flex; align-items: center; justify-content: center; padding: 16px;
          backdrop-filter: blur(2px);
        }
        .mmp-modal {
          background: white; border-radius: 20px; padding: 24px;
          max-width: 380px; width: 100%; text-align: center;
          box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        }
        .mmp-modal-header {
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 16px;
        }
        .mmp-modal-title { font-size: 1.05rem; font-weight: 700; }
        .mmp-modal-close {
          width: 28px; height: 28px; border-radius: 50%;
          background: #f3f4f6; border: none; cursor: pointer;
          font-size: 18px; display: flex; align-items: center; justify-content: center;
        }
        .mmp-modal-close:hover { background: #e5e7eb; }
        .mmp-modal-qr { width: 280px; height: 280px; margin: 0 auto 10px; display: block; border-radius: 12px; }
        .mmp-modal-vpa { font-weight: 700; font-size: 0.9rem; margin: 0 0 2px; }
        .mmp-modal-name { font-size: 0.8rem; color: #6b7280; margin: 0 0 16px; }
        .mmp-modal-actions { display: flex; gap: 8px; justify-content: center; }

        /* ─── Print ─── */
        @media print {
          .mmp-guide-section, .mmp-utr-section, .mmp-support-section, .mmp-qr-actions,
          .mmp-open-upi-btn { display: none !important; }
        }

        /* ─── Responsive ─── */
        @media (max-width: 400px) {
          .mmp-app-tab { min-width: 58px; padding: 8px; }
          .mmp-app-tab-label { font-size: 0.62rem; }
          .mmp-qr-img { width: 168px; height: 168px; }
          .mmp-support-buttons { flex-direction: column; }
        }
      `}</style>
    </div>
  );
};

export default UpiQrPayment;
