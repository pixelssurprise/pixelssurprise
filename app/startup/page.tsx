"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Rocket, CheckCircle2, ArrowRight, Building2, Clock } from "lucide-react";

export default function StartupGrowthPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Realistic & Competitive Pricing Tiers
  const [selectedPlan, setSelectedPlan] = useState<{ name: string; price: number; timeline: string }>({
    name: "Growth Scale Plan (Dynamic)",
    price: 19999,
    timeline: "12 - 15 Days",
  });

  const [formData, setFormData] = useState({
    businessName: "",
    founderName: "",
    phone: "",
    email: "",
    businessCategory: "SaaS / Tech Startup",
    businessAddress: "",
    city: "",
    estimatedPages: "3 to 5 Pages",
    domainNeeded: "Yes (Needs new domain assistance)",
    coreOfferings: "",
    driveLink: "",
    specialRequirements: "",
  });

  const plans = [
    {
      name: "Starter Basic (Static Showcase)",
      price: 9999,
      timeline: "7 - 10 Days",
      desc: "Ideal for local shops, cafes, and consultants needing a clean, lightning-fast multi-page presence.",
      features: [
        "Up to 3 Professional Pages (Home, Services, Contact)",
        "Lightning-Fast Next.js & Tailwind Architecture",
        "Fully Mobile-Optimized Responsive Design",
        "Basic On-Page SEO (Meta Titles & Descriptions)",
        "WhatsApp Direct Inquiry & Contact Form",
        "Hosting Setup Assistance",
      ],
    },
    {
      name: "Growth Scale (Dynamic)",
      price: 19999,
      popular: true,
      timeline: "12 - 15 Days",
      desc: "For growing businesses wanting custom design, interactive elements, and photo/video showcases.",
      features: [
        "Up to 6 Custom Designed Pages",
        "Interactive Product or Service Showcase",
        "Photo / Video Gallery Integration",
        "Advanced Technical SEO Setup",
        "Lead Capture & Inquiry Database",
        "30 Days Free Post-Launch Support",
      ],
    },
    {
      name: "Advance Web App / Custom",
      price: 39999,
      timeline: "3 - 4 Weeks",
      desc: "Full-scale custom applications with database architecture, user logins, and bespoke interactive features.",
      features: [
        "Unlimited Pages & Custom Architecture",
        "Supabase Database & User Authentication",
        "Custom Interactive Features or Mini-Apps",
        "Complete SEO Optimization & Speed Tuning",
        "Domain & Cloud Hosting Setup Included",
        "3 Months Dedicated Support & Iterations",
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
          estimated_pages: formData.estimatedPages,
          domain_assistance: formData.domainNeeded,
          core_offerings: formData.coreOfferings,
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
    <div className="min-h-screen bg-[#050811] text-[#fcebed] px-4 sm:px-6 py-12 max-w-6xl mx-auto space-y-16">
      
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#131b2e] border border-[#3b5078] text-rose-200 text-xs font-mono uppercase tracking-widest mx-auto shadow-lg">
          <Rocket size={14} className="text-brand-gold" /> PixelsSurprise Startup & Business Web Agency
        </div>
        <h1 className="font-serif text-3xl sm:text-6xl font-bold text-white leading-tight">
          Websites Built to Grow <span className="text-transparent bg-clip-text bg-rose-gradient">Your Small Business</span>
        </h1>
        <p className="text-sm sm:text-base text-stone-400 leading-relaxed">
          Professional, lightning-fast, mobile-optimized websites with built-in SEO and direct WhatsApp lead capture. Choose your tier below.
        </p>
      </div>

      {/* Pricing Tiers */}
      <div className="space-y-6">
        <h2 className="font-serif text-2xl font-bold text-white text-center">1. Select Your Website Package</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.name}
              onClick={() => setSelectedPlan({ name: plan.name, price: plan.price, timeline: plan.timeline })}
              className={`bg-brand-card border rounded-3xl p-6 sm:p-8 flex flex-col justify-between cursor-pointer transition shadow-xl relative ${
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
                  <div className="text-3xl font-bold text-brand-gold font-serif mt-1">₹{plan.price.toLocaleString("en-IN")}</div>
                  <div className="flex items-center gap-1.5 text-xs text-rose-300 font-mono mt-1">
                    <Clock size={13} /> Delivery: {plan.timeline}
                  </div>
                  <p className="text-xs text-stone-400 mt-3 leading-relaxed">{plan.desc}</p>
                </div>
                <div className="space-y-2.5 pt-4 border-t border-brand-border text-xs">
                  {plan.features.map((feat, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-stone-300">
                      <CheckCircle2 size={14} className="text-emerald-400 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-brand-border text-center">
                <span className={`text-xs font-bold uppercase tracking-wider ${selectedPlan.name === plan.name ? "text-rose-300" : "text-stone-500"}`}>
                  {selectedPlan.name === plan.name ? "✓ Selected Package" : "Click to Select"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Intake Form */}
      <form onSubmit={handleSubmit} className="bg-brand-card border border-brand-border rounded-3xl p-6 sm:p-10 shadow-2xl space-y-8">
        <div className="border-b border-brand-border pb-4">
          <h2 className="font-serif text-2xl font-bold text-white flex items-center gap-2">
            <Building2 className="text-brand-gold" size={24} /> 2. Business Details & Requirements
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

        {/* Pricing & Clean Submission Summary */}
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