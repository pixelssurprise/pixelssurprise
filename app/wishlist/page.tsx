"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Heart, Play, ShoppingBag, ArrowRight, Loader2, Trash2 } from "lucide-react";

export default function WishlistPage() {
  const router = useRouter();
  const [wishlistItems, setWishlistItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadWishlist() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.replace("/auth?redirect=/wishlist");
        return;
      }

      // Fetch user's wishlist items joined with templates table
      const { data, error } = await supabase
        .from("wishlists")
        .select(`
          id,
          template_id,
          templates (*)
        `)
        .eq("user_id", user.id);

      if (!error && data) {
        // Extract the nested template objects
        const templatesList = data.map((item: any) => item.templates).filter(Boolean);
        setWishlistItems(templatesList);
      }
      setLoading(false);
    }

    loadWishlist();
  }, [router]);

  const removeFromWishlist = async (templateId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from("wishlists")
      .delete()
      .eq("user_id", user.id)
      .eq("template_id", templateId);

    if (!error) {
      setWishlistItems((prev) => prev.filter((item) => item.id !== templateId));
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-xs text-stone-400 font-mono gap-2">
        <Loader2 size={16} className="animate-spin text-brand-gold" /> Loading your wishlist... ✨
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-8 text-stone-200">
      <div className="border-b border-[#25181b] pb-6">
        <h1 className="font-serif text-3xl font-bold text-white flex items-center gap-2">
          <Heart className="text-rose-500" size={28} fill="currentColor" /> Your Saved Wishlist
        </h1>
        <p className="text-xs text-stone-400 mt-1">Review your favorite surprise and invitation website concepts saved for later.</p>
      </div>

      {wishlistItems.length === 0 ? (
        <div className="text-center py-20 bg-brand-card border border-brand-border rounded-3xl space-y-4 shadow-xl">
          <p className="text-xs text-stone-400">Your wishlist is currently empty.</p>
          <Link
            href="/explore"
            className="no-underline inline-block px-6 py-3 rounded-full bg-rose-gradient text-stone-950 font-bold text-xs uppercase tracking-wider shadow-lg"
          >
            Explore & Save Designs
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishlistItems.map((item) => (
            <div
              key={item.id}
              className="bg-brand-card border border-brand-border rounded-3xl p-5 flex flex-col justify-between hover:border-brand-gold/40 transition shadow-xl relative"
            >
              <button
                onClick={() => removeFromWishlist(item.id)}
                className="absolute top-8 right-8 z-20 p-2.5 rounded-full bg-rose-500/20 border border-rose-500 text-rose-400 transition cursor-pointer backdrop-blur-md hover:bg-rose-500/30"
                title="Remove from Wishlist"
              >
                <Trash2 size={15} />
              </button>

              <div className="space-y-3">
                <div className="aspect-[16/10] rounded-2xl bg-brand-dark border border-brand-border overflow-hidden relative flex items-center justify-center">
                  {item.thumbnail_url ? (
                    <img src={item.thumbnail_url} alt={item.title} className="w-full h-full object-cover" />
                  ) : (
                    <p className="font-serif text-lg font-bold text-brand-goldLight">{item.title}</p>
                  )}
                </div>

                <div>
                  <span className="text-[10px] font-mono text-brand-gold uppercase tracking-wider">{item.category}</span>
                  <h3 className="font-serif text-xl font-bold text-white mt-1">{item.title}</h3>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">{item.description}</p>
                </div>
              </div>

              <div className="pt-5 mt-4 border-t border-brand-border/60 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-500 block">Starting from</span>
                  <span className="text-lg font-bold text-brand-gold font-mono">₹{item.price}</span>
                </div>

                <Link
                  href={`/order?templateId=${item.id}&price=${item.price}`}
                  className="no-underline px-4 py-2 rounded-xl bg-rose-gradient text-brand-dark font-bold text-xs uppercase tracking-wider hover:opacity-90 transition flex items-center gap-1 shadow-md shadow-brand-gold/10"
                >
                  Order <ArrowRight size={13} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}