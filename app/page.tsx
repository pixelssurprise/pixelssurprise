import Link from "next/link";
import { Sparkles, Gift, ArrowRight, HeartHandshake } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen pb-16 space-y-12">
      {/* Hero Section */}
      <section className="relative pt-8 sm:pt-14 px-4 sm:px-6 text-center max-w-4xl mx-auto space-y-4">
        <div className="badge inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[11px] font-mono uppercase tracking-widest shadow-sm">
          <Sparkles size={12} /> Bespoke Digital Keepsakes
        </div>

        {/* Main Brand Title - Big, Bold & Prominent */}
        <h1 className="font-serif text-5xl sm:text-7xl font-bold tracking-tight text-white">
          Pixels
          <span className="bg-rose-gradient bg-clip-text text-transparent">
            Surprise
          </span>
        </h1>

        {/* Supporting Slogan - Smaller and Refined */}
        <p className="font-serif text-lg sm:text-2xl text-brand-goldLight/90 italic font-light max-w-2xl mx-auto">
          Where Special Memories Become Digital Magic.
        </p>

        <p className="text-stone-300 text-xs sm:text-sm max-w-xl mx-auto font-light leading-relaxed pt-2">
          Custom interactive surprise websites and royal digital invitations. Unlocked with music, secret envelopes, love letters, and countdowns.
        </p>

        <div className="mt-7 flex flex-col sm:flex-row justify-center items-center gap-3.5">
          <Link
            href="/explore"
            className="btn-primary w-full sm:w-auto px-7 py-3.5 rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer"
          >
            Explore Live Demos <ArrowRight size={15} />
          </Link>
          <Link
            href="/book"
            className="btn-outline w-full sm:w-auto px-7 py-3.5 rounded-xl font-medium text-xs tracking-wider uppercase transition shadow-md cursor-pointer"
          >
            Submit Custom Idea
          </Link>
        </div>
      </section>

      {/* Perks Section with Clear Contrast against Background */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="bg-brand-card p-6 sm:p-8 rounded-2xl relative overflow-hidden">
            <div className="flex items-center gap-3 mb-3">
              <span className="p-2.5 rounded-xl bg-brand-dark text-brand-gold border border-brand-border">
                <Gift size={20} />
              </span>
              <span className="text-[10px] uppercase tracking-widest text-brand-gold font-bold font-mono">
                Loyalty Perk
              </span>
            </div>
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-white mb-2">
              Buy 3 Websites, Get the 4th Free
            </h3>
            <p className="text-stone-300 text-xs leading-relaxed">
              Once you finish 3 completed orders, your 4th custom website checkout is 100% free with no hidden charges.
            </p>
          </div>

          <div className="bg-brand-card p-6 sm:p-8 rounded-2xl relative overflow-hidden">
            <div className="flex items-center gap-3 mb-3">
              <span className="p-2.5 rounded-xl bg-brand-dark text-brand-gold border border-brand-border">
                <HeartHandshake size={20} />
              </span>
              <span className="text-[10px] uppercase tracking-widest text-brand-gold font-bold font-mono">
                Affiliate Program
              </span>
            </div>
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-white mb-2">
              10% Cash Referral Reward
            </h3>
            <p className="text-stone-300 text-xs leading-relaxed">
              Share your custom referral code from your account. When friends book their site, you receive 10% commission.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}