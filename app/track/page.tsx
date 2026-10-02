"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Package, Search, CheckCircle2, Clock, ExternalLink, CreditCard, AlertCircle, Loader2 } from "lucide-react";

function TrackContent() {
  const searchParams = useSearchParams();
  const trackingParam = searchParams.get("tracking") || "";

  const [trackingId, setTrackingId] = useState(trackingParam);
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const fetchOrderDetails = async (idToSearch: string) => {
    if (!idToSearch.trim()) return;
    setLoading(true);
    setErrorMsg("");
    setOrder(null);

    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("tracking_number", idToSearch.trim().toUpperCase())
      .single();

    if (error || !data) {
      setErrorMsg("Order not found. Please check your tracking number.");
    } else {
      setOrder(data);
    }
    setLoading(false);
  };

  // Automatically fetch if tracking ID is passed via URL query parameter
  useEffect(() => {
    if (trackingParam) {
      setTrackingId(trackingParam);
      fetchOrderDetails(trackingParam);
    }
  }, [trackingParam]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOrderDetails(trackingId);
  };

  const advance = order?.advance_paid || 0;
  const balance = order?.balance_due ?? (order?.total_amount - advance);
  const isFullyPaid = balance <= 0;
  const isDeliveredOrCompleted = ["delivered", "completed"].includes(order?.delivery_status);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 space-y-8 text-stone-200">
      <div className="text-center space-y-2">
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-white">Track Your Order</h1>
        <p className="text-xs text-stone-400">Monitor your custom website build status and fulfillment in real-time.</p>
      </div>

      {/* Search Input Box */}
      <form onSubmit={handleSearchSubmit} className="bg-brand-card border border-brand-border rounded-3xl p-4 sm:p-6 shadow-xl flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-3.5 text-stone-500" size={18} />
          <input
            type="text"
            placeholder="Enter Tracking ID (e.g. PX-VVAE787T)"
            value={trackingId}
            onChange={(e) => setTrackingId(e.target.value.toUpperCase())}
            className="w-full bg-brand-dark border border-brand-border rounded-2xl pl-12 pr-4 py-3 text-xs text-white uppercase font-mono outline-none focus:border-rose-400"
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-3 rounded-2xl bg-rose-gradient text-stone-950 font-bold text-xs uppercase tracking-wider cursor-pointer shadow-lg hover:opacity-95 transition disabled:opacity-50"
        >
          {loading ? <Loader2 size={16} className="animate-spin mx-auto" /> : "Track Order"}
        </button>
      </form>

      {errorMsg && (
        <div className="bg-rose-950/40 border border-rose-500/40 p-4 rounded-2xl text-rose-300 text-xs flex items-center gap-2.5">
          <AlertCircle size={16} className="shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Order Details Result */}
      {order && (
        <div className="bg-brand-card border border-brand-border rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl animate-fade-in">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-brand-border pb-5">
            <div>
              <span className="font-mono text-xs font-bold text-rose-300 bg-rose-500/10 px-3 py-1 rounded-full border border-rose-500/20">
                {order.tracking_number}
              </span>
              <h2 className="font-serif text-xl font-bold text-white mt-2">{order.customer_name}</h2>
              <p className="text-xs text-stone-400">Ordered on: {new Date(order.created_at).toLocaleDateString()}</p>
            </div>
            <div className="text-right">
              <span className="inline-block px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
                {order.delivery_status}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="bg-brand-dark p-4 rounded-2xl border border-brand-border space-y-1 font-mono">
              <div className="text-stone-400">Total Price: <span className="text-white font-bold">₹{order.total_amount}</span></div>
              <div className="text-emerald-400">Paid Amount: <span className="font-bold">₹{advance}</span></div>
              <div className="text-amber-300">Balance Due: <span className="font-bold">₹{balance}</span></div>
            </div>

            <div className="bg-brand-dark p-4 rounded-2xl border border-brand-border space-y-1">
              <div className="text-stone-400 text-[10px] uppercase font-mono">Payment Status</div>
              <div className="text-white font-semibold uppercase text-xs">{isFullyPaid ? "Full Payment Completed ✓" : "Pending Balance"}</div>
            </div>
          </div>

          {/* Action / Unlock Section */}
          <div className="pt-2">
            {balance > 0 ? (
              <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-xs text-amber-200">
                  Remaining balance of <strong>₹{balance}</strong> is due to unlock your final live website link.
                </p>
                <a
                  href={`/payment?tracking=${order.tracking_number}&amount=${balance}`}
                  className="no-underline px-5 py-2.5 rounded-xl bg-amber-500 text-stone-950 font-bold text-xs uppercase tracking-wider shadow-md hover:bg-amber-400 transition"
                >
                  Pay Balance ₹{balance} →
                </a>
              </div>
            ) : isDeliveredOrCompleted && order.live_website_url ? (
              <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-xs text-emerald-200">Your custom website is fully completed and live!</p>
                <a
                  href={order.live_website_url}
                  target="_blank"
                  rel="noreferrer"
                  className="no-underline px-6 py-2.5 rounded-xl bg-emerald-500 text-stone-950 font-bold text-xs uppercase tracking-wider shadow-md flex items-center gap-1.5 hover:bg-emerald-400 transition"
                >
                  Open Live Website <ExternalLink size={14} />
                </a>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-brand-dark border border-brand-border text-center text-xs text-stone-400 italic">
                Your order is currently under production. You will receive your live website link as soon as it is finalized!
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function TrackPage() {
  return (
    <Suspense fallback={<div className="text-center py-20 text-xs text-stone-500">Loading tracker...</div>}>
      <TrackContent />
    </Suspense>
  );
}