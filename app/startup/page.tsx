"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Rocket, CheckCircle2, Building2, Clock } from "lucide-react";

export default function StartupGrowthPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Default selected plan matching the 4-tier agency package
  const [selectedPlan, setSelectedPlan] = useState<{ name: string; price: number; timeline: string }>({
    name: "Basic Website",
    price: 8000,
    timeline: "7 - 10 Days",
  });

  const [formData, setFormData] = useState({
    businessName: "",
    founderName: "",
    phone: "",
    email: "",
    businessCategory: "Small Business & Beginners",
    businessAddress: "",
    city: "",
    driveLink: "",
    specialRequirements: "",
  });

  const plans = [
    {
      name: "Simple Website",
      price: 2999,
      timeline: "5 Days",
      bestFor: "Small Business & Beginners",
      features: [
        "upto 3 Pages",
        "Mobile Responsive Design",
        "Contact Form",
        "WhatsApp & Call Button",
        "Basic SEO Setup",
        "Social Media Links",
        "Basic UI/UX Design",
        "1 Month Free Support",
      ],
    },
    {
      name: "Basic Website",
      price: 7999,
      popular: true,
      timeline: "10 Days",
      bestFor: "Growing Businesses",
      features: [
        "Up to 10 Pages",
        "Mobile Responsive Design",
        "Advanced Listing / Services",
        "Contact Form + WhatsApp",
        "Google Map Integration",
        "Basic SEO & Speed Optimized",
        "Gallery & Image Slider",
        "Lead Capture Form",
        "3 Months Free Support",
      ],
    },
    {
      name: "Advanced Website",
      price: 14999,
      timeline: "20 Days",
      bestFor: "Serious Business & Lead Generation",
      features: [
        "Up to 20 Pages",
        "Premium & Modern Design",
        "Advanced Listing / Services",
        "User Inquiry System",
        "Admin Panel (Basic)",
        "Blog Section (SEO Friendly)",
        "Google Analytics Integration",
        "Speed & SEO Optimized",
        "6 Months Free Support",
      ],
    },
    {
      name: "Premium Website",
      price: 25000,
      timeline: "50 days",
      bestFor: "Companies & Large Business",
      features: [
        "Unlimited Pages",
        "Custom Premium Design",
        "Advanced Management System",
        "User Dashboard (Login System)",
        "Payment Gateway (Optional)",
        "WhatsApp Chat Integration",
        "Advanced SEO & Speed Optimized",
        "CRM Integration (Optional)",
        "1 Year Free Support",
      ],
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const trackingNumber = "BUS-" + Math.random().toString(36).substring(2, 10).toUpperCase();

    const orderPayload = {
      tracking_number: trackingNumber,
      customer_name: formData.founderName,
      customer_phone: formData.phone,
      user_email: formData.email,
      order_type: "business_growth_package",
      total_amount: selectedPlan.price,
      advance_paid: Math.round(selectedPlan.price / 2),
      balance_due: selectedPlan.price - Math.round(selectedPlan.price / 2),
      payment_status: "pending_advance",
      delivery_status: "processing",
      items: {
        package_name: selectedPlan.name,
        estimated_timeline: selectedPlan.timeline,
        business_details: {
          business_name: formData.businessName,
          category: formData.businessCategory,
          address: `${formData.businessAddress}, ${formData.city}`,
          drive_link: formData.driveLink,
          special_requirements: formData.specialRequirements,
        },
      },
    };

    const { error } = await supabase.from("orders").insert([orderPayload]);

    if (error) {
      alert("Error submitting request: " + error.message);
      setLoading(false);
    } else {
      router.push(`/payment?tracking=${trackingNumber}&amount=${Math.round(selectedPlan.price / 2)}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#050811] text-[#fcebed] px-4 sm:px-6 py-12 max-w-7xl mx-auto space-y-16">
      
      {/* Hero Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#131b2e] border border-[#3b5078] text-rose-200 text-xs font-mono uppercase tracking-widest mx-auto shadow-lg">
          <Rocket size={14} className="text-brand-gold" /> Professional Website Packages
        </div>
        <h1 className="font-serif text-3xl sm:text-6xl font-bold text-white leading-tight">
          Modern Websites for <span className="text-transparent bg-clip-text bg-rose-gradient">Every Type of Business</span>
        </h1>
        <p className="text-sm sm:text-base text-stone-400 leading-relaxed">
          Get your professional business website today with responsive design, instant WhatsApp lead capture, and dedicated support.
        </p>
      </div>

      {/* 4 Professional Pricing Tiers */}
      <div className="space-y-6">
        <h2 className="font-serif text-2xl font-bold text-white text-center">Select Your Website Package</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.name}
              onClick={() => setSelectedPlan({ name: plan.name, price: plan.price, timeline: plan.timeline })}
              className={`bg-brand-card border rounded-3xl p-6 flex flex-col justify-between cursor-pointer transition shadow-xl relative ${
                selectedPlan.name === plan.name ? "border-rose-400 ring-2 ring-rose-500/30 bg-[#140b15]" : "border-brand-border hover:border-stone-500"
              }`}
            >
              {plan.popular && (
                <span className="absolute -top-3 right-6 bg-rose-gradient text-stone-950 font-bold text-[10px] tracking-wider uppercase px-3 py-1 rounded-full shadow-md">
                  Most Popular 🔥
                </span>
              )}
              <div className="space-y-4">
                <div>
                  <h3 className="font-serif text-lg font-bold text-white">{plan.name}</h3>
                  <div className="text-3xl font-bold text-brand-gold font-serif mt-1">₹{plan.price.toLocaleString("en-IN")}</div>
                  <div className="text-[10px] uppercase tracking-wider text-stone-400 font-mono mt-0.5">One Time Payment</div>
                  <div className="flex items-center gap-1.5 text-xs text-rose-300 font-mono mt-2">
                    <Clock size={13} /> Delivery: {plan.timeline}
                  </div>
                </div>

                <div className="space-y-2 pt-3 border-t border-brand-border text-xs">
                  {plan.features.map((feat, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-stone-300">
                      <CheckCircle2 size={14} className="text-emerald-400 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-brand-border space-y-3 text-center">
                <span className="text-[10px] uppercase font-mono text-stone-400 block">Best For: <strong className="text-white">{plan.bestFor}</strong></span>
                <span className={`text-xs font-bold uppercase tracking-wider ${selectedPlan.name === plan.name ? "text-rose-300" : "text-stone-500"}`}>
                  {selectedPlan.name === plan.name ? "✓ Selected Package" : "Click to Select"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Business Intake Form */}
      <form onSubmit={handleSubmit} className="bg-brand-card border border-brand-border rounded-3xl p-6 sm:p-10 shadow-2xl space-y-8">
        <div className="border-b border-brand-border pb-4">
          <h2 className="font-serif text-2xl font-bold text-white flex items-center gap-2">
            <Building2 className="text-brand-gold" size={24} /> Business Details & Requirements
          </h2>
          <p className="text-xs text-stone-400 mt-1">Fill in your business info so we can initiate your website development.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
          <div>
            <label className="block text-stone-400 mb-1">Business / Brand Name <span className="text-rose-400">*</span></label>
            <input
              type="text"
              placeholder="e.g. Shriphal Event Management"
              value={formData.businessName}
              onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
              className="w-full bg-[#050811] border border-brand-border rounded-xl px-4 py-3 text-white"
              required
            />
          </div>

          <div>
            <label className="block text-stone-400 mb-1">Your Name <span className="text-rose-400">*</span></label>
            <input
              type="text"
              placeholder="e.g. Aarav Sharma"
              value={formData.founderName}
              onChange={(e) => setFormData({ ...formData, founderName: e.target.value })}
              className="w-full bg-[#050811] border border-brand-border rounded-xl px-4 py-3 text-white"
              required
            />
          </div>

          <div>
            <label className="block text-stone-400 mb-1">WhatsApp Phone Number <span className="text-rose-400">*</span></label>
            <input
              type="tel"
              placeholder="9876543210"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full bg-[#050811] border border-brand-border rounded-xl px-4 py-3 text-white"
              required
            />
          </div>

          <div>
            <label className="block text-stone-400 mb-1">Email Address <span className="text-rose-400">*</span></label>
            <input
              type="email"
              placeholder="contact@business.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full bg-[#050811] border border-brand-border rounded-xl px-4 py-3 text-white"
              required
            />
          </div>

          <div>
            <label className="block text-stone-400 mb-1">City / Region <span className="text-rose-400">*</span></label>
            <input
              type="text"
              placeholder="e.g. Mumbai, Maharashtra"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              className="w-full bg-[#050811] border border-brand-border rounded-xl px-4 py-3 text-white"
              required
            />
          </div>

          <div>
            <label className="block text-stone-400 mb-1">Google Drive Link (Logo, Photos, Content)</label>
            <input
              type="text"
              placeholder="https://drive.google.com/..."
              value={formData.driveLink}
              onChange={(e) => setFormData({ ...formData, driveLink: e.target.value })}
              className="w-full bg-[#050811] border border-brand-border rounded-xl px-4 py-3 text-white"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-stone-400 mb-1">Describe Your Services & Vision</label>
            <textarea
              rows={3}
              placeholder="Tell us what your business does and what style/features you need..."
              value={formData.specialRequirements}
              onChange={(e) => setFormData({ ...formData, specialRequirements: e.target.value })}
              className="w-full bg-[#050811] border border-brand-border rounded-xl p-3 text-white resize-none"
            />
          </div>
        </div>

        {/* Pricing & Submission Summary */}
        <div className="pt-6 border-t border-brand-border flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <span className="text-xs uppercase tracking-widest text-stone-400 font-semibold font-mono block">Selected: {selectedPlan.name}</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-serif text-white font-bold">₹{selectedPlan.price.toLocaleString("en-IN")}</span>
              <span className="text-xs text-rose-300">✨ Pay 50% advance to start development</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-rose-gradient text-stone-950 font-bold uppercase tracking-widest text-xs hover:opacity-95 transition shadow-lg cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? "Processing..." : "Proceed to Pay Advance →"}
          </button>
        </div>

      </form>

    </div>
  );
}