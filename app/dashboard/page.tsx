"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import { Gift, HeartHandshake, Copy, ExternalLink, Package } from "lucide-react";

export default function UserDashboard() {
  const [profile, setProfile] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function loadUserData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Fetch user profile
        const { data: prof } = await supabase.from("profiles").select("*").eq("id", user.id).single();
        setProfile(prof || { full_name: user.email?.split("@")[0] || "Special Guest" });

        // Fetch user orders matching user_id
        const { data: ords } = await supabase
          .from("orders")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });
        
        if (ords) setOrders(ords);
      }
    }
    loadUserData();
  }, []);

  const copyReferral = () => {
    if (!profile?.referral_code) return;
    navigator.clipboard.writeText(profile.referral_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      <div>
        <h1 className="font-serif text-3xl font-bold text-brand-goldLight">
          Hello, {profile?.full_name || "Special Guest"} 👋
        </h1>
        <p className="text-xs text-slate-400 mt-1">Track your custom surprises, referral payouts, and loyalty perks.</p>
      </div>

      {/* Rewards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {/* Referral Earnings */}
        <div className="bg-brand-card border border-brand-border p-6 rounded-3xl space-y-2 shadow-lg">
          <div className="flex items-center gap-2 text-brand-gold">
            <HeartHandshake size={18} />
            <span className="text-[10px] font-mono uppercase tracking-wider">Referral Wallet</span>
          </div>
          <p className="text-3xl font-bold text-white">₹{profile?.wallet_balance || 0}</p>
          <p className="text-[11px] text-slate-400">10% earned on every completed friend referral.</p>
        </div>

        {/* Loyalty Counter */}
        <div className="bg-brand-card border border-brand-border p-6 rounded-3xl space-y-2 shadow-lg">
          <div className="flex items-center gap-2 text-brand-gold">
            <Gift size={18} />
            <span className="text-[10px] font-mono uppercase tracking-wider">Loyalty Free Site</span>
          </div>
          <p className="text-3xl font-bold text-brand-gold">
            {profile?.completed_orders || 0} / 3
          </p>
          <p className="text-[11px] text-slate-400">
            {(profile?.completed_orders || 0) >= 3
              ? "Perk Active! Your next order is 100% FREE."
              : `${3 - (profile?.completed_orders || 0)} more order(s) until 1 FREE website.`}
          </p>
        </div>

        {/* Share Code */}
        <div className="bg-brand-card border border-brand-border p-6 rounded-3xl space-y-2 shadow-lg">
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Your Private Code</span>
          <div className="flex items-center justify-between bg-brand-dark border border-brand-border rounded-xl px-3 py-2">
            <span className="font-mono font-bold text-brand-gold tracking-widest text-sm">
              {profile?.referral_code || "PIXELS"}
            </span>
            <button
              onClick={copyReferral}
              className="text-xs text-slate-300 hover:text-white flex items-center gap-1 cursor-pointer"
            >
              <Copy size={13} /> {copied ? "Copied" : "Copy"}
            </button>
          </div>
          <p className="text-[11px] text-slate-400">Friends get instant order verification using this.</p>
        </div>
      </div>

      {/* Orders List */}
      <div className="bg-brand-card border border-brand-border rounded-3xl p-6 sm:p-8 space-y-4 shadow-xl">
        <h2 className="font-serif text-xl font-bold text-white flex items-center gap-2">
          <Package size={18} className="text-brand-gold" /> Your Website Orders
        </h2>

        {orders.length === 0 ? (
          <div className="text-center py-10 space-y-3">
            <p className="text-xs text-slate-400">No websites ordered yet.</p>
            <Link
              href="/explore"
              className="inline-block px-6 py-2.5 rounded-full bg-rose-gradient text-stone-950 text-xs font-bold uppercase tracking-wider shadow-lg"
            >
              Order Your First Website
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-brand-border/60">
            {orders.map((o) => (
              <div key={o.id} className="py-4 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-sm text-brand-goldLight">{o.customer_name || "Custom Keepsake"}</p>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-brand-dark border border-brand-border text-rose-300">
                      {o.tracking_number}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Status: <span className="text-brand-gold font-medium uppercase">{o.delivery_status || "Processing"}</span> • Paid: ₹{o.advance_paid || 0} (Bal: ₹{o.balance_due || 0})
                  </p>
                </div>
                
                <div className="flex items-center gap-3">
                  <Link
                    href={`/track?tracking=${o.tracking_number}`}
                    className="px-4 py-2 rounded-xl bg-brand-dark border border-brand-border text-xs text-slate-200 hover:text-white transition"
                  >
                    Track Status ↗
                  </Link>
                  {o.live_website_url ? (
                    <a
                      href={o.live_website_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-emerald-400 hover:underline flex items-center gap-1 font-semibold"
                    >
                      Open Live Site <ExternalLink size={13} />
                    </a>
                  ) : (
                    <span className="text-[11px] text-slate-500 italic">Under Production (24h)</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}