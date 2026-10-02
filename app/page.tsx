import Link from "next/link";
import { Sparkles, Gift, ArrowRight, HeartHandshake } from "lucide-react";
import SceneBackground from "@/components/scenebackground";

const occasions = ["Weddings", "Birthdays", "Anniversaries", "Proposals"];

const steps = [
  {
    title: "Tell us your story",
    text: "Share the names, photos, music and the moment you want to surprise someone with.",
  },
  {
    title: "We design and build it",
    text: "Your custom website is crafted with the envelope, love letter and countdown you picked, then sent for your approval.",
  },
  {
    title: "Send the link",
    text: "Share one private link on WhatsApp. They open it and the surprise begins.",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen pb-16 space-y-12 overflow-x-hidden">
      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 sm:pt-10 grid grid-cols-1 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] items-center gap-8">
        
        {/* Text Content */}
        <div className="relative z-10 text-center lg:text-left space-y-5">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-brand-gold/10 border border-brand-gold/20 text-brand-gold text-[11px] font-mono uppercase tracking-widest mx-auto lg:mx-0">
            <Sparkles size={12} /> Bespoke Digital Keepsakes
          </div>

          <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-tight">
            Pixels{" "}
            <span className="bg-rose-gradient bg-clip-text text-transparent">
              Surprise
            </span>
          </h1>

          <p className="font-serif text-base sm:text-xl text-brand-goldLight/90 italic font-light max-w-xl mx-auto lg:mx-0">
            Where Special Memories Become Digital Magic.
          </p>

          <p className="text-stone-300 text-xs sm:text-sm max-w-md mx-auto lg:mx-0 font-light leading-relaxed">
            Custom interactive surprise websites and royal digital invitations. Unlocked with music, secret envelopes, love letters, and countdowns.
          </p>

          <div className="flex flex-wrap justify-center lg:justify-start gap-2 pt-1">
            {occasions.map((o) => (
              <span
                key={o}
                className="px-3 py-1 rounded-full border border-brand-border text-[11px] text-stone-300 bg-brand-card/40"
              >
                {o}
              </span>
            ))}
          </div>

          <div className="pt-2 flex flex-col sm:flex-row justify-center lg:justify-start items-center gap-3.5">
            <Link
              href="/explore"
              className="btn-primary w-full sm:w-auto px-7 py-3.5 rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-brand-gold/10"
            >
              Explore Live Demos <ArrowRight size={15} />
            </Link>
            <Link
              href="/book"
              className="btn-outline w-full sm:w-auto px-7 py-3.5 rounded-xl font-medium text-xs tracking-wider uppercase transition shadow-md cursor-pointer text-center"
            >
              Submit Custom Idea
            </Link>
          </div>
        </div>

        {/* 3D scene: the box controls the height, the scene fills it (phone only on mobile) */}
        <div className="relative w-full h-[400px] sm:h-[420px] lg:h-[480px] overflow-hidden">
          <SceneBackground />
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 pt-4">
        <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white mb-6 text-center lg:text-left">
          How your surprise comes together
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((s, i) => (
            <div key={s.title} className="bg-brand-card border border-brand-border rounded-2xl p-6 pt-5">
              <span className="font-serif text-3xl text-brand-gold">{i + 1}</span>
              <h3 className="font-serif text-lg font-bold text-white mt-2 mb-1.5">{s.title}</h3>
              <p className="text-stone-300 text-xs leading-relaxed">{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Perks */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Link href="/loyalty" className="no-underline group block">
            <div className="bg-brand-card border border-brand-border p-6 sm:p-8 rounded-3xl relative overflow-hidden h-full transition-all group-hover:border-brand-gold/60 shadow-xl">
              <div className="flex items-center gap-3 mb-3">
                <span className="p-2.5 rounded-xl bg-brand-dark text-brand-gold border border-brand-border">
                  <Gift size={20} />
                </span>
                <span className="text-[10px] uppercase tracking-widest text-brand-gold font-bold font-mono">
                  Loyalty Perk
                </span>
              </div>
              <h3 className="font-serif text-xl sm:text-2xl font-bold text-white mb-2 group-hover:text-brand-goldLight transition-colors">
                Buy 3 Websites, Get the 4th Free →
              </h3>
              <p className="text-stone-300 text-xs leading-relaxed">
                Once you finish 3 completed orders, your 4th custom website checkout is 100% free with no hidden charges.
              </p>
            </div>
          </Link>

          <Link href="/referral" className="no-underline group block">
            <div className="bg-brand-card border border-brand-border p-6 sm:p-8 rounded-3xl relative overflow-hidden h-full transition-all group-hover:border-brand-gold/60 shadow-xl">
              <div className="flex items-center gap-3 mb-3">
                <span className="p-2.5 rounded-xl bg-brand-dark text-brand-gold border border-brand-border">
                  <HeartHandshake size={20} />
                </span>
                <span className="text-[10px] uppercase tracking-widest text-brand-gold font-bold font-mono">
                  Affiliate Program
                </span>
              </div>
              <h3 className="font-serif text-xl sm:text-2xl font-bold text-white mb-2 group-hover:text-brand-goldLight transition-colors">
                10% Cash Referral Reward →
              </h3>
              <p className="text-stone-300 text-xs leading-relaxed">
                Share your custom referral code from your account. When friends book their site, you receive 10% commission.
              </p>
            </div>
          </Link>
        </div>
      </section>
    </div>
  );
}