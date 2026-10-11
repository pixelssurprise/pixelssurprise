"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Rocket, CheckCircle2, ArrowRight, ShieldCheck, Building2, MapPin, Layers, Sparkles, X } from "lucide-react";

export default function StartupGrowthPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Selected Plan State
  const [selectedPlan, setSelectedPlan] = useState<{ name: string; price: number }>({
    name: "Growth Scale Plan",
    price: 4999,
  });

  // Business Intake Form State
  const [formData, setFormData] = useState({
    businessName: "",
    founderName: "",
    phone: "",
    email: "",
    businessCategory: "Event Management & Weddings",
    businessAddress: "",
    city: "",
    pincode: "",
    targetAudience: "",
    coreOfferings: "",
    driveLink: "",
    socialLinks: "",
    specialRequirements: "",
  });

  const plans = [
    {
      name: "Starter Basic",
      price: 1999,
      desc: "Perfect for local shops, cafes, and sole proprietors needing a lightning-fast modern landing page.",
      features: ["Custom Landing Page", "Mobile Optimized UI", "WhatsApp Direct Inquiry", "Google Maps & Contact Info", "Delivered in 3 Days"],
    },
    {
      name: "Growth Scale",
      price: 4999,
      popular: true,
      desc: "For growing startups & event businesses wanting high conversions and interactive showcases.",
      features: ["Everything in Starter", "Interactive Product/Service Showcase", "Photo & Video Gallery Integration", "Lead Capture & Enquiry Form", "Custom Color Theme & Branding", "Delivered in 4-5 Days"],
    },
    {
      name: "Advance Enterprise",
      price: 9999,
      desc: "Full-scale custom web apps with gamification, database connections, and booking workflows.",
      features: ["Everything in Growth", "Custom Mini-Games or Scratch Reveals", "Supabase Database Integration", "User Accounts & Order Tracking", "Priority VIP Support & Revisions", "Delivered in 7 Days"],
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
        business_details: {
          business_name: formData.businessName,
          category: formData.businessCategory,
          address: `${formData.businessAddress}, ${formData.city} - ${formData.pincode}`,
          target_audience: formData.targetAudience,
          core_offerings: formData.coreOfferings,
          drive_link: formData.driveLink,
          social_links: formData.socialLinks,
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
    <div className="min-h-screen bg-[#050811] text-[#fcebed] px-4 sm:px-6 py-12 max-w-5xl mx-auto space-y-16">
      
      {/* Hero Section */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#131b2e] border border-[#3b5078] text-rose-200 text-xs font-mono uppercase tracking-widest mx-auto shadow-lg">
          <Rocket size={14} className="text-brand-gold" /> PixelsSurprise Business & Startup Engine
        </div>
        <h1 className="font-serif text-3xl sm:text-6xl font-bold text-white leading-tight">
          Scale Your Business With <span className="text-transparent bg-clip-text bg-rose-gradient">High-Impact Websites</span>
        </h1>
        <p className="text-sm sm:text-base text-stone-400 leading-relaxed">
          From basic landing pages to advanced interactive web apps, we build custom digital experiences that turn visitors into loyal customers. Select your plan and share your business vision below.
        </p>
      </div>

      {/* Step 1: Choose Plan */}
      <div className="space-y-6">
        <h2 className="font-serif text-2xl font-bold text-white text-center">1. Choose Your Growth Plan</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.name}
              onClick={() => setSelectedPlan({ name: plan.name, price: plan.price })}
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
                  <h3 className="font-serif text-xl font-bold text-white">{plan.name}</h3>
                  <div className="text-2xl font-bold text-brand-gold font-serif mt-1">₹{plan.price}</div>
                  <p className="text-xs text-stone-400 mt-2 leading-relaxed">{plan.desc}</p>
                </div>
                <div className="space-y-2 pt-4 border-t border-brand-border text-xs">
                  {plan.features.map((feat, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-stone-300">
                      <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-brand-border text-center">
                <span className={`text-xs font-bold uppercase tracking-wider ${selectedPlan.name === plan.name ? "text-rose-300" : "text-stone-500"}`}>
                  {selectedPlan.name === plan.name ? "✓ Selected Plan" : "Click to Select"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Step 2: Business & Address Intake Form */}
      <form onSubmit={handleSubmit} className="bg-brand-card border border-brand-border rounded-3xl p-6 sm:p-10 shadow-2xl space-y-8">
        <div className="border-b border-brand-border pb-4">
          <h2 className="font-serif text-2xl font-bold text-white flex items-center gap-2">
            <Building2 className="text-brand-gold" size={24} /> 2. Business & Project Requirements
          </h2>
          <p className="text-xs text-stone-400 mt-1">We need your business address, brand assets, and operational details to start building.</p>
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
            <label className="block text-stone-400 mb-1">Founder / Contact Person Name <span className="text-rose-400">*</span></label>
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
            <label className="block text-stone-400 mb-1">Business Email <span className="text-rose-400">*</span></label>
            <input
              type="email"
              placeholder="contact@yourbusiness.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full bg-[#050811] border border-brand-border rounded-xl px-4 py-3 text-white"
              required
            />
          </div>

          <div>
            <label className="block text-stone-400 mb-1">Business Category</label>
            <select
              value={formData.businessCategory}
              onChange={(e) => setFormData({ ...formData, businessCategory: e.target.value })}
              className="w-full bg-[#050811] border border-brand-border rounded-xl px-4 py-3 text-white cursor-pointer"
            >
              <option value="Event Management & Weddings">Event Management & Weddings</option>
              <option value="SaaS / Tech Startup">SaaS / Tech Startup</option>
              <option value="Retail & E-commerce Store">Retail & E-commerce Store</option>
              <option value="Café, Bakery & Hospitality">Café, Bakery & Hospitality</option>
              <option value="Real Estate & Construction">Real Estate & Construction</option>
              <option value="Other Service Business">Other Service Business</option>
            </select>
          </div>

          <div>
            <label className="block text-stone-400 mb-1">City / Region <span className="text-rose-400">*</span></label>
            <input
              type="text"
              placeholder="e.g. Navi Mumbai, Maharashtra"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              className="w-full bg-[#050811] border border-brand-border rounded-xl px-4 py-3 text-white"
              required
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-stone-400 mb-1">Full Business / Office Address <span className="text-rose-400">*</span></label>
            <input
              type="text"
              placeholder="Shop No. 4, Grand Avenue, Sector 15..."
              value={formData.businessAddress}
              onChange={(e) => setFormData({ ...formData, businessAddress: e.target.value })}
              className="w-full bg-[#050811] border border-brand-border rounded-xl px-4 py-3 text-white"
              required
            />
          </div>

          <div>
            <label className="block text-stone-400 mb-1">Target Audience / Customer Base</label>
            <input
              type="text"
              placeholder="e.g. Couples looking for luxury weddings"
              value={formData.targetAudience}
              onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
              className="w-full bg-[#050811] border border-brand-border rounded-xl px-4 py-3 text-white"
            />
          </div>

          <div>
            <label className="block text-stone-400 mb-1">Core Products or Services Offered</label>
            <input
              type="text"
              placeholder="e.g. Wedding planning, decoration, catering"
              value={formData.coreOfferings}
              onChange={(e) => setFormData({ ...formData, coreOfferings: e.target.value })}
              className="w-full bg-[#050811] border border-brand-border rounded-xl px-4 py-3 text-white"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-stone-400 mb-1">Google Drive Link (Logo, Photos, Brand Assets)</label>
            <input
              type="text"
              placeholder="https://drive.google.com/..."
              value={formData.driveLink}
              onChange={(e) => setFormData({ ...formData, driveLink: e.target.value })}
              className="w-full bg-[#050811] border border-brand-border rounded-xl px-4 py-3 text-white"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-stone-400 mb-1">Special Features or Vision Idea</label>
            <textarea
              rows={3}
              placeholder="Tell us any specific style, color scheme, or interactive features you want..."
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
              <span className="text-3xl font-serif text-white font-bold">₹{selectedPlan.price}</span>
              <span className="text-xs text-rose-300">✨ Pay 50% advance (₹{Math.round(selectedPlan.price / 2)}) to begin</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-rose-gradient text-stone-950 font-bold uppercase tracking-widest text-xs hover:opacity-95 transition shadow-lg cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? "Processing..." : `Proceed to Pay ₹{Math.round(selectedPlan.price / 2)} Advance →`}
          </button>
        </div>

      </form>

    </div>
  );
}