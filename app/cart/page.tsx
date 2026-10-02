"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ShoppingBag, Trash2, ArrowRight, ShieldCheck } from "lucide-react";

export default function CartPage() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<any[]>([]);

  useEffect(() => {
    // Load saved cart items from localStorage if applicable
    const savedCart = localStorage.getItem("pixels_cart");
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch (e) {
        setCartItems([]);
      }
    }
  }, []);

  const removeItem = (index: number) => {
    const updated = cartItems.filter((_, i) => i !== index);
    setCartItems(updated);
    localStorage.setItem("pixels_cart", JSON.stringify(updated));
  };

  const subtotal = cartItems.reduce((acc, item) => acc + (Number(item.price) || 0), 0);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-8 text-stone-200">
      <div className="border-b border-[#25181b] pb-6">
        <h1 className="font-serif text-3xl font-bold text-white flex items-center gap-2">
          <ShoppingBag className="text-brand-gold" size={28} /> Your Cart & Selected Keepsakes
        </h1>
        <p className="text-xs text-stone-400 mt-1">Review your custom surprise website selection before proceeding.</p>
      </div>

      {cartItems.length === 0 ? (
        <div className="text-center py-16 bg-brand-card border border-brand-border rounded-3xl space-y-4 shadow-xl">
          <p className="text-xs text-stone-400">Your cart is currently empty.</p>
          <button
            onClick={() => router.push("/explore")}
            className="px-6 py-3 rounded-full bg-rose-gradient text-stone-950 font-bold text-xs uppercase tracking-wider shadow-lg cursor-pointer"
          >
            Explore Templates
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-8 space-y-4">
            {cartItems.map((item, idx) => (
              <div key={idx} className="bg-brand-card border border-brand-border p-5 rounded-2xl flex items-center justify-between gap-4 shadow-md">
                <div className="flex items-center gap-4">
                  <img src={item.thumbnail_url || "/placeholder.jpg"} alt="" className="w-16 h-14 object-cover rounded-xl border border-brand-border" />
                  <div>
                    <h3 className="font-serif text-white font-medium text-sm">{item.title}</h3>
                    <span className="text-xs text-rose-300 font-mono">₹{item.price}</span>
                  </div>
                </div>
                <button onClick={() => removeItem(idx)} className="text-red-400 hover:text-red-300 p-2 cursor-pointer">
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>

          <div className="lg:col-span-4 bg-brand-card border border-brand-border rounded-3xl p-6 space-y-4 shadow-xl sticky top-28">
            <h3 className="font-serif text-lg font-bold text-white border-b border-brand-border pb-3">Order Summary</h3>
            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between text-stone-400">
                <span>Subtotal:</span>
                <span className="text-white">₹{subtotal}</span>
              </div>
              <div className="flex justify-between text-brand-gold font-bold pt-2 border-t border-brand-border">
                <span>50% Advance Due Now:</span>
                <span>₹{Math.round(subtotal / 2)}</span>
              </div>
            </div>

            <button
              onClick={() => router.push(`/order?templateId=${cartItems[0]?.id}`)}
              className="w-full py-3.5 rounded-full bg-rose-gradient text-stone-950 font-bold text-xs uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 cursor-pointer"
            >
              Proceed to Booking <ArrowRight size={14} />
            </button>

            <div className="flex items-center gap-2 text-[10px] text-stone-500 justify-center pt-2">
              <ShieldCheck size={14} className="text-emerald-400" /> Secure 50% advance split payment protection.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}