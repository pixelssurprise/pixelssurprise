"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { checkIsAdmin } from "@/lib/adminConfig";

interface Template {
  id: string;
  title: string;
  category: string;
  price: number;
  preview_url: string;
  thumbnail_url: string;
  description: string;
  created_at?: string;
}

interface Order {
  id: string;
  created_at: string;
  tracking_number: string;
  customer_name: string;
  customer_phone: string;
  user_email: string | null;
  order_type: string;
  items: any;
  total_amount: number;
  payment_status: string;
  delivery_status: string;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"orders" | "templates">("orders");

  // Orders State
  const [orders, setOrders] = useState<Order[]>([]);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);

  // Templates State
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isEditingTemplate, setIsEditingTemplate] = useState(false);
  const [templateForm, setTemplateForm] = useState<Partial<Template>>({
    title: "",
    category: "Birthday",
    price: 0,
    preview_url: "",
    thumbnail_url: "",
    description: "",
  });

  useEffect(() => {
    async function verifyAndLoad() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user || !checkIsAdmin(session.user.email)) {
        router.replace("/auth");
        return;
      }

      await Promise.all([fetchOrders(), fetchTemplates()]);
      setLoading(false);
    }

    verifyAndLoad();
  }, [router]);

  const fetchOrders = async () => {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) setOrders(data);
  };

  const fetchTemplates = async () => {
    const { data, error } = await supabase
      .from("templates")
      .select("*")
      .order("id", { ascending: false });
    if (!error && data) setTemplates(data);
  };

  // --- Template Handlers ---
  const handleSaveTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditingTemplate && templateForm.id) {
      const { error } = await supabase
        .from("templates")
        .update({
          title: templateForm.title,
          category: templateForm.category,
          price: Number(templateForm.price),
          preview_url: templateForm.preview_url,
          thumbnail_url: templateForm.thumbnail_url,
          description: templateForm.description,
        })
        .eq("id", templateForm.id);

      if (error) alert("Error updating template: " + error.message);
    } else {
      const { error } = await supabase.from("templates").insert([
        {
          title: templateForm.title,
          category: templateForm.category,
          price: Number(templateForm.price),
          preview_url: templateForm.preview_url,
          thumbnail_url: templateForm.thumbnail_url,
          description: templateForm.description,
        },
      ]);

      if (error) alert("Error adding template: " + error.message);
    }

    resetTemplateForm();
    await fetchTemplates();
  };

  const handleEditTemplate = (tmpl: Template) => {
    setTemplateForm(tmpl);
    setIsEditingTemplate(true);
  };

  const handleDeleteTemplate = async (id: string) => {
    if (!confirm("Are you sure you want to delete this template?")) return;
    const { error } = await supabase.from("templates").delete().eq("id", id);
    if (!error) {
      setTemplates((prev) => prev.filter((t) => t.id !== id));
      if (templateForm.id === id) resetTemplateForm();
    } else {
      alert("Error deleting: " + error.message);
    }
  };

  const resetTemplateForm = () => {
    setTemplateForm({
      title: "",
      category: "Birthday",
      price: 0,
      preview_url: "",
      thumbnail_url: "",
      description: "",
    });
    setIsEditingTemplate(false);
  };

  // --- Order Handlers ---
  const handleUpdateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOrder) return;

    const { error } = await supabase
      .from("orders")
      .update({
        customer_name: editingOrder.customer_name,
        customer_phone: editingOrder.customer_phone,
        total_amount: Number(editingOrder.total_amount),
        payment_status: editingOrder.payment_status,
        delivery_status: editingOrder.delivery_status,
      })
      .eq("id", editingOrder.id);

    if (!error) {
      setOrders((prev) =>
        prev.map((o) => (o.id === editingOrder.id ? editingOrder : o))
      );
      setEditingOrder(null);
    } else {
      alert("Error updating order: " + error.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center text-stone-400">
        Authenticating Admin Console...
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-[#25181b] pb-6">
        <div>
          <h1 className="text-3xl font-serif text-white">Admin's Dashboard</h1>
          <p className="text-stone-400 text-sm mt-1">
            Overview & Orders: manage live website templates, custom bookings, and customer orders.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab("orders")}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition cursor-pointer ${
              activeTab === "orders"
                ? "bg-rose-500 text-white shadow-lg shadow-rose-950/40"
                : "bg-[#180f12] text-stone-400 border border-[#382328] hover:text-white"
            }`}
          >
            Orders & Bookings ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab("templates")}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition cursor-pointer ${
              activeTab === "templates"
                ? "bg-rose-500 text-white shadow-lg shadow-rose-950/40"
                : "bg-[#180f12] text-stone-400 border border-[#382328] hover:text-white"
            }`}
          >
            Demo Websites ({templates.length})
          </button>
        </div>
      </div>

      {/* ================= TAB 1: ORDERS (HORIZONTAL VIEW) ================= */}
      {activeTab === "orders" && (
        <div className="space-y-6">
          {/* Revenue & Fulfillment Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-[#140b0d] border border-[#2b181c]">
              <span className="text-xs uppercase tracking-widest text-stone-500 font-semibold">Total Revenue</span>
              <p className="text-3xl font-serif text-rose-300 mt-2">
                ₹{orders.reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0).toLocaleString()}
              </p>
            </div>
            <div className="p-6 rounded-2xl bg-[#140b0d] border border-[#2b181c]">
              <span className="text-xs uppercase tracking-widest text-stone-500 font-semibold">Pending Fulfillment</span>
              <p className="text-3xl font-serif text-amber-300 mt-2">
                {orders.filter((o) => o.delivery_status !== "delivered" && o.delivery_status !== "cancelled").length}
              </p>
            </div>
            <div className="p-6 rounded-2xl bg-[#140b0d] border border-[#2b181c]">
              <span className="text-xs uppercase tracking-widest text-stone-500 font-semibold">Delivered</span>
              <p className="text-3xl font-serif text-emerald-400 mt-2">
                {orders.filter((o) => o.delivery_status === "delivered").length}
              </p>
            </div>
          </div>

          {/* Edit Order Modal / Bar */}
          {editingOrder && (
            <div className="p-6 bg-[#160d0f] border border-rose-500/40 rounded-2xl space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-base font-serif text-rose-200">
                  Editing Order: <span className="font-mono">{editingOrder.tracking_number}</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setEditingOrder(null)}
                  className="text-stone-400 hover:text-white text-xs uppercase cursor-pointer"
                >
                  ✕ Close
                </button>
              </div>

              <form onSubmit={handleUpdateOrder} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 text-xs">
                <div>
                  <label className="block text-stone-400 mb-1">Customer Name</label>
                  <input
                    type="text"
                    value={editingOrder.customer_name}
                    onChange={(e) => setEditingOrder({ ...editingOrder, customer_name: e.target.value })}
                    className="w-full bg-[#0c0708] border border-[#382328] rounded-lg px-3 py-2 text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-stone-400 mb-1">Customer Phone</label>
                  <input
                    type="text"
                    value={editingOrder.customer_phone}
                    onChange={(e) => setEditingOrder({ ...editingOrder, customer_phone: e.target.value })}
                    className="w-full bg-[#0c0708] border border-[#382328] rounded-lg px-3 py-2 text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-stone-400 mb-1">Amount (₹)</label>
                  <input
                    type="number"
                    value={editingOrder.total_amount}
                    onChange={(e) => setEditingOrder({ ...editingOrder, total_amount: Number(e.target.value) })}
                    className="w-full bg-[#0c0708] border border-[#382328] rounded-lg px-3 py-2 text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-stone-400 mb-1">Payment Status</label>
                  <select
                    value={editingOrder.payment_status}
                    onChange={(e) => setEditingOrder({ ...editingOrder, payment_status: e.target.value })}
                    className="w-full bg-[#0c0708] border border-[#382328] rounded-lg px-3 py-2 text-white"
                  >
                    <option value="pending">Pending</option>
                    <option value="paid">Paid</option>
                    <option value="failed">Failed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-stone-400 mb-1">Delivery Status</label>
                  <select
                    value={editingOrder.delivery_status}
                    onChange={(e) => setEditingOrder({ ...editingOrder, delivery_status: e.target.value })}
                    className="w-full bg-[#0c0708] border border-[#382328] rounded-lg px-3 py-2 text-white"
                  >
                    <option value="processing">Processing</option>
                    <option value="in_progress">In Progress</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <div className="md:col-span-5 flex justify-end gap-3 mt-2">
                  <button
                    type="button"
                    onClick={() => setEditingOrder(null)}
                    className="px-4 py-2 rounded-lg bg-[#25181b] text-stone-300 text-xs font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 rounded-lg bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs uppercase tracking-wider cursor-pointer"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Horizontal Orders List */}
          <div className="space-y-4">
            {orders.length === 0 ? (
              <div className="p-12 text-center text-stone-500 bg-[#140b0d] border border-[#2b181c] rounded-2xl text-sm">
                No customer orders received yet.
              </div>
            ) : (
              orders.map((order) => (
                <div
                  key={order.id}
                  className="p-5 bg-[#140b0d] border border-[#2b181c] rounded-2xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5 hover:border-[#3d242a] transition"
                >
                  <div className="min-w-[160px]">
                    <span className="font-mono text-xs font-bold text-rose-300 bg-rose-500/10 px-2.5 py-1 rounded border border-rose-500/20 block w-fit">
                      {order.tracking_number}
                    </span>
                    <span className="text-[11px] text-stone-500 block mt-2">
                      {new Date(order.created_at).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>

                  <div className="min-w-[200px]">
                    <h4 className="text-white font-semibold text-sm">{order.customer_name}</h4>
                    <a
                      href={`https://wa.me/${order.customer_phone.replace(/\D/g, "")}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-emerald-400 hover:underline block mt-0.5"
                    >
                      WhatsApp: {order.customer_phone}
                    </a>
                    {order.user_email && (
                      <span className="text-xs text-stone-500 block truncate max-w-[220px]">
                        {order.user_email}
                      </span>
                    )}
                  </div>

                  <div className="flex-1 max-w-xl">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-rose-300 block mb-1">
                      {order.order_type}
                    </span>
                    <div className="bg-[#0c0708] border border-[#25181b] rounded-lg p-2.5 text-xs text-stone-400 max-h-20 overflow-y-auto font-mono">
                      {typeof order.items === "string" ? order.items : JSON.stringify(order.items, null, 2)}
                    </div>
                  </div>

                  <div className="min-w-[130px] flex flex-col gap-1">
                    <span className="text-white font-semibold text-base">₹{order.total_amount}</span>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider ${
                        order.payment_status === "paid" ? "text-emerald-400" : "text-amber-400"
                      }`}
                    >
                      Pay: {order.payment_status}
                    </span>
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider w-fit mt-1 ${
                        order.delivery_status === "delivered"
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                          : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                      }`}
                    >
                      {order.delivery_status}
                    </span>
                  </div>

                  <div>
                    <button
                      onClick={() => setEditingOrder(order)}
                      className="px-4 py-2 rounded-xl bg-[#221316] hover:bg-rose-500 text-stone-300 hover:text-white text-xs font-semibold border border-[#382328] hover:border-rose-500 transition cursor-pointer"
                    >
                      Edit Order
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ================= TAB 2: DEMO WEBSITES (SIDE-BY-SIDE SPLIT) ================= */}
      {activeTab === "templates" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT SIDE (VERTICAL FORM): Takes 5 Columns */}
          <div className="lg:col-span-5 bg-[#140b0d] border border-[#2b181c] rounded-2xl p-6 sticky top-28">
            <div className="flex justify-between items-center mb-5 pb-3 border-b border-[#25181b]">
              <div>
                <h3 className="text-lg font-serif text-white">
                  {isEditingTemplate ? "Edit Demo Template" : "Add Demo Template"}
                </h3>
                <p className="text-[11px] text-stone-400">Fill details vertically to update portfolio</p>
              </div>
              {isEditingTemplate && (
                <button
                  type="button"
                  onClick={resetTemplateForm}
                  className="text-stone-400 hover:text-white text-xs uppercase cursor-pointer"
                >
                  ✕ Cancel
                </button>
              )}
            </div>

            <form onSubmit={handleSaveTemplate} className="space-y-4 text-xs">
              <div>
                <label className="block text-stone-400 mb-1 font-medium">Template Title</label>
                <input
                  type="text"
                  placeholder="e.g. Royal Wedding Arcade"
                  value={templateForm.title || ""}
                  onChange={(e) => setTemplateForm({ ...templateForm, title: e.target.value })}
                  className="w-full bg-[#0c0708] border border-[#382328] rounded-xl px-3.5 py-2.5 text-white placeholder-stone-600 focus:outline-none focus:border-rose-400"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-400 mb-1 font-medium">Category</label>
                  <select
                    value={templateForm.category || "Birthday"}
                    onChange={(e) => setTemplateForm({ ...templateForm, category: e.target.value })}
                    className="w-full bg-[#0c0708] border border-[#382328] rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-rose-400"
                  >
                    <option value="Birthday">Birthday</option>
                    <option value="Love Story / Anniversary">Love Story</option>
                    <option value="Interactive Proposal">Proposal</option>
                    <option value="Wedding Invitation">Wedding</option>
                    <option value="Bappa Agman / Puja">Festival / Puja</option>
                    <option value="Apology Keepsake">Apology</option>
                  </select>
                </div>

                <div>
                  <label className="block text-stone-400 mb-1 font-medium">Price (₹)</label>
                  <input
                    type="number"
                    placeholder="499"
                    value={templateForm.price || 0}
                    onChange={(e) => setTemplateForm({ ...templateForm, price: Number(e.target.value) })}
                    className="w-full bg-[#0c0708] border border-[#382328] rounded-xl px-3.5 py-2.5 text-white placeholder-stone-600 focus:outline-none focus:border-rose-400"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-stone-400 mb-1 font-medium">Live Preview URL</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={templateForm.preview_url || ""}
                  onChange={(e) => setTemplateForm({ ...templateForm, preview_url: e.target.value })}
                  className="w-full bg-[#0c0708] border border-[#382328] rounded-xl px-3.5 py-2.5 text-white placeholder-stone-600 focus:outline-none focus:border-rose-400"
                  required
                />
              </div>

              <div>
                <label className="block text-stone-400 mb-1 font-medium">Thumbnail Image URL</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={templateForm.thumbnail_url || ""}
                  onChange={(e) => setTemplateForm({ ...templateForm, thumbnail_url: e.target.value })}
                  className="w-full bg-[#0c0708] border border-[#382328] rounded-xl px-3.5 py-2.5 text-white placeholder-stone-600 focus:outline-none focus:border-rose-400"
                  required
                />
              </div>

              <div>
                <label className="block text-stone-400 mb-1 font-medium">Short Description</label>
                <textarea
                  rows={3}
                  placeholder="Unlockable envelopes, photo milestones, background music..."
                  value={templateForm.description || ""}
                  onChange={(e) => setTemplateForm({ ...templateForm, description: e.target.value })}
                  className="w-full bg-[#0c0708] border border-[#382328] rounded-xl px-3.5 py-2 text-white placeholder-stone-600 focus:outline-none focus:border-rose-400 resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-rose-200 via-rose-300 to-rose-400 text-stone-900 font-bold uppercase tracking-wider text-xs hover:opacity-95 transition shadow-md shadow-rose-950/40 cursor-pointer"
              >
                {isEditingTemplate ? "Update Template" : "+ Add Demo Template"}
              </button>
            </form>
          </div>

          {/* RIGHT SIDE (VERTICAL SAMPLES LIST): Takes 7 Columns */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-[#25181b]">
              <h3 className="text-base font-serif text-white">
                Live Demos ({templates.length})
              </h3>
              <span className="text-xs text-stone-500">Listed chronologically</span>
            </div>

            {templates.length === 0 ? (
              <div className="p-12 text-center text-stone-500 bg-[#140b0d] border border-[#2b181c] rounded-2xl text-sm">
                No templates created yet. Use the left form to add your first demo website.
              </div>
            ) : (
              templates.map((tmpl) => (
                <div
                  key={tmpl.id}
                  className="p-4 bg-[#140b0d] border border-[#2b181c] rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-[#3d242a] transition"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-20 h-16 rounded-xl overflow-hidden bg-[#0c0708] border border-[#2b181c] shrink-0">
                      {tmpl.thumbnail_url ? (
                        <img
                          src={tmpl.thumbnail_url}
                          alt={tmpl.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-stone-600 text-[10px]">
                          No Image
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-serif text-white font-medium text-sm">{tmpl.title}</h4>
                        <span className="text-xs text-rose-300 font-semibold font-mono">₹{tmpl.price}</span>
                      </div>
                      <span className="inline-block mt-0.5 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-rose-500/10 text-rose-300 border border-rose-500/20">
                        {tmpl.category}
                      </span>
                      <p className="text-[11px] text-stone-400 mt-1 line-clamp-1 leading-relaxed">
                        {tmpl.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 sm:self-center">
                    <a
                      href={tmpl.preview_url}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 rounded-lg bg-[#1a0e10] hover:bg-[#25181b] text-rose-300 hover:text-white text-xs transition border border-[#382328]"
                    >
                      Demo ↗
                    </a>
                    <button
                      onClick={() => handleEditTemplate(tmpl)}
                      className="px-3 py-1.5 rounded-lg bg-[#25181b] hover:bg-rose-500 text-stone-300 hover:text-white text-xs font-semibold transition cursor-pointer"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteTemplate(tmpl.id)}
                      className="px-3 py-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-400 border border-red-900/30 text-xs font-semibold transition cursor-pointer"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}