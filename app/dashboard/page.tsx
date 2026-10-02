"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { checkIsAdmin } from "@/lib/adminConfig";
import Link from "next/link";
import { Gift, Users, Copy, ExternalLink, Package, Loader2, CreditCard } from "lucide-react";

export default function UserDashboard() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [completedReferralsCount, setCompletedReferralsCount] = useState(0);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUserData() {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.replace("/auth?redirect=/dashboard");
        return;
      }

      if (checkIsAdmin(user.email)) {
        router.replace("/admin");
        return;
      }

      // Fetch user orders matching user_id
      const { data: ords } = await supabase
        .from("orders")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      
      const userOrders = ords || [];
      setOrders(userOrders);

      // Dynamically compute completed orders count for loyalty tracking
      const completedCount = userOrders.filter(o => {
        const status = (o.delivery_status || "").toLowerCase().trim();
        return status === "completed" || status === "delivered";
      }).length;
      const loyaltyScore = completedCount % 4; // Cycles through 0, 1, 2, 3

      let { data: prof } = await supabase.from("profiles").select("*").eq("id", user.id).single();

      if (!prof) {
        const generatedCode = "PX-" + Math.random().toString(36).substring(2, 8).toUpperCase() + Date.now().toString().slice(-3);
        const defaultName = user.user_metadata?.full_name || user.email?.split("@")[0] || "Valued Customer";
        
        const { data: newProf } = await supabase
          .from("profiles")
          .insert([{ id: user.id, full_name: defaultName, referral_code: generatedCode, completed_orders: loyaltyScore }])
          .select()
          .single();
        
        prof = newProf;
      } else {
        if (!prof.referral_code || prof.referral_code === "PIXELS") {
          prof.referral_code = "PX-" + Math.random().toString(36).substring(2, 8).toUpperCase() + Date.now().toString().slice(-3);
        }
        await supabase.from("profiles").update({ completed_orders: loyaltyScore, referral_code: prof.referral_code }).eq("id", user.id);
        prof.completed_orders = loyaltyScore;
      }

      setProfile(prof);

      // Count completed referrals
      if (prof?.referral_code) {
        const { count } = await supabase
          .from("orders")
          .select("*", { count: "exact", head: true })
          .eq("referral_code_used", prof.referral_code)
          .in("delivery_status", ["delivered", "completed"]);
        
        setCompletedReferralsCount(count || 0);
      }

      setLoading(false);
    }

    loadUserData();
  }, [router]);

  const copyReferral = () => {
    if (!profile?.referral_code) return;
    navigator.clipboard.writeText(profile.referral_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-xs text-stone-400 font-mono gap-2">
        <Loader2 size={16} className="animate-spin text-brand-gold" /> Loading your secure client portal... ✨
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      <div>
        <h1 className="font-serif text-3xl font-bold text-brand-goldLight">
          Hello, {profile?.full_name || "Valued Customer"} 👋
        </h1>
        <p className="text-xs text-slate-400 mt-1">Track your custom surprises, completed referrals, and loyalty perks.</p>
      </div>

      {/* Rewards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-brand-card border border-brand-border p-6 rounded-3xl space-y-2 shadow-lg">
          <div className="flex items-center gap-2 text-brand-gold">
            <Users size={18} />
            <span className="text-[10px] font-mono uppercase tracking-wider">Completed Referrals</span>
          </div>
          <p className="text-3xl font-bold text-white">{completedReferralsCount} Friend(s)</p>
          <p className="text-[11px] text-slate-400">10% cash bonus transferred directly via UPI/PhonePe.</p>
        </div>

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

        <div className="bg-brand-card border border-brand-border p-6 rounded-3xl space-y-2 shadow-lg">
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Your Private Code</span>
          <div className="flex items-center justify-between bg-brand-dark border border-brand-border rounded-xl px-3 py-2">
            <span className="font-mono font-bold text-brand-gold tracking-widest text-sm">
              {profile?.referral_code}
            </span>
            <button onClick={copyReferral} className="text-xs text-slate-300 hover:text-white flex items-center gap-1 cursor-pointer">
              <Copy size={13} /> {copied ? "Copied" : "Copy"}
            </button>
          </div>
          <p className="text-[11px] text-slate-400">Friends get instant verification using this code.</p>
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
            <Link href="/explore" className="no-underline inline-block px-6 py-2.5 rounded-full bg-rose-gradient text-stone-950 text-xs font-bold uppercase tracking-wider shadow-lg">
              Order Your First Website
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-brand-border/60">
            {orders.map((o) => {
              const advance = o.advance_paid || 0;
              const balance = o.balance_due ?? (o.total_amount - advance);
              const isDeliveredOrCompleted = ["delivered", "completed"].includes(o.delivery_status);
              const isFullyPaid = balance <= 0;

              return (
                <div key={o.id} className="py-4 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-sm text-brand-goldLight">{o.customer_name || "Custom Keepsake"}</p>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-brand-dark border border-brand-border text-rose-300">{o.tracking_number}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Status: <span className="text-brand-gold font-medium uppercase">{o.delivery_status || "Processing"}</span> • {isFullyPaid ? <span className="text-emerald-400 font-bold">Full Payment Completed ✓ (₹0 Balance)</span> : <span>Paid: ₹{advance} <span className="text-rose-400 font-bold">(Balance Due: ₹{balance})</span></span>}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Link href={`/track?tracking=${o.tracking_number}`} className="no-underline px-4 py-2 rounded-xl bg-brand-dark border border-brand-border text-xs text-slate-200 hover:text-white transition">
                      Track Status ↗
                    </Link>

                    {balance > 0 ? (
                      <Link href={`/payment?tracking=${o.tracking_number}&amount=${balance}`} className="no-underline text-xs bg-amber-500/20 text-amber-300 border border-amber-500/30 px-3 py-1.5 rounded-xl font-semibold flex items-center gap-1 hover:bg-amber-500/30 transition">
                        <CreditCard size={13} /> Pay Balance ₹{balance} to Unlock Link
                      </Link>
                    ) : isDeliveredOrCompleted && o.live_website_url ? (
                      <a href={o.live_website_url} target="_blank" rel="noreferrer" className="no-underline text-xs text-emerald-400 hover:underline flex items-center gap-1 font-semibold">
                        Open Live Site <ExternalLink size={13} />
                      </a>
                    ) : (
                      <span className="text-[11px] text-slate-500 italic">Under Production (24h)</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}