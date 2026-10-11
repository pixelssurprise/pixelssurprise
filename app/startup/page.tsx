"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Rocket, CheckCircle2, ArrowRight, ShieldCheck, Building2, Globe, Cpu, Wrench, Clock, Layers } from "lucide-react";

export default function StartupGrowthPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Selected Plan State (Higher Professional Pricing)
  const [selectedPlan, setSelectedPlan] = useState<{ name: string; price: number; timeline: string }>({
    name: "Growth Scale Plan (Mid-Tier)",
    price: 50000,
    timeline: "3 to 4 Weeks",
  });

  // Business Intake Form State
  const [formData, setFormData] = useState({
    businessName: "",
    founderName: "",
    phone: "",
    email: "",
    businessCategory: "SaaS / Tech Startup",
    businessAddress: "",
    city: "",
    pincode: "",
    estimatedPages: "5 to 8 Pages",
    domainNeeded: "Yes (Needs new domain assistance)",
    targetAudience: "",
    coreOfferings: "",
    driveLink: "",
    specialRequirements: "",
  });

  const plans = [
    {
      name: "Starter Basic (Static Showcase)",
      price: 15000,
      timeline: "10 to 15 Days",
      desc: "Ideal for local businesses, consultants, and service providers requiring a pristine multi-page static presence.",
      features: [
        "Up to 5 Professional Pages (Home, About, Services, Contact, etc.)",
        "Lightning-Fast Static Architecture (Next.js / HTML5)",
        "Fully Responsive & Mobile-Optimized UI",
        "On-Page SEO Setup (Meta tags, sitemap, robots.txt)",
        "Hosting & SSL Setup Assistance (Client pays platform fees)",
        "1 Round of Design Revisions",
        "Delivery Timeline: 10 - 15 Days",
      ],
    },
    {
      name: "Growth Scale (Mid-Tier Dynamic)",
      price: 50000,
      popular: true,
      timeline: "3 to 4 Weeks",
      desc: "For growing businesses & agencies wanting custom design, dynamic layouts, and enhanced lead capture workflows.",
      features: [
        "Up to 12 Custom Designed Pages & Dynamic Sections",
        "Interactive Elements & Product/Service Showcases",
        "Advanced On-Page & Technical SEO Optimization",
        "Integrated Lead Capture / Contact CRM Webhooks",
        "Custom Color Palette, Typography & Brand Guidelines",
        "Free 1st Year Domain (.com / .in) & Managed Cloud Hosting Included",
        "30 Days Post-Launch Maintenance & Minor Text Changes Free",
        "Delivery Timeline: 3 - 4 Weeks",
      ],
    },
    {
      name: "Advance Enterprise (Custom Web App)",
      price: 95000,
      timeline: "3+ Months",
      desc: "Full-scale custom applications with database architecture, user authentication, dashboards, and complex workflows.",
      features: [
        "Unlimited Custom Pages & Scalable Architecture",
        "Supabase / PostgreSQL Database Integration & User Auth",
        "Custom Gamified Experiences, Dashboards, or Portals",
        "Advanced Enterprise SEO & Performance Speed Auditing",
        "Free 1st Year Domain & Premium High-Speed Cloud Hosting",
        "3 Months Dedicated Maintenance, Bug Fixes & Monthly Iterations",
        "Priority VIP Support & Direct Developer Access",
        "Delivery Timeline: 3+ Months",
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
          address: `${formData.businessAddress}, ${formData.city} - ${formData.pincode}`,
          estimated_pages: formData.estimatedPages,
          domain_assistance: formData.domainNeeded,
          target_audience: formData.targetAudience,
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
      
      {/* Hero Section */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#131b2e] border border-[#3b5078] text-rose-200 text-xs font-mono uppercase tracking-widest mx-auto shadow-lg">
          <Rocket size={14} className="text-brand-gold" /> PixelsSurprise Enterprise Web Engineering
        </div>
        <h1 className="font-serif text-3xl sm:text-6xl font-bold text-white leading-tight">
          Enterprise-Grade Web Solutions For <span className="text-transparent bg-clip-text bg-rose-gradient">Ambitious Businesses</span>
        </h1>
        <p className="text-sm sm:text-base text-stone-400 leading-relaxed">
          We architect, design, and scale high-performance digital platforms. Complete transparency on hosting, domain registration, SEO, and ongoing maintenance.
        </p>
      </div>

      {/* Step 1: Choose Tiered Plan */}
      <div className="space-y-6">
        <h2 className="font-serif text-2xl font-bold text-white text-center">1. Select Your Development Tier</h2>
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
                    <Clock size={13} /> Estimated Time: {plan.timeline}
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
                  {selectedPlan.name === plan.name ? "✓ Selected Tier" : "Click to Select"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Operational Transparency Guide: Hosting, Domain & Maintenance */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-brand-card border border-brand-border p-6 rounded-2xl space-y-3">
          <Globe className="text-brand-gold" size={24} />
          <h3 className="font-serif text-lg font-bold text-white">Domain & Hosting</h3>
          <p className="text-xs text-stone-400 leading-relaxed">
            Standard domains (.com / .in) cost approx ₹600 - ₹1,200/year. High-performance cloud hosting (Vercel / AWS) starts at free tiers or ₹800/month for heavy traffic. Included free for 1 year in Growth & Advance tiers.
          </p>
        </div>

        <div className="bg-brand-card border border-brand-border p-6 rounded-2xl space-y-3">
          <Cpu className="text-emerald-400" size={24} />
          <h3 className="font-serif text-lg font-bold text-white">Professional SEO</h3>
          <p className="text-xs text-stone-400 leading-relaxed">
            All websites include foundational technical SEO (XML sitemaps, robots.txt, semantic HTML5 structure, schema markup, and Google Search Console integration) to rank organically on Google.
          </p>
        </div>

        <div className="bg-brand-card border border-brand-border p-6 rounded-2xl space-y-3">
          <Wrench className="text-rose-400" size={24} />
          <h3 className="font-serif text-lg font-bold text-white">Maintenance & Changes</h3>
          <p className="text-xs text-stone-400 leading-relaxed">
            Post-warranty maintenance retainers are available starting at ₹2,500/month for text changes, security patches, plugin updates, and minor structural modifications.
          </p>
        </div>
      </div>

      {/* Step 2: Project Intake Form */}
      <form onSubmit={handleSubmit} className="bg-brand-card border border-brand-border rounded-3xl p-6 sm:p-10 shadow-2xl space-y-8">
        <div className="border-b border-brand-border pb-4">
          <h2 className="font-serif text-2xl font-bold text-white flex items-center gap-2">
            <Building2 className="text-brand-gold" size={24} /> 2. Project Specification & Business Details
          </h2>
          <p className="text-xs text-stone-400 mt-1">Provide your operational details so our engineering team can scope your platform.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
          <div>
            <label className="block text-stone-400 mb-1">Business / Company Name <span className="text-rose-400">*</span></label>
            <input
              type="text"
              placeholder="e.g. Nexus Corp Technologies"
              value={formData.businessName}
              onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
              className="w-full bg-[#050811] border border-brand-border rounded-xl px-4 py-3 text-white"
              required
            />
          </div>

          <div>
            <label className="block text-stone-400 mb-1">Founder / Managing Director Name <span className="text-rose-400">*</span></label>
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
            <label className="block text-stone-400 mb-1">Official WhatsApp Phone Number <span className="text-rose-400">*</span></label>
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
            <label className="block text-stone-400 mb-1">Official Business Email <span className="text-rose-400">*</span></label>
            <input
              type="email"
              placeholder="contact@nexuscorp.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full bg-[#050811] border border-brand-border rounded-xl px-4 py-3 text-white"
              required
            />
          </div>

          <div>
            <label className="block text-stone-400 mb-1">Industry / Sector</label>
            <select
              value={formData.businessCategory}
              onChange={(e) => setFormData({ ...formData, businessCategory: e.target.value })}
              className="w-full bg-[#050811] border border-brand-border rounded-xl px-4 py-3 text-white cursor-pointer"
            >
              <option value="SaaS / Tech Startup">SaaS / Tech Startup</option>
              <option value="Event Management & Weddings">Event Management & Weddings</option>
              <option value="Corporate & Consulting Agency">Corporate & Consulting Agency</option>
              <option value="Retail & E-commerce Platform">Retail & E-commerce Platform</option>
              <option value="Real Estate & Construction">Real Estate & Construction</option>
              <option value="Healthcare & Hospitality">Healthcare & Hospitality</option>
            </select>
          </div>

          <div>
            <label className="block text-stone-400 mb-1">Estimated Page Count / Scope</label>
            <select
              value={formData.estimatedPages}
              onChange={(e) => setFormData({ ...formData, estimatedPages: e.target.value })}
              className="w-full bg-[#050811] border border-brand-border rounded-xl px-4 py-3 text-white cursor-pointer"
            >
              <option value="1 to 5 Pages (Static)">1 to 5 Pages (Static Showcase)</option>
              <option value="5 to 12 Pages (Dynamic)">5 to 12 Pages (Dynamic Growth)</option>
              <option value="12+ Pages / Full Web App">12+ Pages / Full Web App (Enterprise)</option>
            </select>
          </div>

          <div>
            <label className="block text-stone-400 mb-1">Do you have a registered domain?</label>
            <select
              value={formData.domainNeeded}
              onChange={(e) => setFormData({ ...formData, domainNeeded: e.target.value })}
              className="w-full bg-[#050811] border border-brand-border rounded-xl px-4 py-3 text-white cursor-pointer"
            >
              <option value="Yes (Needs new domain assistance)">Yes, need assistance registering a new domain</option>
              <option value="Already have domain">Already own an active domain</option>
            </select>
          </div>

          <div>
            <label className="block text-stone-400 mb-1">City / Operating Region <span className="text-rose-400">*</span></label>
            <input
              type="text"
              placeholder="e.g. Mumbai, India"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              className="w-full bg-[#050811] border border-brand-border rounded-xl px-4 py-3 text-white"
              required
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-stone-400 mb-1">Registered Business Address <span className="text-rose-400">*</span></label>
            <input
              type="text"
              placeholder="Office No. 12, Tech Park, Bandra Kurla Complex..."
              value={formData.businessAddress}
              onChange={(e) => setFormData({ ...formData, businessAddress: e.target.value })}
              className="w-full bg-[#050811] border border-brand-border rounded-xl px-4 py-3 text-white"
              required
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-stone-400 mb-1">Google Drive Link (Logo, Brand Assets, Content)</label>
            <input
              type="text"
              placeholder="https://drive.google.com/..."
              value={formData.driveLink}
              onChange={(e) => setFormData({ ...formData, driveLink: e.target.value })}
              className="w-full bg-[#050811] border border-brand-border rounded-xl px-4 py-3 text-white"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-stone-400 mb-1">Detailed Scope & Functional Requirements</label>
            <textarea
              rows={4}
              placeholder="Describe your target audience, required features, reference websites, and specific technical expectations..."
              value={formData.specialRequirements}
              onChange={(e) => setFormData({ ...formData, specialRequirements: e.target.value })}
              className="w-full bg-[#050811] border border-brand-border rounded-xl p-3 text-white resize-none"
            />
          </div>
        </div>

        {/* Pricing & Submission Summary */}
        <div className="pt-6 border-t border-brand-border flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <span className="text-xs uppercase tracking-widest text-stone-400 font-semibold font-mono block">Selected Tier: {selectedPlan.name}</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-serif text-white font-bold">₹{selectedPlan.price.toLocaleString("en-IN")}</span>
              <span className="text-xs text-rose-300">✨ Pay 50% advance (₹{Math.round(selectedPlan.price / 2).toLocaleString("en-IN")}) to initiate development</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-rose-gradient text-stone-950 font-bold uppercase tracking-widest text-xs hover:opacity-95 transition shadow-lg cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? "Processing..." : `Proceed to Pay ₹{Math.round(selectedPlan.price / 2).toLocaleString("en-IN")} Advance →`}
          </button>
        </div>

      </form>

    </div>
  );
}