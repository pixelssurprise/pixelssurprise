import { Sparkles, Music, Gift } from "lucide-react";

export default function CustomerWebsite({ params }: { params: { slug: string } }) {
  const decodedTitle = decodeURIComponent(params.slug).replace(/-/g, " ");

  return (
    <div className="min-h-screen bg-brand-dark text-white flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-brand-gold/15 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-md w-full bg-brand-card border border-brand-border rounded-3xl p-8 shadow-2xl relative space-y-6">
        <div className="inline-flex p-3 rounded-full bg-brand-gold/10 text-brand-gold border border-brand-gold/30">
          <Gift size={28} />
        </div>

        <div>
          <span className="text-[10px] font-mono text-brand-gold uppercase tracking-[0.2em]">A Special Surprise For</span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-brand-goldLight capitalize mt-1">
            {decodedTitle}
          </h1>
        </div>

        <div className="p-4 rounded-2xl bg-brand-dark border border-brand-border text-xs text-slate-300 leading-relaxed font-light">
          "Every memory with you is a treasure. Today is all about celebrating you!"
        </div>

        <div className="flex justify-center gap-3">
          <button className="px-5 py-2.5 rounded-full bg-rose-gradient text-brand-dark font-bold text-xs uppercase tracking-wider shadow-lg hover:opacity-95 transition flex items-center gap-1.5">
            <Sparkles size={13} /> Open Surprise
          </button>
        </div>
      </div>
    </div>
  );
}