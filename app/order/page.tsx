"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { CheckCircle2, ArrowRight, AlertCircle } from "lucide-react";

function OrderFormContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const templateId = searchParams.get("templateId");

  const [user, setUser] = useState<any>(null);
  const [template, setTemplate] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const [formValues, setFormValues] = useState<Record<string, string>>({});

  useEffect(() => {
    async function loadData() {
      const { data: authData } = await supabase.auth.getUser();
      
      // If user is not logged in, silently redirect to /auth and preserve return URL
      if (!authData?.user) {
        const currentUrl = `${pathname}?${searchParams.toString()}`;
        router.replace(`/auth?next=${encodeURIComponent(currentUrl)}`);
        return;
      }

      setUser(authData.user);
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
    const totalPrice = template?.price || 699;
    const advanceAmount = Math.round(totalPrice / 2);

    try {
      const customerName = formValues["Recipient Name"] || formValues["Name"] || user.email || "Customer";

      const { error } = await supabase
        .from("orders")
        .insert({
          user_id: user.id,
          template_id: templateId,
          tracking_number: trackingNumber,
          customer_name: customerName,
          user_email: user.email,
          order_type: "readymade_template",
          total_amount: totalPrice,
          advance_paid: advanceAmount,
          balance_due: totalPrice - advanceAmount,
          payment_status: "pending_advance",
          delivery_status: "processing",
          items: {
            template_title: template?.title,
            custom_fields_submitted: formValues,
          },
        });

      if (error) throw error;

      router.push(`/payment?tracking=${trackingNumber}&amount=${advanceAmount}`);
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
  const totalPrice = template.price || 699;
  const advanceAmount = Math.round(totalPrice / 2);

  return (
    <div className="max-w-xl mx-auto px-6 py-12 text-[#fcebed]">
      <form onSubmit={handleCheckout} className="bg-brand-card border border-brand-border rounded-3xl p-8 space-y-6 shadow-xl">
        <div>
          <span className="text-[10px] font-mono text-brand-gold uppercase tracking-wider">{template.category}</span>
          <h2 className="font-serif text-2xl font-bold text-white">{template.title}</h2>
          <p className="text-xs text-slate-400 mt-1">Please provide the required details specified for this template.</p>
        </div>

        {errorMsg && (
          <div className="bg-rose-950/40 border border-rose-500/40 p-3.5 rounded-xl text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* RENDER ADMIN-CONFIGURED FIELDS */}
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

        <div className="bg-brand-dark border border-brand-border rounded-2xl p-4 text-xs space-y-1 font-mono">
          <div className="flex justify-between">
            <span className="text-slate-400">Total Price:</span>
            <span className="text-white font-bold">₹{totalPrice}</span>
          </div>
          <div className="flex justify-between text-brand-gold font-bold">
            <span>50% Advance (Due Now):</span>
            <span>₹{advanceAmount}</span>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 rounded-full bg-rose-gradient text-stone-950 font-bold text-xs uppercase tracking-wider hover:opacity-95 transition shadow-lg cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? "Processing Order..." : `Proceed to Pay ₹{advanceAmount} Advance →`}
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