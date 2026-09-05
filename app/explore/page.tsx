"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import { Play, Sparkles, ArrowRight, X, Smartphone, ShoppingBag } from "lucide-react";

export default function ExplorePage() {
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<"All" | "Surprise" | "Invitation">("All");
  const [selectedSub, setSelectedSub] = useState<string>("All");
  const [activePreview, setActivePreview] = useState<any | null>(null);

  useEffect(() => {
    async function loadTemplates() {
      setLoading(true);
      const { data, error } = await supabase
        .from("templates")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Supabase Templates Error:", error.message);
      } else {
        setTemplates(data || []);
      }
      setLoading(false);
    }
    loadTemplates();
  }, []);

  const filteredTemplates = templates.filter((t) => {
    const itemCat = (t.category || "").toLowerCase();
    const activeCat = activeCategory.toLowerCase();

    const categoryMatches =
      activeCategory === "All" ||
      itemCat.includes(activeCat) ||
      activeCat.includes(itemCat);

    const subMatches =
      selectedSub === "All" ||
      (t.sub_category || "").toLowerCase() === selectedSub.toLowerCase();

    return categoryMatches && subMatches;
  });

  const subCategories = [
    "All",
    ...Array.from(
      new Set(
        templates
          .filter((t) => {
            if (activeCategory === "All") return true;
            const itemCat = (t.category || "").toLowerCase();
            const activeCat = activeCategory.toLowerCase();
            return itemCat.includes(activeCat) || activeCat.includes(itemCat);
          })
          .map((t) => t.sub_category)
          .filter(Boolean)
      )
    ),
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-10">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-gold/10 border border-brand-gold/20 text-brand-gold text-[11px] font-mono uppercase tracking-widest">
          <Sparkles size={12} /> Interactive Collection
        </div>
        <h1 className="font-serif text-4xl sm:text-5xl font-bold text-brand-goldLight">
          Explore Live Demos
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Experience interactive sample websites firsthand. Every song, photo, animation, and letter will be personalized for your special moment.
        </p>
      </div>

      {/* Main Category Filter Tabs */}
      <div className="flex justify-center flex-wrap gap-3">
        <button
          onClick={() => {
            setActiveCategory("All");
            setSelectedSub("All");
          }}
          className={`px-5 py-2.5 rounded-full text-xs font-bold tracking-wider uppercase transition cursor-pointer ${
            activeCategory === "All"
              ? "bg-rose-gradient text-brand-dark shadow-lg shadow-brand-gold/20"
              : "bg-brand-card border border-brand-border text-slate-400 hover:text-white"
          }`}
        >
          All Designs
        </button>
        <button
          onClick={() => {
            setActiveCategory("Surprise");
            setSelectedSub("All");
          }}
          className={`px-5 py-2.5 rounded-full text-xs font-bold tracking-wider uppercase transition cursor-pointer ${
            activeCategory === "Surprise"
              ? "bg-rose-gradient text-brand-dark shadow-lg shadow-brand-gold/20"
              : "bg-brand-card border border-brand-border text-slate-400 hover:text-white"
          }`}
        >
          Surprise Websites
        </button>
        <button
          onClick={() => {
            setActiveCategory("Invitation");
            setSelectedSub("All");
          }}
          className={`px-5 py-2.5 rounded-full text-xs font-bold tracking-wider uppercase transition cursor-pointer ${
            activeCategory === "Invitation"
              ? "bg-rose-gradient text-brand-dark shadow-lg shadow-brand-gold/20"
              : "bg-brand-card border border-brand-border text-slate-400 hover:text-white"
          }`}
        >
          Invitation Websites
        </button>
      </div>

      {/* Subcategory Pills */}
      {subCategories.length > 1 && (
        <div className="flex justify-center flex-wrap gap-2 pt-1">
          {subCategories.map((sub) => (
            <button
              key={sub}
              onClick={() => setSelectedSub(sub)}
              className={`px-4 py-1.5 rounded-xl text-xs transition cursor-pointer ${
                selectedSub === sub
                  ? "bg-brand-gold/20 text-brand-gold border border-brand-gold/40 font-semibold"
                  : "bg-brand-card/50 text-slate-400 border border-brand-border/60 hover:text-white"
              }`}
            >
              {sub}
            </button>
          ))}
        </div>
      )}

      {/* Template Grid */}
      {loading ? (
        <div className="text-center py-20 text-xs text-slate-500 font-mono">
          Loading catalog from database...
        </div>
      ) : filteredTemplates.length === 0 ? (
        <div className="text-center py-16 bg-brand-card border border-brand-border rounded-3xl space-y-3">
          <p className="text-sm text-slate-300 font-serif">No websites found under this selection yet.</p>
          <p className="text-xs text-slate-500">
            Switch tabs above or upload new live demos via your Admin Portal.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((item) => (
            <div
              key={item.id}
              className="bg-brand-card border border-brand-border rounded-3xl p-5 flex flex-col justify-between hover:border-brand-gold/40 transition group shadow-xl"
            >
              <div className="space-y-3">
                {/* Visual Card */}
                <div className="aspect-[16/10] rounded-2xl bg-brand-dark border border-brand-border overflow-hidden relative flex items-center justify-center group-hover:border-brand-gold/30 transition">
                  <div className="text-center space-y-1 p-4">
                    <p className="font-serif text-lg font-bold text-brand-goldLight">{item.title}</p>
                    <span className="inline-block px-2.5 py-0.5 rounded-full bg-brand-gold/10 text-brand-gold text-[10px] uppercase font-mono">
                      {item.sub_category || item.category}
                    </span>
                  </div>

                  <button
                    onClick={() => setActivePreview(item)}
                    className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2 text-xs font-bold text-white uppercase tracking-wider backdrop-blur-xs cursor-pointer"
                  >
                    <Play size={16} fill="white" /> Launch Live Demo
                  </button>
                </div>

                <div>
                  <h3 className="font-serif text-xl font-bold text-white">{item.title}</h3>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                    {item.description || "Customizable digital interactive website experience."}
                  </p>
                </div>
              </div>

              {/* Card Footer */}
              <div className="pt-5 mt-4 border-t border-brand-border/60 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-500 block">Starting from</span>
                  <span className="text-lg font-bold text-brand-gold font-mono">₹{item.price}</span>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setActivePreview(item)}
                    className="p-2.5 rounded-xl border border-brand-border hover:border-brand-gold text-slate-300 hover:text-brand-gold transition cursor-pointer"
                    title="Launch Live Demo"
                  >
                    <Play size={14} />
                  </button>

                  <Link
                    href={`/order?templateId=${item.id}&price=${item.price}`}
                    className="px-4 py-2 rounded-xl bg-rose-gradient text-brand-dark font-bold text-xs uppercase tracking-wider hover:opacity-90 transition flex items-center gap-1 shadow-md shadow-brand-gold/10"
                  >
                    Order <ArrowRight size={13} />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* SECURE IN-PAGE LIVE DEMO MODAL */}
      {activePreview && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4">
          <div className="relative w-full max-w-4xl h-[92vh] bg-brand-card border border-brand-border rounded-3xl overflow-hidden flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-5 py-3.5 border-b border-brand-border flex items-center justify-between bg-brand-dark">
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-serif font-bold text-brand-goldLight text-sm sm:text-base truncate max-w-xs">
                  {activePreview.title}
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-brand-gold/10 text-brand-gold text-[10px] font-mono uppercase">
                  <Smartphone size={10} /> Mobile Simulation
                </span>
              </div>

              {/* No external links here - purely close button */}
              <button
                onClick={() => setActivePreview(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-brand-border transition cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Simulated Phone Frame */}
            <div className="flex-1 bg-black/60 relative flex items-center justify-center p-3 sm:p-4 overflow-hidden">
              <div className="w-full h-full max-w-sm sm:max-w-md bg-white rounded-2xl border border-brand-border shadow-2xl overflow-hidden relative">
                
                <iframe
  src={activePreview.demo_url}
  title={activePreview.title}
  className="w-full h-full border-0"
  loading="lazy"
  allow="autoplay; encrypted-media; fullscreen; clipboard-write"
/>
              </div>
            </div>

            {/* Modal Bottom Action Bar */}
            <div className="px-6 py-3.5 border-t border-brand-border flex items-center justify-between bg-brand-dark">
              <div>
                <span className="text-[10px] text-slate-400 block leading-tight">Starting from</span>
                <span className="text-base font-bold text-brand-gold font-mono">₹{activePreview.price}</span>
              </div>
              <Link
                href={`/order?templateId=${activePreview.id}&price=${activePreview.price}`}
                onClick={() => setActivePreview(null)}
                className="px-6 py-2.5 rounded-full bg-rose-gradient text-brand-dark font-bold text-xs uppercase tracking-wider hover:opacity-90 transition flex items-center gap-1.5 shadow-md shadow-brand-gold/20"
              >
                <ShoppingBag size={14} />
                Order & Customize This Design
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}