import Link from "next/link";
import {
  Compass,
  FileText,
  CreditCard,
  Code2,
  Gift,
  Award,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";

export default function HowItWorksPage() {
  const steps = [
    {
      num: "01",
      icon: Compass,
      title: "Explore Live Interactive Demos",
      desc: "Browse our catalog of Surprise and Invitation websites. Launch interactive previews directly on your device to test background music, photo carousels, and opening animations.",
    },
    {
      num: "02",
      icon: FileText,
      title: "Submit Your Story & Media",
      desc: "Fill out the customization form with your loved one's name, personalized letters, memorable dates, and upload high-resolution photos and songs.",
    },
    {
      num: "03",
      icon: CreditCard,
      title: "Lock In with 50% Advance",
      desc: "Pay only 50% advance securely via UPI or QR code. Send the transaction screenshot to our verified WhatsApp support (9112114603) to initiate building.",
    },
    {
      num: "04",
      icon: Code2,
      title: "Handcrafted Engineering",
      desc: "Our developers handcraft and polish your customized digital experience, optimizing it for all mobile, tablet, and desktop viewports within 24 to 48 hours.",
    },
    {
      num: "05",
      icon: Gift,
      title: "Live Delivery & Balance",
      desc: "Review your private preview link. Once you're 100% satisfied, settle the remaining balance and receive your permanent, shareable digital website URL.",
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-6 py-14 space-y-16">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-brand-gold/10 border border-brand-gold/20 text-brand-gold text-xs font-mono uppercase tracking-widest">
          <Sparkles size={13} /> Transparent Experience
        </div>
        <h1 className="font-serif text-4xl sm:text-5xl font-bold text-brand-goldLight">
          How PixelsSurprise Works
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          From interactive idea to a permanent digital memory in 5 simple, secure steps.
        </p>
      </div>

      {/* 5-Step Process Timeline */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          return (
            <div
              key={step.num}
              className={`bg-brand-card border border-brand-border rounded-3xl p-6 relative flex flex-col justify-between hover:border-brand-gold/40 transition group ${
                idx === 4 ? "md:col-span-2 lg:col-span-1" : ""
              }`}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-brand-dark border border-brand-border flex items-center justify-center text-brand-gold group-hover:border-brand-gold/40 transition">
                    <Icon size={22} />
                  </div>
                  <span className="font-mono text-2xl font-bold text-slate-700 group-hover:text-brand-gold/40 transition">
                    {step.num}
                  </span>
                </div>

                <div>
                  <h3 className="font-serif text-lg font-bold text-white mb-2">{step.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{step.desc}</p>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-brand-border/40 flex items-center gap-1.5 text-[11px] text-brand-gold font-mono">
                <CheckCircle2 size={13} /> Step {step.num} of 05
              </div>
            </div>
          );
        })}
      </div>

      {/* Loyalty Banner: 4th Website Free */}
      <div className="bg-brand-card border border-brand-gold/30 rounded-3xl p-8 sm:p-10 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl">
        <div className="space-y-3 max-w-xl text-center md:text-left">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-brand-gold/20 text-brand-gold text-[11px] font-mono uppercase">
            <Award size={13} /> Exclusive Customer Loyalty
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-brand-goldLight">
            Every 4th Website is 100% Free
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            Whenever you order 3 surprise or invitation websites on PixelsSurprise, your 4th customized site is
            completely on us as our celebration gift to you.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/explore"
            className="px-8 py-3.5 rounded-full bg-rose-gradient text-brand-dark font-bold text-xs uppercase tracking-wider hover:opacity-90 transition flex items-center justify-center gap-2 shadow-lg shadow-brand-gold/20"
          >
            Explore Designs <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      {/* Trust & Support Guarantee */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
        <div className="p-5 space-y-2">
          <ShieldCheck size={26} className="text-brand-gold mx-auto" />
          <h4 className="font-serif font-bold text-white text-sm">50% Advance Protection</h4>
          <p className="text-[11px] text-slate-400">
            Pay half to begin work and only pay the balance once you have reviewed your live demo preview.
          </p>
        </div>
        <div className="p-5 space-y-2">
          <Code2 size={26} className="text-brand-gold mx-auto" />
          <h4 className="font-serif font-bold text-white text-sm">24-48h Delivery</h4>
          <p className="text-[11px] text-slate-400">
            Fast turnaround times to make sure your surprise website is ready well ahead of the occasion.
          </p>
        </div>
        <div className="p-5 space-y-2">
          <Gift size={26} className="text-brand-gold mx-auto" />
          <h4 className="font-serif font-bold text-white text-sm">Dedicated WhatsApp Support</h4>
          <p className="text-[11px] text-slate-400">
            Direct chat line at +91 9112114603 for song changes, wording revisions, and quick updates.
          </p>
        </div>
      </div>
    </div>
  );
}