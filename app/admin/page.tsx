"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { checkIsAdmin } from "@/lib/adminConfig";
import { Trash2, Plus, Edit3, ShoppingBag, Layers, Settings } from "lucide-react";

interface TemplateField {
  label: string;
  fieldType: "text" | "url" | "textarea" | "date";
  required: boolean;
}

interface Template {
  id: string;
  title: string;
  category: string;
  price: number;
  preview_url: string;
  thumbnail_url: string;
  description: string;
  custom_fields?: TemplateField[];
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

interface BookOption {
  id: string;
  option_type: string;
  label: string;
  price_extra: number;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"orders" | "templates" | "bookOptions">("orders");

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
    custom_fields: [
      { label: "Recipient Name", fieldType: "text", required: true },
      { label: "Google Drive Photos Link", fieldType: "url", required: true },
    ],
  });

  // Book Page Options State (Categories, Games, Modules)
  const [bookOptions, setBookOptions] = useState<BookOption[]>([]);
  const [newOptType, setNewOptType] = useState("game");
  const [newOptLabel, setNewOptLabel] = useState("");
  const [newOptPrice, setNewOptPrice] = useState(0);

  useEffect(() => {
    async function verifyAndLoad() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user || !checkIsAdmin(session.user.email)) {
        router.replace("/auth");
        return;
      }

      await Promise.all([fetchOrders(), fetchTemplates(), fetchBookOptions()]);
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

  const fetchBookOptions = async () => {
    const { data, error } = await supabase
      .from("book_form_options")
      .select("*")
      .order("created_at", { ascending: true });
    if (!error && data) setBookOptions(data);
  };

  // --- Dynamic Form Fields Handlers for Templates ---
  const addTemplateField = () => {
    const fields = templateForm.custom_fields || [];
    setTemplateForm({
      ...templateForm,
      custom_fields: [...fields, { label: "", fieldType: "text", required: false }],
    });
  };

  const updateTemplateField = (index: number, key: keyof TemplateField, val: any) => {
    const fields = [...(templateForm.custom_fields || [])];
    fields[index] = { ...fields[index], [key]: val };
    setTemplateForm({ ...templateForm, custom_fields: fields });
  };

  const removeTemplateField = (index: number) => {
    const fields = (templateForm.custom_fields || []).filter((_, i) => i !== index);
    setTemplateForm({ ...templateForm, custom_fields: fields });
  };

  // --- Template Handlers ---
  const handleSaveTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      title: templateForm.title,
      category: templateForm.category,
      price: Number(templateForm.price),
      preview_url: templateForm.preview_url,
      thumbnail_url: templateForm.thumbnail_url,
      description: templateForm.description,
      custom_fields: templateForm.custom_fields || [],
    };

    if (isEditingTemplate && templateForm.id) {
      const { error } = await supabase
        .from("templates")
        .update(payload)
        .eq("id", templateForm.id);

      if (error) alert("Error updating template: " + error.message);
    } else {
      const { error } = await supabase.from("templates").insert([payload]);
      if (error) alert("Error adding template: " + error.message);
    }

    resetTemplateForm();
    await fetchTemplates();
  };

  const handleEditTemplate = (tmpl: Template) => {
    setTemplateForm({
      ...tmpl,
      custom_fields: tmpl.custom_fields || [
        { label: "Recipient Name", fieldType: "text", required: true },
        { label: "Google Drive Photos Link", fieldType: "url", required: true },
      ],
    });
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
      custom_fields: [
        { label: "Recipient Name", fieldType: "text", required: true },
        { label: "Google Drive Photos Link", fieldType: "url", required: true },
      ],
    });
    setIsEditingTemplate(false);
  };

  // --- Book Page Options Handlers ---
  const handleAddBookOption = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOptLabel.trim()) return;

    const { error } = await supabase.from("book_form_options").insert([{
      option_type: newOptType,
      label: newOptLabel.trim(),
      price_extra: Number(newOptPrice),
    }]);

    if (error) alert("Error: " + error.message);
    else {
      setNewOptLabel("");
      setNewOptPrice(0);
      fetchBookOptions();
    }
  };

  const handleDeleteBookOption = async (id: string) => {
    if (!confirm("Delete this option?")) return;
    const { error } = await supabase.from("book_form_options").delete().eq("id", id);
    if (!error) fetchBookOptions();
    else alert("Error deleting option: " + error.message);
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
            Manage orders, readymade templates with custom fields, and custom book form options.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setActiveTab("orders")}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === "orders"
                ? "bg-rose-500 text-white shadow-lg shadow-rose-950/40"
                : "bg-[#180f12] text-stone-400 border border-[#382328] hover:text-white"
            }`}
          >
            <ShoppingBag size={14} /> Orders ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab("templates")}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === "templates"
                ? "bg-rose-500 text-white shadow-lg shadow-rose-950/40"
                : "bg-[#180f12] text-stone-400 border border-[#382328] hover:text-white"
            }`}
          >
            <Layers size={14} /> Templates & Fields ({templates.length})
          </button>
          <button
            onClick={() => setActiveTab("bookOptions")}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === "bookOptions"
                ? "bg-rose-500 text-white shadow-lg shadow-rose-950/40"
                : "bg-[#180f12] text-stone-400 border border-[#382328] hover:text-white"
            }`}
          >
            <Settings size={14} /> Book Form Options ({bookOptions.length})
          </button>
        </div>
      </div>

      {/* ================= TAB 1: ORDERS ================= */}
      {activeTab === "orders" && (
        <div className="space-y-6">
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
                      {order.tracking_number || order.id.slice(0, 8)}
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
                    <span className="text-xs text-emerald-400 block mt-0.5">
                      Phone: {order.customer_phone}
                    </span>
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
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                      Pay: {order.payment_status}
                    </span>
                    <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider w-fit mt-1 bg-amber-500/20 text-amber-300 border border-amber-500/30">
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

      {/* ================= TAB 2: TEMPLATES & FIELDS ================= */}
      {activeTab === "templates" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-5 bg-[#140b0d] border border-[#2b181c] rounded-2xl p-6 sticky top-28">
            <div className="flex justify-between items-center mb-5 pb-3 border-b border-[#25181b]">
              <div>
                <h3 className="text-lg font-serif text-white">
                  {isEditingTemplate ? "Edit Template & Fields" : "Add Template & Fields"}
                </h3>
                <p className="text-[11px] text-stone-400">Configure template details and custom order inputs</p>
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
                <label className="block text-stone-400 mb-1 font-medium">Template Title *</label>
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
                  <label className="block text-stone-400 mb-1 font-medium">Price (₹) *</label>
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
                <label className="block text-stone-400 mb-1 font-medium">Live Preview URL *</label>
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
                <label className="block text-stone-400 mb-1 font-medium">Thumbnail Image URL *</label>
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
                  rows={2}
                  placeholder="Unlockable envelopes, photo milestones..."
                  value={templateForm.description || ""}
                  onChange={(e) => setTemplateForm({ ...templateForm, description: e.target.value })}
                  className="w-full bg-[#0c0708] border border-[#382328] rounded-xl px-3.5 py-2 text-white placeholder-stone-600 focus:outline-none focus:border-rose-400 resize-none"
                />
              </div>

              {/* DYNAMIC ORDER FORM FIELDS BUILDER */}
              <div className="p-4 rounded-xl bg-[#0c0708] border border-[#382328] space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-rose-300">Custom Order Fields Required</span>
                  <button
                    type="button"
                    onClick={addTemplateField}
                    className="px-2.5 py-1 rounded bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Plus size={12} /> Add Field
                  </button>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {(templateForm.custom_fields || []).map((field, idx) => (
                    <div key={idx} className="flex items-center gap-2 bg-[#140b0d] p-2 rounded-lg border border-[#382328]">
                      <input
                        type="text"
                        placeholder="Field Label"
                        value={field.label}
                        onChange={(e) => updateTemplateField(idx, "label", e.target.value)}
                        className="flex-1 bg-[#0c0708] border border-[#382328] rounded px-2 py-1 text-white text-[11px]"
                        required
                      />
                      <select
                        value={field.fieldType}
                        onChange={(e) => updateTemplateField(idx, "fieldType", e.target.value as any)}
                        className="bg-[#0c0708] border border-[#382328] rounded px-2 py-1 text-white text-[11px]"
                      >
                        <option value="text">Text</option>
                        <option value="url">URL</option>
                        <option value="textarea">Paragraph</option>
                        <option value="date">Date</option>
                      </select>
                      <label className="text-[10px] text-stone-400 flex items-center gap-1">
                        <input
                          type="checkbox"
                          checked={field.required}
                          onChange={(e) => updateTemplateField(idx, "required", e.target.checked)}
                          className="accent-rose-500"
                        />
                        Req
                      </label>
                      <button
                        type="button"
                        onClick={() => removeTemplateField(idx)}
                        className="text-red-400 hover:text-red-300 p-0.5"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-rose-200 via-rose-300 to-rose-400 text-stone-900 font-bold uppercase tracking-wider text-xs hover:opacity-95 transition shadow-md shadow-rose-950/40 cursor-pointer"
              >
                {isEditingTemplate ? "Update Template & Fields" : "+ Save Template"}
              </button>
            </form>
          </div>

          <div className="lg:col-span-7 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-[#25181b]">
              <h3 className="text-base font-serif text-white">
                Live Demos ({templates.length})
              </h3>
              <span className="text-xs text-stone-500">Configured with custom order fields</span>
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
                      <p className="text-[11px] text-stone-400 mt-1 font-mono">
                        Custom Fields: {tmpl.custom_fields?.length || 0} configured
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 sm:self-center">
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

      {/* ================= TAB 3: BOOK FORM MANAGER ================= */}
      {activeTab === "bookOptions" && (
        <div className="space-y-8">
          <form onSubmit={handleAddBookOption} className="bg-[#140b0d] border border-[#2b181c] rounded-3xl p-6 space-y-4">
            <h3 className="font-serif text-xl font-bold text-white">Add Option for Custom Book Page</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block text-stone-400 mb-1">Option Type</label>
                <select
                  value={newOptType}
                  onChange={(e) => setNewOptType(e.target.value)}
                  className="w-full bg-[#0c0708] border border-[#382328] rounded-xl p-3 text-white"
                >
                  <option value="game">Mini-Game</option>
                  <option value="surprise_module">Surprise Module</option>
                  <option value="invitation_module">Invitation Module</option>
                </select>
              </div>
              <div>
                <label className="block text-stone-400 mb-1">Option Label</label>
                <input
                  type="text"
                  required
                  value={newOptLabel}
                  onChange={(e) => setNewOptLabel(e.target.value)}
                  placeholder="e.g. Balloon Pop"
                  className="w-full bg-[#0c0708] border border-[#382328] rounded-xl p-3 text-white"
                />
              </div>
              <div>
                <label className="block text-stone-400 mb-1">Extra Price (₹)</label>
                <input
                  type="number"
                  value={newOptPrice}
                  onChange={(e) => setNewOptPrice(Number(e.target.value))}
                  className="w-full bg-[#0c0708] border border-[#382328] rounded-xl p-3 text-white"
                />
              </div>
            </div>
            <button
              type="submit"
              className="py-3 px-6 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs uppercase cursor-pointer transition"
            >
              Add Option
            </button>
          </form>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {bookOptions.length === 0 ? (
              <div className="col-span-3 p-12 text-center text-stone-500 bg-[#140b0d] border border-[#2b181c] rounded-2xl text-sm">
                No custom book options added yet.
              </div>
            ) : (
              bookOptions.map((opt) => (
                <div key={opt.id} className="bg-[#140b0d] border border-[#2b181c] rounded-2xl p-4 flex justify-between items-center">
                  <div>
                    <span className="text-[9px] font-mono text-rose-300 uppercase block">{opt.option_type}</span>
                    <h4 className="text-xs font-bold text-white mt-0.5">{opt.label}</h4>
                    {opt.price_extra > 0 && <span className="text-[10px] text-amber-300 font-mono">+₹{opt.price_extra}</span>}
                  </div>
                  <button
                    onClick={() => handleDeleteBookOption(opt.id)}
                    className="text-red-400 hover:text-red-300 p-1 cursor-pointer"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}