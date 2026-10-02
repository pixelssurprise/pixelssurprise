"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Star, MessageSquareQuote, CheckCircle, Loader2 } from "lucide-react";

export default function FeedbackPage() {
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(5);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const fetchFeedbacks = async () => {
    const { data, error } = await supabase
      .from("feedbacks")
      .select("*")
      .order("created_at", { ascending: false });
    
    if (error) {
      console.error("Error fetching feedbacks:", error.message);
    } else if (data) {
      setFeedbacks(data);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !comment.trim()) return;

    setSubmitting(true);
    setErrorMsg("");

    const { error } = await supabase.from("feedbacks").insert([
      { 
        name: name.trim(), 
        comment: comment.trim(), 
        rating: Number(rating) 
      }
    ]);

    if (error) {
      setErrorMsg("Failed to submit review: " + error.message);
    } else {
      setName("");
      setComment("");
      setRating(5);
      setSuccessMsg("Thank you! Your feedback has been shared successfully ✨");
      fetchFeedbacks();
      setTimeout(() => setSuccessMsg(""), 4000);
    }
    setSubmitting(false);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-12 text-stone-200">
      <div className="text-center space-y-3">
        <span className="px-3.5 py-1.5 rounded-full bg-[#201317] border border-brand-border text-brand-goldLight text-xs font-mono uppercase tracking-widest">
          Client Testimonials
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-white">What Our Customers Say</h1>
        <p className="text-xs sm:text-sm text-stone-400 max-w-lg mx-auto">
          Read real reviews from people who surprised their loved ones with PixelsSurprise websites.
        </p>
      </div>

      {/* Submission Form */}
      <form onSubmit={handleSubmit} className="bg-brand-card border border-brand-border rounded-3xl p-6 sm:p-8 space-y-4 shadow-xl">
        <h3 className="font-serif text-xl font-bold text-white flex items-center gap-2">
          <MessageSquareQuote className="text-brand-gold" size={20} /> Leave Your Feedback
        </h3>

        {successMsg && (
          <div className="bg-emerald-950/50 border border-emerald-500/40 p-3 rounded-xl text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle size={16} /> <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="bg-rose-950/50 border border-rose-500/40 p-3 rounded-xl text-rose-300 text-xs">
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block text-stone-400 mb-1 font-medium">Your Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Rahul Sharma"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-brand-dark border border-brand-border rounded-xl p-3 text-white outline-none focus:border-rose-400"
            />
          </div>
          <div>
            <label className="block text-stone-400 mb-1 font-medium">Rating *</label>
            <select
              value={rating}
              onChange={(e) => setRating(Number(e.target.value))}
              className="w-full bg-brand-dark border border-brand-border rounded-xl p-3 text-white outline-none focus:border-rose-400"
            >
              <option value={5}>⭐⭐⭐⭐⭐ (5/5 Stars)</option>
              <option value={4}>⭐⭐⭐⭐ (4/5 Stars)</option>
              <option value={3}>⭐⭐⭐ (3/5 Stars)</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-stone-400 mb-1 font-medium">Your Experience / Review *</label>
          <textarea
            required
            rows={3}
            placeholder="How was the surprise website? Did your partner love it?"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full bg-brand-dark border border-brand-border rounded-xl p-3 text-xs text-white outline-none focus:border-rose-400 resize-none"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="px-6 py-3 rounded-full bg-rose-gradient text-stone-950 font-bold text-xs uppercase tracking-wider shadow-lg cursor-pointer disabled:opacity-50"
        >
          {submitting ? "Submitting..." : "Submit Review"}
        </button>
      </form>

      {/* Testimonials List */}
      <div className="space-y-4">
        <h3 className="font-serif text-2xl font-bold text-white">Recent Reviews</h3>
        {loading ? (
          <div className="text-center py-10 text-stone-500 flex items-center justify-center gap-2 text-xs">
            <Loader2 className="animate-spin text-brand-gold" size={16} /> Loading reviews...
          </div>
        ) : feedbacks.length === 0 ? (
          <div className="p-10 text-center text-stone-500 bg-brand-card border border-brand-border rounded-2xl text-xs">
            No reviews submitted yet. Be the first to share your experience!
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {feedbacks.map((fb) => (
              <div key={fb.id} className="bg-brand-card border border-brand-border rounded-2xl p-5 space-y-3 shadow-md">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-sm text-white">{fb.name}</h4>
                  <div className="flex text-amber-400">
                    {[...Array(fb.rating || 5)].map((_, i) => (
                      <Star key={i} size={14} fill="currentColor" />
                    ))}
                  </div>
                </div>
                <p className="text-xs text-stone-300 leading-relaxed italic">"{fb.comment}"</p>
                <span className="text-[10px] text-stone-500 block font-mono">
                  {new Date(fb.created_at).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}