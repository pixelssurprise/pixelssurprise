"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { checkIsAdmin } from "@/lib/adminConfig";
import { Trash2, Plus, Edit3, ShoppingBag, Layers, Settings, DollarSign, Upload, Loader2 } from "lucide-react";

interface TemplateField {
  label: string;
  fieldType: "text" | "url" | "textarea" | "date";
  required: boolean;
}

interface Template {
  id?: string;
  title: string;
  category: string;
  price: number;
  demo_url: string; // Corrected to match database column name
  thumbnail_url: string;
  description: string;
  custom_fields?: TemplateField[];
}

interface Order {
  id: string;
  user_id: string;
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
  referral_code_used?: string;
}

interface PayoutRequest {
  id: string;
  referrer_name: string;
  phone_number: string;
  amount: number;
  status: string;
  created_at: string;
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
  const [activeTab, setActiveTab] = useState<"orders" | "payouts" | "templates" | "bookOptions">("orders");

  // Orders State
  const [orders, setOrders] = useState<Order[]>([]);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);

  // Payouts State
  const [payouts, setPayouts] = useState<PayoutRequest[]>([]);

  // Templates State
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isEditingTemplate, setIsEditingTemplate] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [templateForm, setTemplateForm] = useState<Partial<Template>>({
    title: "",
    category: "Birthday",
    price: 0,
    demo_url: "",
    thumbnail_url: "",
    description: "",
    custom_fields: [
      { label: "Recipient Name", fieldType: "text", required: true },
      { label: "Google Drive Photos Link", fieldType: "url", required: true },
    ],
  });

  // Book Page Options State
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

      await Promise.all([fetchOrders(), fetchTemplates(), fetchBookOptions(), fetchPayouts()]);
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

  const fetchPayouts = async () => {
    const { data, error } = await supabase
      .from("payout_requests")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) setPayouts(data);
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

  // --- Thumbnail File Upload Handler ---
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("File size must be less than 2MB.");
      return;
    }

    setUploadingImage(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("template-thumbnails")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from("template-thumbnails")
        .getPublicUrl(filePath);

      setTemplateForm({ ...templateForm, thumbnail_url: publicUrlData.publicUrl });
    } catch (err: any) {
      alert("Error uploading image: " + err.message);
    } finally {
      setUploadingImage(false);
    }
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
    if (!templateForm.thumbnail_url) {
      alert("Please upload a thumbnail image.");
      return;
    }

    const payload = {
      title: templateForm.title,
      category: templateForm.category,
      price: Number(templateForm.price),
      demo_url: templateForm.demo_url, // Matches database column name
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
      id: tmpl.id,
      title: tmpl.title,
      category: tmpl.category,
      price: tmpl.price,
      demo_url: tmpl.demo_url || "", // Correctly map demo_url from database row
      thumbnail_url: tmpl.thumbnail_url,
      description: tmpl.description,
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
      demo_url: "",
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

  // --- AUTOMATED ORDER UPDATE WITH STRICT LOYALTY & REFERRAL LOGIC ---
  const handleUpdateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOrder) return;

    const isNowCompleted = editingOrder.delivery_status === "delivered" || editingOrder.delivery_status === "completed";

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

    if (error) {
      alert("Error updating order: " + error.message);
      return;
    }

    if (isNowCompleted && editingOrder.user_id) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("completed_orders, full_name, phone")
        .eq("id", editingOrder.user_id)
        .single();

      if (profile) {
        let currentCount = profile.completed_orders || 0;
        let milestoneReached = false;

        if (currentCount === 3) {
          currentCount = 0;
          milestoneReached = true;
        } else if (currentCount < 3) {
          currentCount += 1;
        }

        await supabase
          .from("profiles")
          .update({ completed_orders: currentCount })
          .eq("id", editingOrder.user_id);

        if (milestoneReached && profile.phone) {
          const msg = encodeURIComponent(`Hi ${profile.full_name}, congratulations! 🎉 Your 4th free website has been successfully delivered and completed. Your loyalty counter has been reset for your next streak!`);
          window.open(`https://wa.me/91${profile.phone}?text=${msg}`, "_blank");
        } else if (currentCount === 3 && profile.phone) {
          const msg = encodeURIComponent(`Hi ${profile.full_name}, amazing news! ✨ You have completed 3 orders. Your 4th custom website checkout is now 100% FREE!`);
          window.open(`https://wa.me/91${profile.phone}?text=${msg}`, "_blank");
        }
      }

      if (editingOrder.referral_code_used) {
        const { data: referrer } = await supabase
          .from("profiles")
          .select("id, phone, full_name")
          .eq("referral_code", editingOrder.referral_code_used)
          .single();

        if (referrer && referrer.phone) {
          const cashReward = Math.round(Number(editingOrder.total_amount) * 0.10);

          const { data: newPayout } = await supabase.from("payout_requests").insert([{
            referrer_id: referrer.id,
            referrer_name: referrer.full_name,
            phone_number: referrer.phone,
            amount: cashReward,
            status: "pending_transfer",
            created_at: new Date().toISOString()
          }]).select().single();

          // Automatically send WhatsApp notification to admin (9112114603) for the pending payout
          const adminPhone = "919112114603";
          const adminMsg = encodeURIComponent(
            `🔔 *New Pending Payout Request*\n\n` +
            `*Referrer:* ${referrer.full_name}\n` +
            `*PhonePe/UPI:* ${referrer.phone}\n` +
            `*Amount:* ₹${cashReward}\n\n` +
            `Please proceed with the transfer.`
          );
          window.open(`https://wa.me/${adminPhone}?text=${adminMsg}`, "_blank");
        }
      }
    }

    setOrders((prev) =>
      prev.map((o) => (o.id === editingOrder.id ? editingOrder : o))
    );
    setEditingOrder(null);
    await fetchPayouts();
    alert("Order updated successfully!");
  };

  const handleMarkPayoutPaid = async (payout: PayoutRequest) => {
    const { error } = await supabase
      .from("payout_requests")
      .update({ status: "paid" })
      .eq("id", payout.id);

    if (!error) {
      const msg = encodeURIComponent(`Hi ${payout.referrer_name}, your 10% referral cash reward of ₹${payout.amount} has been successfully sent to your PhonePe / UPI number (${payout.phone_number})! 💸 Thank you for partnering with PixelsSurprise.`);
      window.open(`https://wa.me/91${payout.phone_number}?text=${msg}`, "_blank");

      await fetchPayouts();
    } else {
      alert("Error updating payout status: " + error.message);
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
            className={`px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === "orders" ? "bg-rose-500 text-white shadow-lg" : "bg-[#180f12] text-stone-400 border border-[#382328]"
            }`}
          >
            <ShoppingBag size={14} /> Orders ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab("payouts")}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === "payouts" ? "bg-rose-500 text-white shadow-lg" : "bg-[#180f12] text-stone-400 border border-[#382328]"
            }`}
          >
            <DollarSign size={14} /> Payouts ({payouts.filter(p => p.status === 'pending_transfer').length})
          </button>
          <button
            onClick={() => setActiveTab("templates")}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === "templates" ? "bg-rose-500 text-white shadow-lg" : "bg-[#180f12] text-stone-400 border border-[#382328]"
            }`}
          >
            <Layers size={14} /> Templates & Fields ({templates.length})
          </button>
          <button
            onClick={() => setActiveTab("bookOptions")}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === "bookOptions" ? "bg-rose-500 text-white shadow-lg" : "bg-[#180f12] text-stone-400 border border-[#382328]"
            }`}
          >
            <Settings size={14} /> Book Options ({bookOptions.length})
          </button>
        </div>
      </div>

      {/* ================= TAB 1: ORDERS ================= */}
      {activeTab === "orders" && (
        <div className="space-y-6">
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
                    <option value="delivered">Delivered (Triggers Loyalty/Referral)</option>
                    <option value="completed">Completed (Triggers Loyalty/Referral)</option>
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
                  className="p-5 bg-[#140b0d] border border-[#2b181c] rounded-2xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5"
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
                    <span className="text-xs text-emerald-400 block mt-0.5">Phone: {order.customer_phone}</span>
                    {order.referral_code_used && (
                      <span className="text-[10px] font-mono text-amber-300 block mt-1">
                        Ref Used: {order.referral_code_used}
                      </span>
                    )}
                  </div>

                  <div className="min-w-[130px] flex flex-col gap-1">
                    <span className="text-white font-semibold text-base">₹{order.total_amount}</span>
                    <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider w-fit bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      {order.delivery_status}
                    </span>
                  </div>

                  <div>
                    <button
                      onClick={() => setEditingOrder(order)}
                      className="px-4 py-2 rounded-xl bg-[#221316] hover:bg-rose-500 text-stone-300 hover:text-white text-xs font-semibold border border-[#382328] transition cursor-pointer"
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

      {/* ================= TAB 2: REFERRAL PAYOUTS ================= */}
      {activeTab === "payouts" && (
        <div className="space-y-6">
          <div className="bg-[#140b0d] border border-[#2b181c] rounded-3xl p-6 space-y-4">
            <h3 className="font-serif text-xl font-bold text-white">Pending PhonePe / UPI Payout Requests</h3>
            <p className="text-xs text-stone-400">
              When you change a payout status to <span className="text-emerald-400 font-bold">Paid</span> after transferring money via PhonePe, a WhatsApp notification will automatically open to notify the referrer.
            </p>

            {payouts.length === 0 ? (
              <div className="p-12 text-center text-stone-500 text-sm">No payout requests pending.</div>
            ) : (
              <div className="divide-y divide-[#2b181c]">
                {payouts.map((payout) => (
                  <div key={payout.id} className="py-4 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                    <div>
                      <h4 className="font-bold text-sm text-white">{payout.referrer_name}</h4>
                      <p className="text-xs text-emerald-400 font-mono mt-0.5">PhonePe / UPI: {payout.phone_number}</p>
                      <span className="text-[10px] text-stone-500 block">Requested on: {new Date(payout.created_at).toLocaleDateString()}</span>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className="font-serif text-lg font-bold text-brand-goldLight">₹{payout.amount}</span>
                      {payout.status === "paid" ? (
                        <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/30">
                          Paid ✓
                        </span>
                      ) : (
                        <button
                          onClick={() => handleMarkPayoutPaid(payout)}
                          className="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold uppercase tracking-wider transition cursor-pointer shadow-lg"
                        >
                          Mark Paid & Send WhatsApp
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= TAB 3: TEMPLATES & MEDIA UPLOAD ================= */}
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
                  className="w-full bg-[#0c0708] border border-[#382328] rounded-xl px-3.5 py-2.5 text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-400 mb-1 font-medium">Category</label>
                  <select
                    value={templateForm.category || "Birthday"}
                    onChange={(e) => setTemplateForm({ ...templateForm, category: e.target.value })}
                    className="w-full bg-[#0c0708] border border-[#382328] rounded-xl px-3 py-2.5 text-white"
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
                    className="w-full bg-[#0c0708] border border-[#382328] rounded-xl px-3.5 py-2.5 text-white"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-stone-400 mb-1 font-medium">Live Preview URL *</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={templateForm.demo_url || ""}
                  onChange={(e) => setTemplateForm({ ...templateForm, demo_url: e.target.value })}
                  className="w-full bg-[#0c0708] border border-[#382328] rounded-xl px-3.5 py-2.5 text-white"
                  required
                />
              </div>

              {/* THUMBNAIL MEDIA UPLOAD FIELD */}
              <div>
                <label className="block text-stone-400 mb-1 font-medium">Thumbnail Image Upload *</label>
                <div className="flex items-center gap-3">
                  <label className="flex-1 flex items-center justify-center gap-2 bg-[#0c0708] border border-[#382328] rounded-xl px-3.5 py-3 text-stone-300 hover:text-white cursor-pointer hover:border-rose-400 transition">
                    <Upload size={14} />
                    <span>{uploadingImage ? "Uploading..." : "Choose Image File"}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      disabled={uploadingImage}
                    />
                  </label>
                  {uploadingImage && <Loader2 size={16} className="animate-spin text-rose-400" />}
                </div>
                {templateForm.thumbnail_url && (
                  <div className="mt-2 flex items-center gap-3 bg-[#0c0708] p-2 rounded-xl border border-[#382328]">
                    <img src={templateForm.thumbnail_url} alt="Thumbnail Preview" className="w-12 h-10 object-cover rounded-lg" />
                    <span className="text-[10px] text-emerald-400 truncate max-w-[220px]">{templateForm.thumbnail_url}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-stone-400 mb-1 font-medium">Short Description</label>
                <textarea
                  rows={2}
                  placeholder="Unlockable envelopes, photo milestones..."
                  value={templateForm.description || ""}
                  onChange={(e) => setTemplateForm({ ...templateForm, description: e.target.value })}
                  className="w-full bg-[#0c0708] border border-[#382328] rounded-xl px-3.5 py-2 text-white resize-none"
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
                      onClick={() => handleDeleteTemplate(tmpl.id!)}
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

      {/* ================= TAB 4: BOOK OPTIONS ================= */}
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