"use client";
import React, { useState, useEffect, useRef } from "react";
import { orderService } from "@/services/order.service";
import toast from "react-hot-toast";

interface UroPayPaymentProps {
  orderId: string;
  orderNumber: string;
  amount: number;
}

const UroPayPayment = ({ orderId, orderNumber, amount }: UroPayPaymentProps) => {
  const [qr, setQr] = useState<string | null>(null);
  const [uroPayOrderId, setUroPayOrderId] = useState("");
  const [utr, setUtr] = useState("");
  const [loading, setLoading] = useState(false);
  const [paid, setPaid] = useState(false);
  const [status, setStatus] = useState("");
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const init = async () => {
    try {
      setLoading(true);
      const res = await orderService.createUroPay(orderId);
      if (res.success && res.data) {
        setQr(res.data.qr || null);
        setUroPayOrderId(res.data.uroPayOrderId || "");
      } else {
        toast.error(res.error || "Could not start UPI payment");
      }
    } catch (err: any) {
      toast.error(err?.message || "Could not start UPI payment");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    init();
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  const startPolling = () => {
    if (pollRef.current || !uroPayOrderId) return;
    pollRef.current = setInterval(async () => {
      try {
        const res = await orderService.getUroPayStatus(uroPayOrderId);
        const st =
          res?.data?.orderStatus || res?.data?.status || res?.data?.raw?.orderStatus || "";
        setStatus(st);
        if (st === "COMPLETED" || st === "PAID" || res?.data?.paymentReceived) {
          setPaid(true);
          if (pollRef.current) clearInterval(pollRef.current);
        }
      } catch {
        // ignore transient polling errors
      }
    }, 5000);
  };

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
        startPolling();
      } else {
        toast.error(res.error || "Failed to submit reference");
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to submit reference");
    } finally {
      setLoading(false);
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

  return (
    <div className="rounded-[10px] border border-gray-3 bg-white p-6 text-center shadow-1">
      <h3 className="text-lg font-semibold text-dark">Pay via UPI</h3>
      <p className="mb-4 mt-1 text-sm text-dark-4">
        Scan the QR with any UPI app (GPay, PhonePe, Paytm, BHIM) and pay ₹{amount}.
      </p>

      {loading && !qr && <p className="text-dark-4">Generating QR…</p>}

      {qr ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={qr}
          alt="UPI QR"
          className="mx-auto h-56 w-56 rounded-lg border border-gray-3 p-2 object-contain"
        />
      ) : !loading ? (
        <button onClick={init} className="text-blue underline">
          Retry QR
        </button>
      ) : null}

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
