"use client";

import { useState, Suspense, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { ShieldCheck, ArrowRight, Smartphone, MessageCircle } from "lucide-react";

function PaymentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const trackingNumber = searchParams.get("tracking") || "";
  const amount = searchParams.get("amount") || "0";

  const [order, setOrder] = useState<any>(null);
  const [utrNumber, setUtrNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // 🔹 PERSONAL UPI DETAILS
  const personalUpiId = "kbhojrani@oksbi";
  const yourDisplayName = "PixelsSurprise";
  const adminWhatsAppNumber = "9112114603"; // Admin WhatsApp alert recipient

  // Generate standard NPCI UPI Intent Link with pre-filled amount
  const upiDeepLink = `upi://pay?pa=${personalUpiId}&pn=${encodeURIComponent(yourDisplayName)}&am=${amount}&cu=INR&tn=Advance%20for%20Order%20${trackingNumber}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiDeepLink)}`;

  useEffect(() => {
    async function fetchOrderInfo() {
      if (!trackingNumber) return;
      const { data } = await supabase
        .from("orders")
        .select("*")
        .eq("tracking_number", trackingNumber)
        .single();
      if (data) setOrder(data);
    }
    fetchOrderInfo();
  }, [trackingNumber]);

  const handleUtrChange = (val: string) => {
    setUtrNumber(val);
    if (!val.trim()) {
      setError("UPI Transaction ID / UTR is required.");
    } else if (val.trim().length < 8) {
      setError("Please enter a valid UPI reference or UTR number.");
    } else {
      setError("");
    }
  };

  const handleConfirmPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!utrNumber.trim() || error) {
      alert("Please enter a valid UPI transaction reference number.");
      return;
    }

    setLoading(true);

    // Update order status in Supabase
    const { error: updateError } = await supabase
      .from("orders")
      .update({ 
        payment_status: "paid", // Matches admin dashboard payment filter state
        items: {
          ...(order?.items || {}),
          utr_reference: utrNumber.trim()
        }
      })
      .eq("tracking_number", trackingNumber);

    if (updateError) {
      alert("Error updating order payment status: " + updateError.message);
      setLoading(false);
      return;
    }

    // Construct Instant WhatsApp Alert Message for Admin
    const message = `🔔 *NEW ADVANCE PAYMENT RECEIVED!* 🎁\n\n` +
      `📦 *Tracking ID:* ${trackingNumber}\n` +
      `👤 *Customer:* ${order?.customer_name || "Valued Client"}\n` +
      `📱 *Phone:* ${order?.customer_phone || "N/A"}\n` +
      `💰 *Total Amount:* ₹${order?.total_amount || 0}\n` +
      `✨ *Advance Paid:* ₹${amount}\n` +
      `🔢 *UPI UTR / Ref:* ${utrNumber.trim()}\n\n` +
      `Check your admin dashboard to begin fulfillment!`;

    const whatsappUrl = `https://wa.me/${adminWhatsAppNumber}?text=${encodeURIComponent(message)}`;

    // Open WhatsApp notification tab for admin and route customer to tracker
    window.open(whatsappUrl, "_blank");
    setLoading(false);
    router.push(`/track?tracking=${trackingNumber}`);
  };

  return (
    <div className="min-h-screen bg-[#050811] text-[#fcebed] px-4 sm:px-6 py-12 max-w-xl mx-auto space-y-8">
      
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#131b2e] border border-[#3b5078] text-rose-200 text-[11px] font-mono uppercase tracking-widest">
          <ShieldCheck size={14} /> Secure UPI Advance Checkout & WhatsApp Alert
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-white">
          Complete Your 50% Advance
        </h1>
        <p className="text-xs text-stone-400">
          Tracking ID: <span className="text-rose-300 font-mono font-bold">{trackingNumber}</span>
        </p>
      </div>

      {/* Payment Box */}
      <div className="bg-brand-card border border-brand-border rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl text-center">
        
        <div>
          <span className="text-xs uppercase tracking-widest text-stone-400 font-mono block">Exact Amount to Pay</span>
          <div className="text-4xl font-serif font-bold text-white mt-1">₹{amount}</div>
          <p className="text-[11px] text-rose-300 mt-1">Remaining 50% is paid only after final website approval.</p>
        </div>

        {/* Mobile Direct Pay Button */}
        <div className="space-y-3">
          <a
            href={upiDeepLink}
            className="w-full py-4 rounded-xl bg-rose-gradient text-stone-950 font-bold uppercase tracking-widest text-xs hover:opacity-95 transition shadow-lg flex items-center justify-center gap-2 text-center cursor-pointer"
          >
            <Smartphone size={16} /> Pay ₹{amount} via GPay / PhonePe / Paytm 🚀
          </a>
          <p className="text-[10px] text-stone-500">Tap above if you are on your phone to launch your UPI app instantly.</p>
        </div>

        <div className="relative flex py-2 items-center">
          <div className="flex-grow border-t border-brand-border"></div>
          <span className="flex-shrink mx-4 text-stone-500 text-[10px] uppercase font-mono">Or Scan QR Code</span>
          <div className="flex-grow border-t border-brand-border"></div>
        </div>

        {/* QR Code Container */}
        <div className="p-5 bg-[#050811] border border-brand-border rounded-2xl max-w-xs mx-auto space-y-3">
          <div className="w-44 h-44 bg-white mx-auto rounded-xl flex items-center justify-center p-2 shadow-inner">
            <img src={qrCodeUrl} alt="UPI QR Code" className="w-full h-full object-contain rounded-lg" />
          </div>
          <div className="text-[11px] text-stone-300 font-mono">
            Personal UPI ID: <span className="text-rose-300 font-bold">{personalUpiId}</span>
          </div>
        </div>

        {/* UTR Verification Form & WhatsApp Alert Trigger */}
        <form onSubmit={handleConfirmPayment} className="space-y-4 text-left pt-2">
          <div>
            <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider mb-1.5 font-mono">
              Enter UPI Transaction ID / UTR Number <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. 426819235710"
              value={utrNumber}
              onChange={(e) => handleUtrChange(e.target.value)}
              className="w-full bg-[#050811] border border-brand-border rounded-xl px-4 py-3 text-xs text-white uppercase tracking-wider"
              required
            />
            {error && <p className="text-rose-400 text-[11px] mt-1">⚠️ {error}</p>}
          </div>

          <button
            type="submit"
            disabled={loading || !!error || !utrNumber.trim()}
            className="w-full py-4 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-stone-950 font-bold uppercase tracking-widest text-xs transition shadow-lg cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? "Processing Order..." : "Verify & Send WhatsApp Alert to Admin 🚀"}
            <MessageCircle size={15} />
          </button>
        </form>

      </div>

    </div>
  );
}

export default function PaymentPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#050811] text-white flex items-center justify-center">Loading Checkout...</div>}>
      <PaymentContent />
    </Suspense>
  );
}