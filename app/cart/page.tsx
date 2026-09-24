"use client";
import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function CartPage() {
  const { cart, removeFromCart, clearCart, total } = useCart();
  const [form, setForm] = useState({ name: "", phone: "", email: "" });
  const [placedOrder, setPlacedOrder] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return alert("Your cart is empty!");
    setLoading(true);

    const { data, error } = await supabase
      .from("orders")
      .insert([
        {
          customer_name: form.name,
          customer_phone: form.phone,
          user_email: form.email,
          order_type: "product",
          items: cart,
          total_amount: total,
          payment_status: "pending", // Can be wired up with Razorpay
          delivery_status: "processing",
        },
      ])
      .select("tracking_number")
      .single();

    setLoading(false);
    if (error) {
      alert("Checkout failed: " + error.message);
    } else {
      setPlacedOrder(data.tracking_number);
      clearCart();
    }
  };

  if (placedOrder) {
    return (
      <div className="max-w-md mx-auto my-12 p-6 border rounded-xl shadow-sm text-center">
        <h2 className="text-2xl font-bold text-green-600 mb-2">Order Confirmed!</h2>
        <p className="text-gray-600 mb-4">Save your tracking number:</p>
        <div className="bg-gray-100 p-3 rounded font-mono text-lg font-bold tracking-wide">
          {placedOrder}
        </div>
        <a href={`/track?id=${placedOrder}`} className="mt-6 inline-block text-indigo-600 font-semibold underline">
          Track this order →
        </a>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Your Cart</h1>
      {cart.length === 0 ? (
        <p className="text-gray-500">Your cart is empty.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-4">
            {cart.map((item) => (
              <div key={item.id} className="flex justify-between items-center border-b pb-4">
                <div>
                  <h3 className="font-semibold text-lg">{item.name}</h3>
                  <p className="text-sm text-gray-500">Qty: {item.quantity} × ₹{item.price}</p>
                </div>
                <button
                  onClick={() => removeFromCart(item.id)}
                  className="text-red-500 text-sm font-medium hover:underline"
                >
                  Remove
                </button>
              </div>
            ))}
            <div className="text-xl font-bold pt-2">Total: ₹{total}</div>
          </div>

          <form onSubmit={handleCheckout} className="border p-6 rounded-xl space-y-4 shadow-sm h-fit">
            <h2 className="text-xl font-semibold">Customer Details</h2>
            <input
              type="text"
              placeholder="Your Name"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full border p-2 rounded"
            />
            <input
              type="tel"
              placeholder="Phone Number"
              required
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full border p-2 rounded"
            />
            <input
              type="email"
              placeholder="Email Address"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full border p-2 rounded"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-black text-white font-medium rounded-lg hover:bg-gray-800 disabled:opacity-50"
            >
              {loading ? "Placing Order..." : `Place Order (₹${total})`}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}