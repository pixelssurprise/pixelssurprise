import Link from "next/link";
import { Sparkles, Gift, ArrowRight, HeartHandshake } from "lucide-react";

export default function HomePage() {
  return (
    <div className="space-y-24 pb-20">
      <section className="relative pt-16 sm:pt-24 px-4 text-center max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-brand-gold/30 bg-brand-card/80 text-brand-gold text-xs tracking-wider uppercase mb-6 shadow-inner">
          <Sparkles size={13} className="text-brand-gold" />
          Instagram Reel Sensation
        </div>

        <h1 className="font-serif text-4xl sm:text-7xl font-bold tracking-tight text-white leading-tight">
          Where Special Memories Become{" "}
          <span className="bg-rose-gradient bg-clip-text text-transparent italic font-normal">
            Digital Magic.
          </span>
        </h1>

        <p className="mt-6 text-slate-300 text-sm sm:text-base max-w-xl mx-auto font-light leading-relaxed">
          Custom interactive surprise websites and royal digital invitations. Unlocked with music, secret envelopes, love letters, and countdowns.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row justify-center items-center gap-4">
          <Link
            href="/explore"
            className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-rose-gradient text-brand-dark font-bold text-xs uppercase tracking-wider shadow-lg shadow-brand-gold/20 hover:opacity-90 transition flex items-center justify-center gap-2"
          >
            Explore Live Demos <ArrowRight size={15} />
          </Link>
          <Link
            href="/order"
            className="w-full sm:w-auto px-8 py-3.5 rounded-full border border-brand-border bg-brand-card hover:bg-brand-border text-brand-goldLight font-medium text-xs tracking-wider uppercase transition"
          >
            Submit Custom Idea
          </Link>
        </div>

        <div className="mt-14 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto text-left text-[11px] border-t border-brand-border/60 pt-6">
          <div className="flex items-center gap-2 text-slate-300">
            <span className="h-2 w-2 rounded-full bg-brand-gold" /> 50% Advance Only
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <span className="h-2 w-2 rounded-full bg-brand-gold" /> 24-Hour Express Delivery
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <span className="h-2 w-2 rounded-full bg-brand-gold" /> Custom Music & Password
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <span className="h-2 w-2 rounded-full bg-brand-gold" /> Interactive Mobile First
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-8 rounded-3xl bg-brand-card border border-brand-border relative overflow-hidden">
            <div className="flex items-center gap-3 mb-4">
              <span className="p-2.5 rounded-xl bg-brand-gold/10 text-brand-gold border border-brand-gold/20">
                <Gift size={20} />
              </span>
              <span className="text-[10px] uppercase tracking-widest text-brand-gold font-bold">Loyalty Perk</span>
            </div>
            <h3 className="font-serif text-2xl font-bold text-white mb-2">Buy 3 Websites, Get the 4th Free</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Once you finish 3 completed orders, your 4th custom website checkout is 100% free with no hidden charges.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-brand-card border border-brand-border relative overflow-hidden">
            <div className="flex items-center gap-3 mb-4">
              <span className="p-2.5 rounded-xl bg-brand-gold/10 text-brand-gold border border-brand-gold/20">
                <HeartHandshake size={20} />
              </span>
              <span className="text-[10px] uppercase tracking-widest text-brand-gold font-bold">Affiliate Program</span>
            </div>
            <h3 className="font-serif text-2xl font-bold text-white mb-2">10% Cash Referral Reward</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Share your custom referral code from your account. When friends book their site, you receive 10% commission.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}