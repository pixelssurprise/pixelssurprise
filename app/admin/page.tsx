"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import {
  ShoppingBag,
  Layers,
  Send,
  Trash2,
  Eye,
  EyeOff,
  Search,
  ExternalLink,
} from "lucide-react";

export default function AdminPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"demos" | "orders">("demos");
  const [loading, setLoading] = useState(true);

  const [orders, setOrders] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);

  const [orderSearch, setOrderSearch] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState("ALL");

  const [newTemplate, setNewTemplate] = useState({
    title: "",
    category: "Surprise",
    sub_category: "Birthday",
    price: 699,
    demo_url: "",
    description: "",
  });

  useEffect(() => {
    checkAdminAndFetch();
  }, []);

  async function checkAdminAndFetch() {
    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/auth");
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .single();

    if (!profile?.is_admin) {
      router.push("/explore");
      return;
    }

    await fetchData();
    setLoading(false);
  }

  async function fetchData() {
    const [ordersRes, templatesRes] = await Promise.all([
      supabase
        .from("orders")
        .select("*, templates(title, category)")
        .order("created_at", { ascending: false }),
      supabase
        .from("templates")
        .select("*")
        .order("created_at", { ascending: false }),
    ]);

    if (ordersRes.data) setOrders(ordersRes.data);
    if (templatesRes.data) setTemplates(templatesRes.data);
  }

  async function updateOrderStatus(orderId: string, updates: Record<string, any>) {
    const { error } = await supabase.from("orders").update(updates).eq("id", orderId);
    if (error) {
      alert("Update failed: " + error.message);
    } else {
      fetchData();
    }
  }

  async function handleAddTemplate(e: React.FormEvent) {
    e.preventDefault();
    let formattedUrl = newTemplate.demo_url.trim();
    if (!formattedUrl.startsWith("http://") && !formattedUrl.startsWith("https://")) {
      formattedUrl = `https://${formattedUrl}`;
    }

    const { error } = await supabase.from("templates").insert([
      {
        ...newTemplate,
        demo_url: formattedUrl,
        is_active: true,
        needs_photos: true,
        needs_videos: false,
        needs_music: true,
        needs_message: true,
        needs_event_date: true,
      },
    ]);

    if (error) {
      alert("Error adding template: " + error.message);
      return;
    }

    alert("Template added successfully");
    setNewTemplate({
      title: "",
      category: "Surprise",
      sub_category: "Birthday",
      price: 699,
      demo_url: "",
      description: "",
    });
    fetchData();
  }

  async function toggleTemplateActive(id: string, currentState: boolean) {
    await supabase.from("templates").update({ is_active: !currentState }).eq("id", id);
    fetchData();
  }

  async function deleteTemplate(id: string) {
    if (!confirm("Permanently delete this template?")) return;
    await supabase.from("templates").delete().eq("id", id);
    fetchData();
  }

  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      (o.client_name || "").toLowerCase().includes(orderSearch.toLowerCase()) ||
      (o.id || "").toLowerCase().includes(orderSearch.toLowerCase());
    const matchesStatus = orderStatusFilter === "ALL" || o.status === orderStatusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0608] flex items-center justify-center text-brand-gold font-mono text-xs uppercase tracking-widest">
        Loading Panel...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0608] text-white">
      <header className="border-b border-brand-border bg-brand-dark/95 sticky top-0 z-40 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="font-serif text-xl font-bold text-brand-goldLight">Admin Control</h1>

          <div className="flex items-center gap-2 bg-brand-card p-1 rounded-2xl border border-brand-border">
            <button
              onClick={() => setActiveTab("demos")}
              className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeTab === "demos"
                  ? "bg-rose-gradient text-brand-dark shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Layers size={14} /> Demos & Templates ({templates.length})
            </button>
            <button
              onClick={() => setActiveTab("orders")}
              className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeTab === "orders"
                  ? "bg-rose-gradient text-brand-dark shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <ShoppingBag size={14} /> Orders ({orders.length})
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {activeTab === "demos" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="bg-brand-card border border-brand-border rounded-3xl p-6 h-fit space-y-4">
              <h2 className="font-serif text-lg font-bold text-brand-goldLight">Add New Live Demo</h2>

              <form onSubmit={handleAddTemplate} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-400 mb-1">Title</label>
                  <input
                    required
                    type="text"
                    placeholder="Ganesh Chaturthi Sacred Invite"
                    value={newTemplate.title}
                    onChange={(e) => setNewTemplate({ ...newTemplate, title: e.target.value })}
                    className="w-full bg-brand-dark border border-brand-border rounded-xl p-3 text-white outline-none focus:border-brand-gold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1">Category</label>
                    <select
                      value={newTemplate.category}
                      onChange={(e) => setNewTemplate({ ...newTemplate, category: e.target.value })}
                      className="w-full bg-brand-dark border border-brand-border rounded-xl p-3 text-white outline-none focus:border-brand-gold"
                    >
                      <option value="Surprise">Surprise</option>
                      <option value="Invitation">Invitation</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Subcategory</label>
                    <input
                      required
                      type="text"
                      placeholder="Bappa Agman / Birthday"
                      value={newTemplate.sub_category}
                      onChange={(e) => setNewTemplate({ ...newTemplate, sub_category: e.target.value })}
                      className="w-full bg-brand-dark border border-brand-border rounded-xl p-3 text-white outline-none focus:border-brand-gold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Price (₹)</label>
                  <input
                    required
                    type="number"
                    value={newTemplate.price}
                    onChange={(e) => setNewTemplate({ ...newTemplate, price: Number(e.target.value) })}
                    className="w-full bg-brand-dark border border-brand-border rounded-xl p-3 text-white outline-none focus:border-brand-gold"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Preview URL (Vercel link)</label>
                  <input
                    required
                    type="text"
                    placeholder="https://ganesh-invitation2.vercel.app"
                    value={newTemplate.demo_url}
                    onChange={(e) => setNewTemplate({ ...newTemplate, demo_url: e.target.value.trim() })}
                    className="w-full bg-brand-dark border border-brand-border rounded-xl p-3 text-white outline-none focus:border-brand-gold"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Description</label>
                  <textarea
                    rows={2}
                    placeholder="Animations, chants, interactive letter..."
                    value={newTemplate.description}
                    onChange={(e) => setNewTemplate({ ...newTemplate, description: e.target.value })}
                    className="w-full bg-brand-dark border border-brand-border rounded-xl p-3 text-white outline-none focus:border-brand-gold"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-full bg-rose-gradient text-brand-dark font-bold text-xs uppercase tracking-wider hover:opacity-90 transition cursor-pointer"
                >
                  Save Template
                </button>
              </form>
            </div>

            <div className="lg:col-span-2 space-y-4">
              <h2 className="font-serif text-lg font-bold text-white">Live Demos in Catalog</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {templates.map((t) => (
                  <div
                    key={t.id}
                    className="bg-brand-card border border-brand-border rounded-2xl p-4 flex flex-col justify-between space-y-3"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-brand-gold/10 text-brand-gold uppercase">
                          {t.category} • {t.sub_category}
                        </span>
                        <span className="font-mono text-xs font-bold text-brand-gold">₹{t.price}</span>
                      </div>
                      <h3 className="font-serif font-bold text-white text-base mt-2">{t.title}</h3>
                      <a
                        href={t.demo_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-slate-400 hover:text-white truncate mt-1 flex items-center gap-1"
                      >
                        {t.demo_url} <ExternalLink size={11} />
                      </a>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-brand-border/60">
                      <button
                        onClick={() => toggleTemplateActive(t.id, t.is_active)}
                        className={`text-xs flex items-center gap-1.5 cursor-pointer ${
                          t.is_active ? "text-emerald-400" : "text-slate-500"
                        }`}
                      >
                        {t.is_active ? <Eye size={14} /> : <EyeOff size={14} />}
                        {t.is_active ? "Active" : "Hidden"}
                      </button>

                      <button
                        onClick={() => deleteTemplate(t.id)}
                        className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 size={14} /> Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "orders" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-64">
                  <Search size={14} className="absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search client name..."
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                    className="w-full bg-brand-dark border border-brand-border rounded-xl pl-9 pr-3 py-2 text-xs text-white outline-none focus:border-brand-gold"
                  />
                </div>
                <select
                  value={orderStatusFilter}
                  onChange={(e) => setOrderStatusFilter(e.target.value)}
                  className="bg-brand-dark border border-brand-border rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-brand-gold"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="Pending">Pending</option>
                  <option value="Building">Building</option>
                  <option value="Completed">Completed</option>
                  <option value="Delivered">Delivered</option>
                </select>
              </div>
            </div>

            {filteredOrders.length === 0 ? (
              <div className="bg-brand-card border border-brand-border rounded-3xl p-12 text-center text-xs text-slate-400 font-mono">
                No orders found.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {filteredOrders.map((order) => (
                  <div
                    key={order.id}
                    className="bg-brand-card border border-brand-border rounded-3xl p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-6"
                  >
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-3">
                        <span className="font-serif font-bold text-lg text-white">{order.client_name}</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-brand-gold/10 text-brand-gold">
                          {order.templates?.title || "Custom Order"}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">
                          {new Date(order.created_at).toLocaleDateString()}
                        </span>
                      </div>

                      <div className="text-xs text-slate-400 space-y-1">
                        <p>
                          <strong className="text-slate-300">Message / Letter:</strong>{" "}
                          {order.custom_message || "None provided"}
                        </p>
                        <p>
                          <strong className="text-slate-300">Event Date:</strong> {order.event_date || "None"}
                        </p>
                        <div className="flex items-center gap-2 pt-1">
                          <strong className="text-slate-300">Final Deployed Link:</strong>
                          <input
                            type="text"
                            placeholder="Enter live client URL..."
                            defaultValue={order.final_url || ""}
                            onBlur={(e) => updateOrderStatus(order.id, { final_url: e.target.value.trim() })}
                            className="bg-brand-dark border border-brand-border rounded-lg px-2 py-1 text-xs text-brand-gold outline-none focus:border-brand-gold max-w-xs"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 border-t lg:border-t-0 pt-3 lg:pt-0 border-brand-border">
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 block">Total</span>
                        <span className="text-sm font-bold text-brand-gold font-mono">₹{order.price}</span>
                      </div>

                      <button
                        onClick={() => updateOrderStatus(order.id, { advance_paid: !order.advance_paid })}
                        className={`px-3 py-1.5 rounded-xl text-xs font-mono transition border cursor-pointer ${
                          order.advance_paid
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                            : "bg-rose-500/10 text-rose-400 border-rose-500/30"
                        }`}
                      >
                        {order.advance_paid ? "✓ 50% Paid" : "✕ Advance Pending"}
                      </button>

                      <select
                        value={order.status}
                        onChange={(e) => updateOrderStatus(order.id, { status: e.target.value })}
                        className="bg-brand-dark border border-brand-border rounded-xl px-3 py-1.5 text-xs text-white outline-none focus:border-brand-gold"
                      >
                        <option value="Pending">Pending</option>
                        <option value="Building">Building</option>
                        <option value="Completed">Completed</option>
                        <option value="Delivered">Delivered</option>
                      </select>

                      <a
                        href={`https://wa.me/${order.client_phone || "9112114603"}?text=Hi%20${encodeURIComponent(
                          order.client_name
                        )},%20regarding%20your%20order%20for%20${encodeURIComponent(
                          order.templates?.title || "PixelsSurprise"
                        )}...`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 rounded-xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-600/30 transition"
                        title="Chat on WhatsApp"
                      >
                        <Send size={14} />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}