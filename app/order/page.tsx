"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Sparkles, ArrowRight, AlertCircle, CheckCircle2, Music, Image as ImageIcon, Video, Calendar, FileText } from "lucide-react";

function OrderForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const templateIdParam = searchParams.get("templateId");
  const priceParam = searchParams.get("price");

  const isUuid = templateIdParam && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(templateIdParam);
  const templateId = isUuid ? templateIdParam : null;

  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [template, setTemplate] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [orderSuccess, setOrderSuccess] = useState<any>(null);

  // Requirement toggles (dynamic per template)
  const [needs, setNeeds] = useState({
    photos: true,
    videos: false,
    music: true,
    message: true,
    eventDate: false,
  });

  const [form, setForm] = useState({
    recipient: "",
    driveLink: "",
    videoLink: "",
    song: "",
    message: "",
    eventDate: "",
    customIdea: "",
    referralCode: "",
  });

  const basePrice = template?.price || Number(priceParam) || 699;
  const isFourthFree = (profile?.completed_orders || 0) >= 3;
  const finalPrice = isFourthFree ? 0 : basePrice;
  const advanceAmount = isFourthFree ? 0 : finalPrice * 0.5;

  useEffect(() => {
    async function loadData() {
      // 1. Load User & Profile
      const { data: authData } = await supabase.auth.getUser();
      if (authData?.user) {
        setUser(authData.user);
        const { data: prof } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", authData.user.id)
          .single();
        setProfile(prof);
      }

      // 2. Load Selected Template configuration
      if (templateId) {
        const { data: tmpl } = await supabase
          .from("templates")
          .select("*")
          .eq("id", templateId)
          .single();
        if (tmpl) {
          setTemplate(tmpl);
          setNeeds({
            photos: tmpl.needs_photos ?? true,
            videos: tmpl.needs_videos ?? false,
            music: tmpl.needs_music ?? true,
            message: tmpl.needs_message ?? true,
            eventDate: tmpl.needs_event_date ?? false,
          });
        }
      }
    }
    loadData();
  }, [templateId]);

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!user) {
      setErrorMsg("Please sign in or create an account before continuing.");
      router.push("/auth");
      return;
    }

    if (!form.recipient.trim()) {
      setErrorMsg("Please enter the recipient or event title.");
      return;
    }

    if (needs.photos && !form.driveLink.trim()) {
      setErrorMsg("Please provide your Google Drive link with photos.");
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase
        .from("orders")
        .insert({
          user_id: user.id,
          template_id: templateId,
          is_custom_idea: !templateId,
          custom_idea_text: form.customIdea || (template ? template.title : "Custom Concept"),
          drive_link: form.driveLink.trim() || "Not required / Included in text",
          song_details: needs.music ? form.song.trim() : "None",
          special_message: needs.message ? form.message.trim() : "",
          recipient_name: form.recipient.trim(),
          total_amount: finalPrice,
          advance_paid: advanceAmount,
          balance_due: finalPrice - advanceAmount,
          is_free_loyalty_order: isFourthFree,
          applied_referral_code: form.referralCode.trim() || null,
          payment_status: isFourthFree ? "Fully Paid (Loyalty)" : "Pending Advance",
          order_status: "In Review",
        })
        .select()
        .single();

      if (error) throw error;
      setOrderSuccess(data);
    } catch (err: any) {
      setErrorMsg(err.message || "Could not create order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const whatsappNumber = "9112114603";
  const whatsappUrl = orderSuccess
    ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
        `Hi PixelsSurprise! I placed order #${orderSuccess.id.slice(0, 6)} for "${orderSuccess.recipient_name}".\n\n` +
        `Total: ₹${orderSuccess.total_amount}\n` +
        `50% Advance: ₹${orderSuccess.advance_paid}\n\n` +
        `Please share your UPI QR code to complete payment!`
      )}`
    : "";

  return (
    <div className="max-w-xl mx-auto px-6 py-12">
      {orderSuccess ? (
        <div className="bg-brand-card border border-brand-border rounded-3xl p-8 text-center space-y-6 shadow-2xl">
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
            <CheckCircle2 size={36} />
          </div>

          <div>
            <span className="text-[10px] font-mono text-brand-gold uppercase tracking-widest">Order Confirmed</span>
            <h2 className="font-serif text-3xl font-bold text-brand-goldLight mt-1">
              {isFourthFree ? "Loyalty Gift: 100% Free!" : "Complete 50% Advance"}
            </h2>
            <p className="text-xs text-slate-400 mt-1 font-mono">
              Order ID: #{orderSuccess.id.slice(0, 8)}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-brand-dark border border-brand-border text-xs space-y-2 text-left font-mono">
            <div className="flex justify-between">
              <span className="text-slate-400">Recipient / Event:</span>
              <span className="text-white font-bold">{orderSuccess.recipient_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Total Price:</span>
              <span className="text-white">₹{orderSuccess.total_amount}</span>
            </div>
            <div className="flex justify-between text-brand-gold font-bold">
              <span>Advance (50%):</span>
              <span>₹{orderSuccess.advance_paid}</span>
            </div>
          </div>

          <div className="space-y-3">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="w-full py-3.5 rounded-full bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-xs uppercase tracking-wider transition flex items-center justify-center gap-2 shadow-lg"
            >
              Pay via UPI / WhatsApp (₹{orderSuccess.advance_paid}) <ArrowRight size={15} />
            </a>

            <button
              onClick={() => router.push("/dashboard")}
              className="w-full py-3 rounded-full border border-brand-border text-xs text-slate-400 hover:text-white transition"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleCheckout} className="bg-brand-card border border-brand-border rounded-3xl p-8 space-y-5 shadow-xl">
          <div>
            <span className="text-[10px] font-mono text-brand-gold uppercase tracking-wider">
              {template ? `${template.category} • ${template.sub_category}` : "Custom Website Order"}
            </span>
            <h2 className="font-serif text-2xl font-bold text-brand-goldLight">
              {template ? template.title : "Tell Us What You Need"}
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Only provide details required for this specific website concept.
            </p>
          </div>

          {errorMsg && (
            <div className="bg-rose-950/40 border border-rose-500/40 p-3.5 rounded-xl text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Primary Name Field (Always Needed) */}
          <div>
            <label className="text-xs text-brand-gold font-medium block mb-1">
              Recipient or Couple Name <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g., Radhika / Amit & Sneha"
              value={form.recipient}
              onChange={(e) => setForm({ ...form, recipient: e.target.value })}
              className="w-full bg-brand-dark border border-brand-border rounded-xl p-3 text-xs focus:border-brand-gold outline-none text-white placeholder:text-slate-600"
            />
          </div>

          {/* Custom Builder toggles if no preset template is selected */}
          {!template && (
            <div className="p-4 rounded-2xl bg-brand-dark border border-brand-border space-y-3">
              <p className="text-xs font-semibold text-brand-goldLight">What should your website include?</p>
              <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={needs.photos} onChange={(e) => setNeeds({ ...needs, photos: e.target.checked })} />
                  <ImageIcon size={13} className="text-brand-gold" /> Photo Gallery
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={needs.music} onChange={(e) => setNeeds({ ...needs, music: e.target.checked })} />
                  <Music size={13} className="text-brand-gold" /> Background Song
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={needs.message} onChange={(e) => setNeeds({ ...needs, message: e.target.checked })} />
                  <FileText size={13} className="text-brand-gold" /> Letter / Quotes
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={needs.eventDate} onChange={(e) => setNeeds({ ...needs, eventDate: e.target.checked })} />
                  <Calendar size={13} className="text-brand-gold" /> Event Countdown
                </label>
              </div>
            </div>
          )}

          {/* Photos Drive link (conditional) */}
          {needs.photos && (
            <div>
              <label className="text-xs text-brand-gold font-medium block mb-1">
                Google Drive Link for Photos <span className="text-rose-400">*</span>
              </label>
              <input
                type="url"
                required
                placeholder="Paste public Google Drive folder link"
                value={form.driveLink}
                onChange={(e) => setForm({ ...form, driveLink: e.target.value })}
                className="w-full bg-brand-dark border border-brand-border rounded-xl p-3 text-xs focus:border-brand-gold outline-none text-white placeholder:text-slate-600"
              />
            </div>
          )}

          {/* Music Field (conditional) */}
          {needs.music && (
            <div>
              <label className="text-xs text-brand-gold font-medium block mb-1">
                Background Music / Song Name or YouTube Link
              </label>
              <input
                type="text"
                placeholder="e.g., Ishq - Faheem Abdullah"
                value={form.song}
                onChange={(e) => setForm({ ...form, song: e.target.value })}
                className="w-full bg-brand-dark border border-brand-border rounded-xl p-3 text-xs focus:border-brand-gold outline-none text-white placeholder:text-slate-600"
              />
            </div>
          )}

          {/* Event Date / Countdown (conditional) */}
          {needs.eventDate && (
            <div>
              <label className="text-xs text-brand-gold font-medium block mb-1">
                Event Date & Time (for Countdown)
              </label>
              <input
                type="datetime-local"
                value={form.eventDate}
                onChange={(e) => setForm({ ...form, eventDate: e.target.value })}
                className="w-full bg-brand-dark border border-brand-border rounded-xl p-3 text-xs focus:border-brand-gold outline-none text-white"
              />
            </div>
          )}

          {/* Letter / Text (conditional) */}
          {needs.message && (
            <div>
              <label className="text-xs text-brand-gold font-medium block mb-1">
                Special Message, Love Letter, or Event Schedule
              </label>
              <textarea
                rows={3}
                placeholder="Type your personal letter, story milestones, or event timings..."
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                className="w-full bg-brand-dark border border-brand-border rounded-xl p-3 text-xs focus:border-brand-gold outline-none text-white placeholder:text-slate-600"
              />
            </div>
          )}

          {/* Referral Code */}
          <div>
            <label className="text-xs text-brand-gold font-medium block mb-1">Referral Code (Optional)</label>
            <input
              type="text"
              placeholder="Enter friend's code"
              value={form.referralCode}
              onChange={(e) => setForm({ ...form, referralCode: e.target.value })}
              className="w-full bg-brand-dark border border-brand-border rounded-xl p-3 text-xs focus:border-brand-gold outline-none text-white placeholder:text-slate-600"
            />
          </div>

          {/* Price Breakdown */}
          <div className="bg-brand-dark border border-brand-border/80 rounded-2xl p-4 text-xs space-y-1.5 font-mono">
            <div className="flex justify-between">
              <span className="text-slate-400">Total Price:</span>
              <span className="text-white font-bold">₹{finalPrice}</span>
            </div>
            <div className="flex justify-between text-brand-gold font-bold">
              <span>50% Advance (Due Now):</span>
              <span>₹{advanceAmount}</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Balance (Upon Final Delivery):</span>
              <span>₹{finalPrice - advanceAmount}</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-full bg-rose-gradient text-brand-dark font-bold text-xs uppercase tracking-wider hover:opacity-90 transition shadow-lg shadow-brand-gold/20 disabled:opacity-50 cursor-pointer"
          >
            {loading ? "Registering Order..." : isFourthFree ? "Claim Free Website" : `Pay 50% Advance (₹${advanceAmount})`}
          </button>
        </form>
      )}
    </div>
  );
}

export default function OrderPage() {
  return (
    <Suspense fallback={<div className="text-center py-20 text-xs text-slate-500">Loading Order Form...</div>}>
      <OrderForm />
    </Suspense>
  );
}