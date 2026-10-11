"use client";

import Link from "next/link";
import { Gift, Sparkles, CheckCircle2 } from "lucide-react";

export default function LoyaltyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-10">
      
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#201317] border border-brand-border text-brand-goldLight text-xs font-mono uppercase tracking-widest mx-auto">
          <Gift size={14} className="text-brand-gold" /> Loyalty Reward Program
        </div>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-white">
          Buy 3 Websites, Get the 4th Free
        </h1>
        <p className="text-xs sm:text-sm text-stone-400 max-w-xl mx-auto leading-relaxed">
          We love celebrating milestones with our returning clients. Every completed order brings you closer to your next custom website completely on us.
        </p>
      </div>

      {/* Main Feature Card */}
      <div className="bg-brand-card border border-brand-border rounded-3xl p-6 sm:p-10 space-y-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Gift size={160} className="text-brand-gold" />
        </div>

        <div className="space-y-4 relative z-10">
          <h2 className="font-serif text-2xl font-bold text-brand-goldLight">How It Works</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div className="p-5 bg-[#080506] border border-brand-border rounded-2xl space-y-2">
              <span className="text-xs font-mono text-brand-gold font-bold">STEP 01</span>
              <h3 className="text-white font-serif text-lg font-semibold">Order 3 Websites</h3>
              <p className="text-xs text-stone-400 leading-relaxed">
                Purchase any custom surprise website or royal digital invitation for your loved ones.
              </p>
            </div>

            <div className="p-5 bg-[#080506] border border-brand-border rounded-2xl space-y-2">
              <span className="text-xs font-mono text-brand-gold font-bold">STEP 02</span>
              <h3 className="text-white font-serif text-lg font-semibold">Automatic Tracking</h3>
              <p className="text-xs text-stone-400 leading-relaxed">
                Your account dashboard automatically monitors your completed orders in real-time.
              </p>
            </div>

            <div className="p-5 bg-[#080506] border border-brand-border rounded-2xl space-y-2">
              <span className="text-xs font-mono text-brand-gold font-bold">STEP 03</span>
              <h3 className="text-white font-serif text-lg font-semibold">100% Free 4th Site</h3>
              <p className="text-xs text-stone-400 leading-relaxed">
                Once your 3rd order is completed, your 4th custom website checkout is entirely free with zero hidden charges.
              </p>
            </div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#140b0d] border border-[#382328] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Sparkles className="text-brand-gold shrink-0" size={24} />
            <p className="text-xs text-rose-200 leading-relaxed">
              Track your exact progress right inside your user portal anytime. No coupon codes needed!
            </p>
          </div>
          <Link
            href="/dashboard"
            className="no-underline px-6 py-2.5 rounded-full bg-rose-gradient text-stone-950 font-bold text-xs tracking-wider uppercase shrink-0 shadow-lg"
          >
            Check My Progress →
          </Link>
        </div>

      </div>

    </div>
  );
}