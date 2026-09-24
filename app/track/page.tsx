"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

function TrackContent() {
  const searchParams = useSearchParams();
  const [trackingId, setTrackingId] = useState(searchParams.get("id") || "");
  const [order, setOrder] = useState<any>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchOrder = async (id: string) => {
    if (!id.trim()) return;
    setLoading(true);
    setError("");

    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("tracking_number", id.trim().toUpperCase())
      .single();

    setLoading(false);
    if (error || !data) {
      setError("No order or booking found with that tracking number.");
      setOrder(null);
    } else {
      setOrder(data);
    }
  };

  useEffect(() => {
    const initialId = searchParams.get("id");
    if (initialId) fetchOrder(initialId);
  }, [searchParams]);

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">Track Your Order / Booking</h1>

      <div className="flex gap-2 mb-6">
        <input
          type="text"
          placeholder="e.g. PX-A1B2C3D4"
          className="flex-1 border p-2 rounded uppercase font-mono"
          value={trackingId}
          onChange={(e) => setTrackingId(e.target.value)}
        />
        <button
          onClick={() => fetchOrder(trackingId)}
          disabled={loading}
          className="px-5 py-2 bg-black text-white rounded font-medium"
        >
          {loading ? "Searching..." : "Track"}
        </button>
      </div>

      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

      {order && (
        <div className="border rounded-xl p-6 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b pb-3">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Tracking ID</p>
              <p className="font-mono font-bold text-lg">{order.tracking_number}</p>
            </div>
            <span className="px-3 py-1 text-xs rounded-full uppercase font-bold bg-indigo-50 text-indigo-600 border border-indigo-200">
              {order.delivery_status}
            </span>
          </div>

          <div>
            <p className="text-sm text-gray-500">Customer Name: {order.customer_name}</p>
            <p className="text-sm text-gray-500">Order Type: {order.order_type}</p>
            <p className="text-sm text-gray-500">Placed on: {new Date(order.created_at).toLocaleDateString()}</p>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold text-sm mb-2">Order / Booking Details:</h4>
            <pre className="text-xs text-gray-700 whitespace-pre-wrap">
              {JSON.stringify(order.items, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}

export default function TrackPage() {
  return (
    <Suspense fallback={<div className="p-6 text-center">Loading tracker...</div>}>
      <TrackContent />
    </Suspense>
  );
}