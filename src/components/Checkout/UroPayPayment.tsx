"use client";
import React, { useState, useEffect, useRef } from "react";
import { orderService } from "@/services/order.service";
import toast from "react-hot-toast";

interface UroPayPaymentProps {
  orderId: string;
  orderNumber: string;
  amount: number;
  uroPayOrderId?: string;
}

const UroPayPayment = ({ orderId, orderNumber, amount, uroPayOrderId: existingUroPayOrderId }: UroPayPaymentProps) => {
  const [qr, setQr] = useState<string | null>(null);
  const [deepLink, setDeepLink] = useState("");
  const [uroPayOrderId, setUroPayOrderId] = useState(existingUroPayOrderId || "");
  const [utr, setUtr] = useState("");
  const [loading, setLoading] = useState(false);
  const [paid, setPaid] = useState(false);
  const [status, setStatus] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const [error, setError] = useState("");
  const [initError, setInitError] = useState(false);
  const [qrError, setQrError] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const initializedRef = useRef(false);

  useEffect(() => {
    setIsMobile(
      /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(
        navigator.userAgent
      )
    );
  }, []);

  const init = async () => {
    try {
      setLoading(true);
      setError("");
      setInitError(false);
      const res = await orderService.createUroPay(orderId);
      if (res.success && res.data) {
        setQr(res.data.qr || null);
        setUroPayOrderId(res.data.uroPayOrderId || "");
        setDeepLink(res.data.deepLink || "");
      } else {
        const msg = res.error || "Could not start UPI payment";
        setError(msg);
        setInitError(true);
        toast.error(msg);
      }
    } catch (err: any) {
      const msg = err?.message || "Could not start UPI payment";
      setError(msg);
      setInitError(true);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!existingUroPayOrderId && !initializedRef.current) {
      initializedRef.current = true;
      init();
    }
  }, [existingUroPayOrderId]);

  const startPolling = (orderIdToPoll: string) => {
    if (pollRef.current) return;
    pollRef.current = setInterval(async () => {
      try {
        const res = await orderService.getUroPayStatus(orderIdToPoll);
        const st =
          res?.data?.orderStatus ||
          res?.data?.status ||
          res?.data?.raw?.orderStatus ||
          "";
        setStatus(st);
        if (st === "COMPLETED" || st === "PAID" || res?.data?.paymentReceived) {
          setPaid(true);
          if (pollRef.current) {
            clearInterval(pollRef.current);
            pollRef.current = null;
          }
        }
      } catch {
        // ignore transient polling errors
      }
    }, 3000);
  };

  useEffect(() => {
    if (uroPayOrderId && !paid) {
      startPolling(uroPayOrderId);
    }
    return () => {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    };
  }, [uroPayOrderId, paid]);

  const submitUtr = async () => {
    if (utr.trim().length < 6) {
      toast.error("Enter a valid UTR / reference number");
      return;
    }
    try {
      setLoading(true);
      const res = await orderService.submitUtr(orderId, utr.trim());
      if (res.success) {
        toast.success("Reference submitted. Awaiting confirmation…");
        setUtr("");
      } else {
        toast.error(res.error || "Failed to submit reference");
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to submit reference");
    } finally {
      setLoading(false);
    }
  };

  const copyDeepLink = async () => {
    if (!deepLink) return;
    try {
      await navigator.clipboard.writeText(deepLink);
      toast.success("UPI link copied to clipboard");
    } catch {
      toast.error("Failed to copy link");
    }
  };

  const downloadQr = async () => {
    if (!qr) return;
    try {
      const res = await fetch(qr);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `upi-qr-${orderNumber}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      window.open(qr, "_blank");
    }
  };

  if (paid) {
    return (
      <div className="text-center py-10">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-light-6 text-green text-2xl">
          ✓
        </div>
        <h3 className="text-xl font-semibold text-dark">Payment Confirmed</h3>
        <p className="mt-2 text-dark-4">
          Order <span className="font-semibold">{orderNumber}</span> is confirmed.
        </p>
      </div>
    );
  }

  const showQr = qr && !qrError;
  const showDeepLinkActions = deepLink && (!qr || qrError);

  return (
    <div className="rounded-[10px] border border-gray-3 bg-white p-6 text-center shadow-1">
      <h3 className="text-lg font-semibold text-dark">Pay via UPI</h3>
      <p className="mb-4 mt-1 text-sm text-dark-4">
        Scan the QR with any UPI app (GPay, PhonePe, Paytm, BHIM) and pay ₹{amount}.
      </p>

      {loading && !qr && !deepLink && (
        <div className="flex flex-col items-center gap-3 py-8">
          <div className="h-8 w-8 border-4 border-blue border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-dark-4">Generating payment details…</p>
        </div>
      )}

      {initError && !qr && !deepLink && (
        <div className="py-4 space-y-3">
          <p className="text-sm text-red">{error}</p>
          <button
            onClick={init}
            className="rounded-lg bg-blue py-2.5 px-6 font-medium text-white hover:bg-blue-dark transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {showQr && (
        <div className="mx-auto max-w-sm">
          <div className="rounded-xl border border-gray-3 bg-gray-1 p-4 inline-block">
            <img
              src={qr}
              alt="UPI QR"
              className="h-56 w-56 rounded-lg object-contain"
              onError={() => setQrError(true)}
            />
          </div>
        </div>
      )}

      {showQr && !showDeepLinkActions && (
        <div className="mt-4 flex flex-col gap-2">
          <div className="flex gap-2">
            <button
              onClick={downloadQr}
              className="flex-1 rounded-lg border border-gray-3 py-2.5 text-sm font-medium text-dark hover:bg-gray-1 transition-colors"
            >
              Download QR
            </button>
          </div>
        </div>
      )}

      {showDeepLinkActions && (
        <div className="mt-4 flex flex-col gap-2">
          <a
            href={deepLink}
            className="w-full rounded-lg bg-green py-3 font-medium text-white hover:bg-green-dark transition-colors inline-flex items-center justify-center"
          >
            {isMobile ? "Open in UPI App" : "Open UPI Payment Link"}
          </a>
          <div className="flex gap-2">
            <button
              onClick={copyDeepLink}
              className="flex-1 rounded-lg border border-gray-3 py-2.5 text-sm font-medium text-dark hover:bg-gray-1 transition-colors"
            >
              Copy Link
            </button>
          </div>
        </div>
      )}

      <div className="mt-5 text-left">
        <label className="mb-2 block text-sm text-dark">
          UPI Reference / UTR Number
        </label>
        <input
          value={utr}
          onChange={(e) => setUtr(e.target.value)}
          placeholder="e.g. 123456789012"
          className="w-full rounded-md border border-gray-3 bg-gray-1 px-4 py-2.5 outline-none focus:border-transparent focus:shadow-input"
        />
        <button
          onClick={submitUtr}
          disabled={loading}
          className="mt-3 w-full rounded-md bg-blue py-3 font-medium text-white disabled:opacity-50"
        >
          {loading ? "Submitting…" : "I have paid – submit reference"}
        </button>
      </div>

      {status && <p className="mt-3 text-xs text-dark-4">Status: {status}</p>}

      <p className="mt-4 text-xs text-dark-4">
        After paying, UroPay confirms automatically once your bank SMS arrives. If not,
        submit the UTR above.
      </p>
    </div>
  );
};

export default UroPayPayment;
