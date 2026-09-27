"use client";

import Link from "next/link";
import { HeartHandshake, Copy, ExternalLink, ShieldCheck } from "lucide-react";

export default function AffiliatePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-10">
      
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#201317] border border-brand-border text-brand-goldLight text-xs font-mono uppercase tracking-widest mx-auto">
          <HeartHandshake size={14} className="text-brand-gold" /> Affiliate & Referral Partner
        </div>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-white">
          10% Cash Referral Reward
        </h1>
        <p className="text-xs sm:text-sm text-stone-400 max-w-xl mx-auto leading-relaxed">
          Share the magic of PixelsSurprise with your friends and earn a direct 10% cash commission on every completed order booked through your private referral code.
        </p>
      </div>

      {/* Main Affiliate Box */}
      <div className="bg-brand-card border border-brand-border rounded-3xl p-6 sm:p-10 space-y-8 shadow-2xl relative overflow-hidden">
        
        <div className="space-y-4">
          <h2 className="font-serif text-2xl font-bold text-brand-goldLight">Program Benefits</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 bg-[#080506] border border-brand-border rounded-2xl space-y-2">
              <div className="flex items-center gap-2 text-brand-gold font-semibold text-xs uppercase font-mono">
                <ShieldCheck size={16} /> Instant Tracking
              </div>
              <h3 className="text-white font-serif text-lg font-semibold">Your Unique Code</h3>
              <p className="text-xs text-stone-400 leading-relaxed">
                Every registered user receives a private referral code inside their dashboard to share with friends or family.
              </p>
            </div>

            <div className="p-5 bg-[#080506] border border-brand-border rounded-2xl space-y-2">
              <div className="flex items-center gap-2 text-brand-gold font-semibold text-xs uppercase font-mono">
                <ShieldCheck size={16} /> Direct Payouts
              </div>
              <h3 className="text-white font-serif text-lg font-semibold">10% Commission Wallet</h3>
              <p className="text-xs text-stone-400 leading-relaxed">
                Whenever your referred friend books their surprise website, 10% of the total amount gets credited directly to your wallet.
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-[#140b0d] border border-[#382328] text-center space-y-4">
          <h3 className="font-serif text-xl font-bold text-white">Ready to start earning?</h3>
          <p className="text-xs text-stone-400 max-w-md mx-auto">
            Sign in to your client account right now to copy your referral code and check your wallet balance.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/dashboard"
              className="no-underline px-6 py-2.5 rounded-full bg-rose-gradient text-stone-950 font-bold text-xs tracking-wider uppercase shadow-lg"
            >
              Get My Referral Code →
            </Link>
            <Link
              href="/explore"
              className="no-underline px-6 py-2.5 rounded-full bg-[#201317] border border-brand-border text-stone-300 hover:text-white text-xs font-semibold tracking-wider uppercase transition"
            >
              Explore Demos
            </Link>
          </div>
        </div>

      </div>

    </div>
  );
}