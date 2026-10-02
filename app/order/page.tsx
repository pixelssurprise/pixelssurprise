"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { CheckCircle2, ArrowRight, AlertCircle, HeartHandshake, Gift, ShieldAlert } from "lucide-react";

function OrderFormContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const templateId = searchParams.get("templateId");

  const [user, setUser] = useState<any>(null);
  const [template, setTemplate] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [referralCodeUsed, setReferralCodeUsed] = useState("");

  useEffect(() => {
    async function loadData() {
      const { data: authData } = await supabase.auth.getUser();
      
      if (!authData?.user) {
        const currentUrl = `${pathname}?${searchParams.toString()}`;
        router.replace(`/auth?next=${encodeURIComponent(currentUrl)}`);
        return;
      }

      setUser(authData.user);

      // Fetch user profile to check loyalty perk status (4th free order)
      const { data: prof } = await supabase
        .from("profiles")
        .select("completed_orders")
        .eq("id", authData.user.id)
        .single();
      
      if (prof) setUserProfile(prof);
      setCheckingAuth(false);

      if (templateId) {
        const { data: tmpl } = await supabase
          .from("templates")
          .select("*")
          .eq("id", templateId)
          .single();
        if (tmpl) {
          setTemplate(tmpl);
        }
      }
    }
    loadData();
  }, [templateId, router, pathname, searchParams]);

  const handleInputChange = (label: string, value: string) => {
    setFormValues({ ...formValues, [label]: value });
  };

  // Check if 4th loyalty order is free
  const isFreeLoyaltyOrder = (userProfile?.completed_orders || 0) >= 3;
  const basePrice = template?.price || 699;
  const totalPrice = isFreeLoyaltyOrder ? 0 : basePrice;
  const advanceAmount = isFreeLoyaltyOrder ? 0 : Math.round(totalPrice / 2);

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!user) {
      const currentUrl = `${pathname}?${searchParams.toString()}`;
      router.replace(`/auth?next=${encodeURIComponent(currentUrl)}`);
      return;
    }

    setLoading(true);
    const trackingNumber = "PX-" + Math.random().toString(36).substring(2, 10).toUpperCase();

    try {
      const customerName = formValues["Recipient Name"] || formValues["Name"] || user.email || "Customer";

      let validReferralCode = null;
      if (referralCodeUsed.trim() && !isFreeLoyaltyOrder) {
        const { data: refProfile, error: refError } = await supabase
          .from("profiles")
          .select("referral_code")
          .eq("referral_code", referralCodeUsed.trim().toUpperCase())
          .single();

        if (refProfile) {
          validReferralCode = refProfile.referral_code;
        } else {
          setErrorMsg("Invalid referral code entered. Please check or leave blank.");
          setLoading(false);
          return;
        }
      }

      const { error } = await supabase
        .from("orders")
        .insert({
          user_id: user.id,
          template_id: templateId,
          tracking_number: trackingNumber,
          customer_name: customerName,
          customer_phone: user.user_metadata?.phone || "",
          user_email: user.email,
          order_type: "readymade_template",
          total_amount: totalPrice,
          advance_paid: advanceAmount,
          balance_due: totalPrice - advanceAmount,
          payment_status: isFreeLoyaltyOrder ? "free_loyalty_claim" : "pending_advance",
          delivery_status: "processing",
          referral_code_used: validReferralCode,
          items: {
            template_title: template?.title,
            custom_fields_submitted: formValues,
          },
        });

      if (error) throw error;

      if (isFreeLoyaltyOrder) {
        // Redirect straight to dashboard for 100% free loyalty claim
        router.push(`/dashboard?success=free_claim_${trackingNumber}`);
      } else {
        router.push(`/payment?tracking=${trackingNumber}&amount=${advanceAmount}`);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Order submission failed.");
      setLoading(false);
    }
  };

  if (checkingAuth || !template) {
    return (
      <div className="min-h-screen bg-[#050811] text-white flex items-center justify-center font-serif text-xs">
        Verifying secure session & loading template... ✨
      </div>
    );
  }

  const customFields: Array<{ label: string; fieldType: string; required: boolean }> = template.custom_fields || [];

  return (
    <div className="max-w-xl mx-auto px-6 py-12 text-[#fcebed]">
      <form onSubmit={handleCheckout} className="bg-brand-card border border-brand-border rounded-3xl p-8 space-y-6 shadow-xl">
        <div>
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-mono text-brand-gold uppercase tracking-wider">{template.category}</span>
            {isFreeLoyaltyOrder && (
              <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                <Gift size={12} /> 4th Website 100% Free!
              </span>
            )}
          </div>
          <h2 className="font-serif text-2xl font-bold text-white mt-1">{template.title}</h2>
          <p className="text-xs text-slate-400 mt-1">Please provide the required details specified for this template.</p>
        </div>

        {errorMsg && (
          <div className="bg-rose-950/40 border border-rose-500/40 p-3.5 rounded-xl text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* DYNAMIC FIELDS */}
        <div className="space-y-4">
          {customFields.map((field, idx) => (
            <div key={idx}>
              <label className="text-xs text-brand-gold font-medium block mb-1">
                {field.label} {field.required && <span className="text-rose-400">*</span>}
              </label>
              {field.fieldType === "textarea" ? (
                <textarea
                  required={field.required}
                  rows={3}
                  placeholder={`Enter ${field.label.toLowerCase()}...`}
                  value={formValues[field.label] || ""}
                  onChange={(e) => handleInputChange(field.label, e.target.value)}
                  className="w-full bg-brand-dark border border-brand-border rounded-xl p-3 text-xs text-white outline-none focus:border-rose-400"
                />
              ) : (
                <input
                  type={field.fieldType}
                  required={field.required}
                  placeholder={`Enter ${field.label.toLowerCase()}...`}
                  value={formValues[field.label] || ""}
                  onChange={(e) => handleInputChange(field.label, e.target.value)}
                  className="w-full bg-brand-dark border border-brand-border rounded-xl p-3 text-xs text-white outline-none focus:border-rose-400"
                />
              )}
            </div>
          ))}
        </div>

        {/* REFERRAL CODE */}
        {!isFreeLoyaltyOrder && (
          <div className="pt-2 border-t border-brand-border/60">
            <label className="text-xs text-brand-gold font-medium block mb-1 flex items-center gap-1.5">
              <HeartHandshake size={14} /> Friend's Referral Code (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. PX-9F21A"
              value={referralCodeUsed}
              onChange={(e) => setReferralCodeUsed(e.target.value.toUpperCase())}
              className="w-full bg-brand-dark border border-brand-border rounded-xl p-3 text-xs text-white uppercase tracking-widest font-mono outline-none focus:border-brand-gold"
            />
            <span className="text-[10px] text-slate-500 mt-1 block">Have a friend's code? Enter it here to reward them with a 10% cash bonus!</span>
          </div>
        )}

        {/* REVISION POLICY DISCLOSURE */}
        <div className="bg-amber-950/20 border border-amber-500/30 p-4 rounded-2xl space-y-1.5 text-[11px] text-amber-200/80">
          <div className="font-bold flex items-center gap-1.5 text-amber-300">
            <ShieldAlert size={14} /> Revision & Support Policy Notice:
          </div>
          <p>• <strong>1 free round</strong> of minor content changes (text/photos) is included upon delivery.</p>
          <p>• Subsequent major layout changes or song replacements will incur a nominal extra charge.</p>
          <p>• Any technical bugs or platform errors from our side are always fixed 100% free of charge.</p>
        </div>

        {/* PRICING BREAKDOWN */}
        <div className="bg-brand-dark border border-brand-border rounded-2xl p-4 text-xs space-y-1 font-mono">
          <div className="flex justify-between">
            <span className="text-slate-400">Total Price:</span>
            <span className={`text-white font-bold ${isFreeLoyaltyOrder ? "line-through text-slate-500" : ""}`}>₹{basePrice}</span>
          </div>
          {isFreeLoyaltyOrder ? (
            <div className="flex justify-between text-emerald-400 font-bold text-sm pt-1">
              <span>Loyalty Reward (4th Free):</span>
              <span>-₹{basePrice} (₹0 Due)</span>
            </div>
          ) : (
            <div className="flex justify-between text-brand-gold font-bold pt-1">
              <span>50% Advance (Due Now):</span>
              <span>₹{advanceAmount}</span>
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 rounded-full bg-rose-gradient text-stone-950 font-bold text-xs uppercase tracking-wider hover:opacity-95 transition shadow-lg cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? "Processing Order..." : isFreeLoyaltyOrder ? "Claim Your 100% Free Website 🎉" : `Proceed to Pay ₹{advanceAmount} Advance →`}
        </button>
      </form>
    </div>
  );
}

export default function OrderPage() {
  return (
    <Suspense fallback={<div className="text-center py-20 text-xs text-slate-500">Loading Order Form...</div>}>
      <OrderFormContent />
    </Suspense>
  );
}