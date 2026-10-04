"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { checkIsAdmin } from "@/lib/adminConfig";
import { Trash2, Plus, Edit3, ShoppingBag, Layers, Settings, DollarSign, Upload, Loader2, AlertCircle, CheckCircle, MessageSquare } from "lucide-react";

interface TemplateField {
  label: string;
  fieldType: "text" | "number" | "url" | "textarea" | "date";
  required: boolean;
}

interface Template {
  id?: string;
  title: string;
  category: string;       // "Surprise" or "Invitation"
  sub_category: string;   // Specific occasion
  price: number;
  demo_url: string;
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
  advance_paid: number;
  balance_due: number;
  payment_status: string;
  delivery_status: string;
  live_website_url?: string;
  referral_code_used?: string;
}

interface PayoutRequest {
  id: string;
  referrer_id: string;
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

// Comprehensive sub-categories based on user specifications
const SURPRISE_SUB_CATEGORIES = [
  "Birthday",
  "Anniversary",
  "Friendship Day",
  "Proposal",
  "Apology",
  "Father's Day",
  "Mother's Day",
  "Valentine's Special",
  "Long Distance Love",
  "Retirement Surprise"
];

const INVITATION_SUB_CATEGORIES = [
  "Wedding Invitation",
  "Bappa Aagman Invitation",
  "Birthday Invitation",
  "New Home Puja / Griha Pravesh",
  "Business Opening & Inauguration",
  "Baby Shower / Namakaran",
  "Anniversary Celebration",
  "Engagement Ceremony",
  "Festive Celebration"
];

export default function AdminDashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"orders" | "payouts" | "templates" | "bookOptions">("orders");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [orders, setOrders] = useState<Order[]>([]);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);

  const [payouts, setPayouts] = useState<PayoutRequest[]>([]);

  const [templates, setTemplates] = useState<Template[]>([]);
  const [isEditingTemplate, setIsEditingTemplate] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [templateForm, setTemplateForm] = useState<Partial<Template>>({
    title: "",
    category: "Surprise",
    sub_category: "Birthday",
    price: 499,
    demo_url: "",
    thumbnail_url: "",
    description: "",
    custom_fields: [
      { label: "Recipient Name", fieldType: "text", required: true },
      { label: "Google Drive Photos Link", fieldType: "url", required: true },
    ],
  });

  const [bookOptions, setBookOptions] = useState<BookOption[]>([]);
  const [newOptType, setNewOptType] = useState("game");
  const [newOptLabel, setNewOptLabel] = useState("");
  const [newOptPrice, setNewOptPrice] = useState(0);

  useEffect(() => {
    async function verifyAndLoad() {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.user || !checkIsAdmin(session.user.email)) {
        router.replace("/auth");
        return;
      }

      await Promise.all([
        fetchOrders(),
        fetchTemplates(),
        fetchBookOptions(),
        fetchPayouts()
      ]);
      setLoading(false);
    }

    verifyAndLoad();
  }, [router]);

  const fetchOrders = async () => {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) console.error("Error fetching orders:", error.message);
    else setOrders(data || []);
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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMessage("");
    if (file.size > 2 * 1024 * 1024) {
      setErrorMessage("Thumbnail image size must be less than 2MB.");
      return;
    }

    setUploadingImage(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("template-thumbnails")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from("template-thumbnails")
        .getPublicUrl(filePath);

      setTemplateForm({ ...templateForm, thumbnail_url: publicUrlData.publicUrl });
      setSuccessMessage("Thumbnail uploaded!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err: any) {
      setErrorMessage("Error uploading image: " + err.message);
    } finally {
      setUploadingImage(false);
    }
  };

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

  const handleSaveTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!templateForm.title?.trim() || !templateForm.price || !templateForm.demo_url?.trim() || !templateForm.thumbnail_url) {
      setErrorMessage("Title, Price, Demo URL, and Thumbnail are required.");
      return;
    }

    const payload = {
      title: templateForm.title.trim(),
      category: templateForm.category || "Surprise",
      sub_category: templateForm.sub_category || (templateForm.category === "Surprise" ? "Birthday" : "Wedding Invitation"),
      price: Number(templateForm.price),
      demo_url: templateForm.demo_url.trim(),
      thumbnail_url: templateForm.thumbnail_url,
      description: templateForm.description?.trim() || "",
      custom_fields: templateForm.custom_fields || [],
    };

    try {
      if (isEditingTemplate && templateForm.id) {
        const { error } = await supabase.from("templates").update(payload).eq("id", templateForm.id);
        if (error) throw error;
        setSuccessMessage("Template updated!");
      } else {
        const { error } = await supabase.from("templates").insert([payload]);
        if (error) throw error;
        setSuccessMessage("Template created!");
      }

      resetTemplateForm();
      await fetchTemplates();
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err: any) {
      setErrorMessage("Error saving template: " + err.message);
    }
  };

  const handleEditTemplate = (tmpl: Template) => {
    setTemplateForm(tmpl);
    setIsEditingTemplate(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteTemplate = async (id: string) => {
    if (!confirm("Are you sure you want to delete this template?")) return;
    const { error } = await supabase.from("templates").delete().eq("id", id);
    if (!error) {
      setTemplates((prev) => prev.filter((t) => t.id !== id));
      if (templateForm.id === id) resetTemplateForm();
      setSuccessMessage("Template deleted.");
      setTimeout(() => setSuccessMessage(""), 3000);
    } else {
      setErrorMessage("Error deleting template: " + error.message);
    }
  };

  const resetTemplateForm = () => {
    setTemplateForm({
      title: "",
      category: "Surprise",
      sub_category: "Birthday",
      price: 499,
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

  const handleAddBookOption = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!newOptLabel.trim()) {
      setErrorMessage("Label is required.");
      return;
    }

    const { error } = await supabase.from("book_form_options").insert([{
      option_type: newOptType,
      label: newOptLabel.trim(),
      price_extra: Number(newOptPrice),
    }]);

    if (error) {
      setErrorMessage("Error adding book option: " + error.message);
    } else {
      setNewOptLabel("");
      setNewOptPrice(0);
      setSuccessMessage("Book option added!");
      fetchBookOptions();
      setTimeout(() => setSuccessMessage(""), 3000);
    }
  };

  const handleDeleteBookOption = async (id: string) => {
    if (!confirm("Delete this option?")) return;
    const { error } = await supabase.from("book_form_options").delete().eq("id", id);
    if (!error) fetchBookOptions();
    else setErrorMessage("Error deleting option: " + error.message);
  };

  const handleUpdateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    if (!editingOrder) return;

    const targetStatuses = ["delivered", "completed"];
    const isNowCompleted = targetStatuses.includes(editingOrder.delivery_status);
    const calculatedBalance = Number(editingOrder.total_amount) - Number(editingOrder.advance_paid);

    if (calculatedBalance > 0 && isNowCompleted) {
      setErrorMessage(`❌ Cannot deliver! Balance due is ₹${calculatedBalance}. Full payment must be confirmed before releasing the link.`);
      return;
    }

    try {
      const { data: oldOrder } = await supabase
        .from("orders")
        .select("delivery_status, user_id, referral_code_used, total_amount, customer_name, customer_phone")
        .eq("id", editingOrder.id)
        .single();

      const wasAlreadyCompleted = oldOrder ? targetStatuses.includes(oldOrder.delivery_status) : false;

      const { error: updateError } = await supabase
        .from("orders")
        .update({
          customer_name: editingOrder.customer_name.trim(),
          customer_phone: editingOrder.customer_phone.trim(),
          total_amount: Number(editingOrder.total_amount),
          advance_paid: Number(editingOrder.advance_paid),
          balance_due: calculatedBalance,
          payment_status: calculatedBalance === 0 ? "fully_paid" : editingOrder.payment_status,
          delivery_status: editingOrder.delivery_status,
          live_website_url: calculatedBalance === 0 ? (editingOrder.live_website_url?.trim() || null) : null,
        })
        .eq("id", editingOrder.id);

      if (updateError) throw updateError;

      if (isNowCompleted && !wasAlreadyCompleted && oldOrder?.user_id) {
        const { count: completedOrdersCount } = await supabase
          .from("orders")
          .select("*", { count: "exact", head: true })
          .eq("user_id", oldOrder.user_id)
          .in("delivery_status", ["delivered", "completed"]);

        const totalCompleted = completedOrdersCount || 1;
        const loyaltyScore = totalCompleted % 4;

        await supabase
          .from("profiles")
          .update({ completed_orders: loyaltyScore })
          .eq("id", oldOrder.user_id);

        if (oldOrder.referral_code_used) {
          const { data: referrer } = await supabase
            .from("profiles")
            .select("id, phone, full_name")
            .eq("referral_code", oldOrder.referral_code_used)
            .single();

          if (referrer) {
            const cashReward = Math.round(Number(oldOrder.total_amount) * 0.10);
            if (cashReward > 0) {
              await supabase.from("payout_requests").insert([{
                referrer_id: referrer.id,
                referrer_name: referrer.full_name,
                phone_number: referrer.phone,
                amount: cashReward,
                status: "pending_transfer",
                created_at: new Date().toISOString()
              }]);
            }
          }
        }
      }

      await fetchOrders();
      setEditingOrder(null);
      await fetchPayouts();
      setSuccessMessage("Order updated successfully!");
      setTimeout(() => setSuccessMessage(""), 4000);
    } catch (err: any) {
      setErrorMessage("Error updating order: " + err.message);
    }
  };

  const handleMarkPayoutPaid = async (payout: PayoutRequest) => {
    const { error } = await supabase.from("payout_requests").update({ status: "paid" }).eq("id", payout.id);
    if (!error) {
      if (payout.phone_number) {
        const phoneNum = payout.phone_number.replace(/\D/g, "");
        const msg = encodeURIComponent(`Hi ${payout.referrer_name}, your referral cash reward of ₹${payout.amount} has been transferred to your UPI ID / Phone (${payout.phone_number})! 💸 Thank you.`);
        window.open(`https://wa.me/91${phoneNum}?text=${msg}`, "_blank");
      }
      await fetchPayouts();
      setSuccessMessage("Payout marked as paid and WhatsApp notification sent.");
      setTimeout(() => setSuccessMessage(""), 3000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3 text-stone-400 text-sm font-mono bg-[#050811]">
        <Loader2 size={24} className="animate-spin text-rose-500" />
        Authenticating Admin Console...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050811] text-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-[#25181b] pb-6">
          <div>
            <h1 className="text-3xl font-serif text-white tracking-tight">Admin Console</h1>
            <p className="text-stone-400 text-sm mt-1">Manage orders, payments, templates, and payouts.</p>
          </div>

          <div className="flex flex-wrap items-center gap-3 bg-[#180f12] p-2 rounded-2xl border border-[#382328]">
            {[
              { id: "orders", label: "Orders", icon: ShoppingBag },
              { id: "payouts", label: "Payouts", icon: DollarSign },
              { id: "templates", label: "Templates", icon: Layers },
              { id: "bookOptions", label: "Book Options", icon: Settings },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition cursor-pointer flex items-center gap-2 ${isActive ? "bg-rose-500 text-white shadow-lg" : "text-stone-400 hover:bg-rose-500/10 hover:text-rose-300"}`}
                >
                  <Icon size={16} />
                  {tab.label}
                  {tab.id === 'payouts' && payouts.filter(p => p.status === 'pending_transfer').length > 0 && (
                    <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-white text-rose-600 text-[10px] font-black">
                       {payouts.filter(p => p.status === 'pending_transfer').length}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {errorMessage && (
          <div className="bg-rose-950/50 border border-rose-500/40 p-4 rounded-2xl text-rose-300 text-xs flex items-center gap-2.5 shadow-lg">
            <AlertCircle size={16} className="shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}
        {successMessage && (
          <div className="bg-emerald-950/50 border border-emerald-500/40 p-4 rounded-2xl text-emerald-300 text-xs flex items-center gap-2.5 shadow-lg">
            <CheckCircle size={16} />
            <span>{successMessage}</span>
          </div>
        )}

        {/* ORDERS TAB */}
        {activeTab === "orders" && (
          <div className="space-y-6">
            {editingOrder && (
              <div className="p-6 bg-[#160d0f] border border-rose-500/40 rounded-3xl space-y-5 shadow-2xl">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <h3 className="text-lg font-serif text-rose-200">
                      Editing Order: <span className="font-mono bg-rose-500/10 px-2 py-0.5 rounded">{editingOrder.tracking_number}</span>
                    </h3>
                  </div>
                  <button type="button" onClick={() => setEditingOrder(null)} className="text-stone-400 hover:text-white text-xs uppercase cursor-pointer p-2">✕ Close</button>
                </div>

                <form onSubmit={handleUpdateOrder} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 text-xs">
                  <div className="space-y-4 bg-[#0c0708] p-4 rounded-2xl border border-[#382328]">
                    <h4 className="font-bold text-sm text-stone-300 border-b border-[#382328] pb-2">Customer Details</h4>
                    <div>
                      <label className="block text-stone-400 mb-1 font-medium">Name</label>
                      <input type="text" value={editingOrder.customer_name} onChange={(e) => setEditingOrder({ ...editingOrder, customer_name: e.target.value })} className="w-full bg-[#180f12] border border-[#382328] rounded-lg px-3 py-2.5 text-white" required />
                    </div>
                    <div>
                      <label className="block text-stone-400 mb-1 font-medium">Phone (WhatsApp)</label>
                      <input type="text" value={editingOrder.customer_phone} onChange={(e) => setEditingOrder({ ...editingOrder, customer_phone: e.target.value })} className="w-full bg-[#180f12] border border-[#382328] rounded-lg px-3 py-2.5 text-white" required />
                    </div>
                  </div>

                  <div className="space-y-4 bg-[#0c0708] p-4 rounded-2xl border border-[#382328]">
                     <h4 className="font-bold text-sm text-stone-300 border-b border-[#382328] pb-2">Financials (Advance / Balance)</h4>
                    <div>
                      <label className="block text-stone-400 mb-1 font-medium">Total Price (₹)</label>
                      <input type="number" min="1" value={editingOrder.total_amount} onChange={(e) => setEditingOrder({ ...editingOrder, total_amount: Number(e.target.value) })} className="w-full bg-[#180f12] border border-[#382328] rounded-lg px-3 py-2.5 text-white font-mono" required />
                    </div>
                    <div>
                      <label className="block text-stone-400 mb-1 font-medium">Advance / Paid Amount (₹)</label>
                      <input type="number" min="0" value={editingOrder.advance_paid || 0} onChange={(e) => setEditingOrder({ ...editingOrder, advance_paid: Number(e.target.value) })} className="w-full bg-[#180f12] border border-[#382328] rounded-lg px-3 py-2.5 text-emerald-400 font-mono" required />
                    </div>
                    <div>
                      <label className="block text-stone-400 mb-1 font-medium">Balance Due (₹)</label>
                      <input type="text" value={editingOrder.total_amount - (editingOrder.advance_paid || 0)} className="w-full bg-[#180f12] border border-[#382328] rounded-lg px-3 py-2.5 text-amber-300 font-mono" disabled readOnly />
                    </div>
                  </div>

                  <div className="space-y-4 bg-[#0c0708] p-4 rounded-2xl border border-[#382328]">
                     <h4 className="font-bold text-sm text-stone-300 border-b border-[#382328] pb-2">Fulfillment & Delivery</h4>
                    <div>
                      <label className="block text-stone-400 mb-1 font-medium">Delivery Status</label>
                      <select value={editingOrder.delivery_status} onChange={(e) => setEditingOrder({ ...editingOrder, delivery_status: e.target.value })} className="w-full bg-[#180f12] border border-[#382328] rounded-lg px-3 py-2.5 text-white">
                        <option value="processing">Processing</option>
                        <option value="in_progress">In Progress</option>
                        <option value="delivered">Delivered (Requires Zero Balance)</option>
                        <option value="completed">Completed (Requires Zero Balance)</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-stone-400 mb-1 font-medium">Live Website URL</label>
                      <input type="url" placeholder="https://..." value={editingOrder.live_website_url || ""} onChange={(e) => setEditingOrder({ ...editingOrder, live_website_url: e.target.value })} className="w-full bg-[#180f12] border border-[#382328] rounded-lg px-3 py-2.5 text-white" />
                    </div>
                  </div>

                  <div className="sm:col-span-2 md:col-span-3 flex justify-end gap-3 mt-2 border-t border-[#382328] pt-4">
                    <button type="button" onClick={() => setEditingOrder(null)} className="px-5 py-2.5 rounded-xl bg-[#25181b] text-stone-300 text-xs font-semibold">Cancel</button>
                    <button type="submit" className="px-8 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs uppercase tracking-wider shadow-lg">Save & Sync Order</button>
                  </div>
                </form>
              </div>
            )}

            <div className="space-y-4">
              {orders.length === 0 ? (
                <div className="p-16 text-center text-stone-600 bg-[#140b0d] border border-[#2b181c] rounded-3xl text-sm">No orders found.</div>
              ) : (
                orders.map((order) => {
                  const advance = order.advance_paid || 0;
                  const balance = order.total_amount - advance;
                  const isFullyPaid = balance <= 0;
                  const phoneNum = order.customer_phone ? order.customer_phone.replace(/\D/g, "") : "";
                  const waText = encodeURIComponent(
                    `Hi ${order.customer_name}, your PixelsSurprise order (${order.tracking_number}) update:\n` +
                    `Status: ${order.delivery_status.toUpperCase()}\n` +
                    (order.live_website_url ? `Live Site: ${order.live_website_url}\n` : "") +
                    `Balance Due: ₹${balance}`
                  );
                  const waLink = `https://wa.me/91${phoneNum}?text=${waText}`;

                  return (
                    <div key={order.id} className="p-5 bg-[#140b0d] border border-[#2b181c] rounded-3xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5 shadow-lg">
                      <div className="min-w-[150px]">
                        <span className="font-mono text-xs font-bold text-rose-300 bg-rose-500/10 px-3 py-1 rounded-full border border-rose-500/20 block w-fit">{order.tracking_number}</span>
                        <span className="text-[11px] text-stone-500 block mt-2">{new Date(order.created_at).toLocaleDateString()}</span>
                      </div>

                      <div className="min-w-[180px]">
                        <h4 className="text-white font-semibold text-sm">{order.customer_name}</h4>
                        <span className="text-xs text-emerald-400 block mt-0.5 font-mono">Ph: {order.customer_phone}</span>
                      </div>

                      <div className="min-w-[170px] text-xs font-mono space-y-0.5">
                        <div className="text-white font-bold">Total: ₹{order.total_amount}</div>
                        {isFullyPaid ? (
                          <div className="text-emerald-400 font-bold">Full Payment Completed ✓</div>
                        ) : (
                          <>
                            <div className="text-emerald-400">Paid: ₹{advance}</div>
                            <div className="text-amber-300">Balance Due: ₹{balance}</div>
                          </>
                        )}
                      </div>

                      <div className="min-w-[130px]">
                        <span className="inline-block px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          {order.delivery_status}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {phoneNum && (
                          <a
                            href={waLink}
                            target="_blank"
                            rel="noreferrer"
                            className="px-3.5 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 text-xs font-semibold flex items-center gap-1.5 transition"
                            title="Send WhatsApp Message"
                          >
                            <MessageSquare size={13} /> WhatsApp
                          </a>
                        )}
                        <button onClick={() => setEditingOrder({ ...order, advance_paid: advance, balance_due: balance })} className="px-4 py-2 rounded-xl bg-[#221316] hover:bg-rose-500 text-stone-300 hover:text-white text-xs font-semibold border border-[#382328] transition cursor-pointer">
                          Edit & Deliver
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* PAYOUTS TAB */}
        {activeTab === "payouts" && (
          <div className="bg-[#140b0d] border border-[#2b181c] rounded-3xl p-6 space-y-4 shadow-xl">
            <h3 className="font-serif text-xl font-bold text-white">Pending Referral Payout Requests</h3>
            {payouts.length === 0 ? <div className="p-8 text-center text-stone-500 text-xs">No pending payouts.</div> : payouts.map(p => (
              <div key={p.id} className="py-3 flex justify-between items-center border-b border-[#2b181c]">
                <div>
                  <h4 className="font-bold text-sm text-white">{p.referrer_name}</h4>
                  <p className="text-xs text-emerald-400 font-mono">UPI / Phone: {p.phone_number}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-mono font-bold text-amber-300">₹{p.amount}</span>
                  {p.status === "paid" ? <span className="text-xs text-emerald-400 font-bold">Paid ✓</span> : (
                    <button onClick={() => handleMarkPayoutPaid(p)} className="px-3 py-1.5 rounded-lg bg-rose-500 text-white text-xs font-bold cursor-pointer">Mark Paid</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TEMPLATES TAB */}
        {activeTab === "templates" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-5 bg-[#140b0d] border border-[#2b181c] rounded-2xl p-6 space-y-5">
              <h3 className="text-lg font-serif text-white">{isEditingTemplate ? "Edit Template" : "Add Template"}</h3>
              <form onSubmit={handleSaveTemplate} className="space-y-4 text-xs">
                <div>
                  <label className="block text-stone-400 mb-1 font-medium">Template Title *</label>
                  <input type="text" placeholder="e.g. Magical Birthday Surprise" value={templateForm.title || ""} onChange={e => setTemplateForm({ ...templateForm, title: e.target.value })} className="w-full bg-[#0c0708] border border-[#382328] rounded-xl p-3 text-white outline-none focus:border-rose-400" required />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-stone-400 mb-1 font-medium">Main Category *</label>
                    <select 
                      value={templateForm.category || "Surprise"} 
                      onChange={e => {
                        const newCat = e.target.value;
                        const defaultSub = newCat === "Surprise" ? SURPRISE_SUB_CATEGORIES[0] : INVITATION_SUB_CATEGORIES[0];
                        setTemplateForm({ ...templateForm, category: newCat, sub_category: defaultSub });
                      }} 
                      className="w-full bg-[#0c0708] border border-[#382328] rounded-xl p-3 text-white outline-none focus:border-rose-400"
                    >
                      <option value="Surprise">Surprise</option>
                      <option value="Invitation">Invitation</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-stone-400 mb-1 font-medium">Occasion / Sub-Category *</label>
                    <select 
                      value={templateForm.sub_category || ""} 
                      onChange={e => setTemplateForm({ ...templateForm, sub_category: e.target.value })} 
                      className="w-full bg-[#0c0708] border border-[#382328] rounded-xl p-3 text-white outline-none focus:border-rose-400"
                      required
                    >
                      {(templateForm.category === "Surprise" ? SURPRISE_SUB_CATEGORIES : INVITATION_SUB_CATEGORIES).map(sub => (
                        <option key={sub} value={sub}>{sub}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-stone-400 mb-1 font-medium">Price (₹) *</label>
                    <input type="number" min="1" placeholder="499" value={templateForm.price || 0} onChange={e => setTemplateForm({ ...templateForm, price: Number(e.target.value) })} className="w-full bg-[#0c0708] border border-[#382328] rounded-xl p-3 text-white outline-none focus:border-rose-400 font-mono" required />
                  </div>
                  <div>
                    <label className="block text-stone-400 mb-1 font-medium">Live Demo URL *</label>
                    <input type="url" placeholder="https://..." value={templateForm.demo_url || ""} onChange={e => setTemplateForm({ ...templateForm, demo_url: e.target.value })} className="w-full bg-[#0c0708] border border-[#382328] rounded-xl p-3 text-white outline-none focus:border-rose-400 font-mono" required />
                  </div>
                </div>

                <div>
                  <label className="block text-stone-400 mb-1 font-medium">Description</label>
                  <textarea rows={2} placeholder="Brief summary of the surprise experience..." value={templateForm.description || ""} onChange={e => setTemplateForm({ ...templateForm, description: e.target.value })} className="w-full bg-[#0c0708] border border-[#382328] rounded-xl p-3 text-white outline-none focus:border-rose-400 resize-none" />
                </div>

                <div>
                  <label className="block text-stone-400 mb-1 font-medium">Thumbnail Image *</label>
                  <label className="flex items-center justify-center gap-2 bg-[#0c0708] border border-[#382328] rounded-xl p-3 text-stone-300 cursor-pointer hover:border-rose-500/50 transition">
                    <Upload size={14} /> <span>{uploadingImage ? "Uploading..." : "Upload Thumbnail Image"}</span>
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>
                  {templateForm.thumbnail_url && (
                    <img src={templateForm.thumbnail_url} alt="Preview" className="mt-2 w-20 h-16 object-cover rounded-lg border border-[#382328]" />
                  )}
                </div>

                {/* CUSTOM FIELDS BUILDER */}
                <div className="space-y-3 pt-3 border-t border-[#382328]">
                  <div className="flex justify-between items-center">
                    <label className="font-bold text-stone-300">Custom Order Fields Required</label>
                    <button type="button" onClick={addTemplateField} className="px-2.5 py-1 rounded-lg bg-rose-500/20 text-rose-300 font-bold text-[10px] uppercase tracking-wider hover:bg-rose-500/30">
                      + Add Field
                    </button>
                  </div>
                  {(templateForm.custom_fields || []).map((field, idx) => (
                    <div key={idx} className="flex gap-2 items-center bg-[#0c0708] p-3 rounded-xl border border-[#382328]">
                      <input
                        type="text"
                        placeholder="Field Label (e.g. Partner Name)"
                        value={field.label}
                        onChange={(e) => updateTemplateField(idx, "label", e.target.value)}
                        className="flex-1 bg-[#180f12] border border-[#382328] rounded-lg p-2 text-white outline-none"
                      />
                      <select
                        value={field.fieldType}
                        onChange={(e) => updateTemplateField(idx, "fieldType", e.target.value)}
                        className="bg-[#180f12] border border-[#382328] rounded-lg p-2 text-white outline-none"
                      >
                        <option value="text">Text</option>
                        <option value="textarea">Textarea</option>
                        <option value="url">URL</option>
                        <option value="number">Number</option>
                        <option value="date">Date</option>
                      </select>
                      <button type="button" onClick={() => removeTemplateField(idx)} className="text-red-400 hover:text-red-300 p-1">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2 pt-2">
                  {isEditingTemplate && (
                    <button type="button" onClick={resetTemplateForm} className="flex-1 py-3 rounded-xl bg-[#25181b] text-stone-300 font-bold uppercase tracking-wider">Cancel</button>
                  )}
                  <button type="submit" className="flex-1 py-3 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold uppercase tracking-wider shadow-lg">Save Template</button>
                </div>
              </form>
            </div>

            <div className="lg:col-span-7 space-y-3">
              {templates.map(t => (
                <div key={t.id} className="p-4 bg-[#140b0d] border border-[#2b181c] rounded-2xl flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <img src={t.thumbnail_url} alt="" className="w-16 h-14 object-cover rounded-xl border border-[#382328]" />
                    <div>
                      <span className="text-[10px] font-mono text-rose-300 uppercase">{t.category} • {t.sub_category}</span>
                      <h4 className="text-white font-semibold text-sm">{t.title}</h4>
                      <span className="text-xs text-rose-300 font-mono">₹{t.price}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleEditTemplate(t)} className="px-3 py-1.5 rounded-xl bg-[#25181b] hover:bg-[#382328] text-xs text-stone-300 transition">Edit</button>
                    <button onClick={() => handleDeleteTemplate(t.id!)} className="px-3 py-1.5 rounded-xl bg-red-950/50 hover:bg-red-950 text-xs text-red-400 transition">Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* BOOK OPTIONS TAB */}
        {activeTab === "bookOptions" && (
          <div className="bg-[#140b0d] border border-[#2b181c] rounded-3xl p-6 space-y-6">
            <form onSubmit={handleAddBookOption} className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <select value={newOptType} onChange={e => setNewOptType(e.target.value)} className="bg-[#0c0708] border border-[#382328] rounded-xl p-3 text-white">
                <option value="game">Mini-Game</option>
                <option value="surprise_module">Surprise Module</option>
              </select>
              <input type="text" placeholder="Option Label" value={newOptLabel} onChange={e => setNewOptLabel(e.target.value)} className="bg-[#0c0708] border border-[#382328] rounded-xl p-3 text-white" required />
              <input type="number" placeholder="Extra Price" value={newOptPrice} onChange={e => setNewOptPrice(Number(e.target.value))} className="bg-[#0c0708] border border-[#382328] rounded-xl p-3 text-white" />
              <button type="submit" className="sm:col-span-3 py-3 rounded-xl bg-rose-500 text-white font-bold">Add Book Option</button>
            </form>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {bookOptions.map(opt => (
                <div key={opt.id} className="bg-[#0c0708] border border-[#2b181c] p-4 rounded-xl flex justify-between items-center">
                  <div>
                    <h4 className="text-xs font-bold text-white">{opt.label}</h4>
                    <span className="text-[10px] text-amber-300">+₹{opt.price_extra}</span>
                  </div>
                  <button onClick={() => handleDeleteBookOption(opt.id)} className="text-red-400"><Trash2 size={14} /></button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}