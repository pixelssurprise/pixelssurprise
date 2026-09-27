"use client";

import { useState, Suspense } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Sparkles, Phone, Mail, Lock, User, CreditCard, ArrowRight, Loader2, AlertCircle } from "lucide-react";

function AuthForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get("redirect");

  const [isSignUp, setIsSignUp] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [password, setPassword] = useState("");
  const [differentUpi, setDifferentUpi] = useState(false);
  const [upiNumber, setUpiNumber] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleAuth(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

    try {
      if (isSignUp) {
        const finalUpi = differentUpi ? upiNumber.trim() : mobileNumber.trim();

        // Pass phone and upi_number in metadata so the trigger inserts them automatically
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: {
              full_name: fullName.trim(),
              phone: mobileNumber.trim(),
              upi_number: finalUpi,
            },
          },
        });

        if (error) throw error;

        if (data.user) {
          router.push(redirectParam || "/dashboard");
          router.refresh();
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (error) throw error;

        if (data.user) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("is_admin")
            .eq("id", data.user.id)
            .single();

          if (profile?.is_admin) {
            router.push("/admin");
          } else {
            router.push(redirectParam || "/dashboard");
          }
          router.refresh();
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Authentication failed. Please verify your credentials.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md bg-brand-card border border-brand-border rounded-3xl p-8 shadow-2xl space-y-6">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-brand-gold/10 border border-brand-gold/20 text-brand-gold text-[10px] font-mono uppercase tracking-widest">
          <Sparkles size={11} /> {isSignUp ? "Join PixelsSurprise" : "Welcome Back"}
        </div>
        <h1 className="font-serif text-3xl font-bold text-brand-goldLight">
          {isSignUp ? "Create Account" : "Account Sign In"}
        </h1>
        <p className="text-xs text-slate-400">
          {isSignUp
            ? "Provide your details for order tracking and referral rewards."
            : "Enter your account email and password to sign in."}
        </p>
      </div>

      {errorMessage && (
        <div className="bg-rose-500/10 border border-rose-500/30 rounded-2xl p-3 flex items-start gap-2.5 text-xs text-rose-400">
          <AlertCircle size={16} className="shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleAuth} className="space-y-4 text-xs">
        {isSignUp && (
          <div>
            <label className="block text-slate-400 mb-1.5 font-medium">Your Full Name</label>
            <div className="relative">
              <User size={14} className="absolute left-3.5 top-3.5 text-slate-500" />
              <input
                required
                type="text"
                placeholder="Aarav Sharma"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-brand-dark border border-brand-border rounded-xl pl-10 pr-4 py-3 text-white outline-none focus:border-brand-gold transition"
              />
            </div>
          </div>
        )}

        <div>
          <label className="block text-slate-400 mb-1.5 font-medium">Email Address</label>
          <div className="relative">
            <Mail size={14} className="absolute left-3.5 top-3.5 text-slate-500" />
            <input
              required
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-brand-dark border border-brand-border rounded-xl pl-10 pr-4 py-3 text-white outline-none focus:border-brand-gold transition"
            />
          </div>
        </div>

        {isSignUp && (
          <div>
            <label className="block text-slate-400 mb-1.5 font-medium">WhatsApp / Mobile Number (10 Digits)</label>
            <div className="relative">
              <Phone size={14} className="absolute left-3.5 top-3.5 text-slate-500" />
              <input
                required
                type="tel"
                maxLength={10}
                placeholder="9876543210"
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, "").slice(0, 10))}
                className="w-full bg-brand-dark border border-brand-border rounded-xl pl-10 pr-4 py-3 text-white outline-none focus:border-brand-gold transition tracking-widest font-mono"
              />
            </div>
          </div>
        )}

        {isSignUp && (
          <div className="space-y-2 pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-xs text-stone-300">
              <input
                type="checkbox"
                checked={differentUpi}
                onChange={(e) => setDifferentUpi(e.target.checked)}
                className="w-4 h-4 accent-rose-500 rounded"
              />
              Is your PhonePe / UPI payout number different from your WhatsApp number?
            </label>

            {differentUpi && (
              <div className="relative pt-1">
                <CreditCard size={14} className="absolute left-3.5 top-4.5 text-slate-500" />
                <input
                  type="text"
                  placeholder="Enter PhonePe / UPI Number or ID"
                  value={upiNumber}
                  onChange={(e) => setUpiNumber(e.target.value)}
                  className="w-full bg-brand-dark border border-brand-border rounded-xl pl-10 pr-4 py-3 text-white outline-none focus:border-brand-gold transition"
                  required={differentUpi}
                />
              </div>
            )}
          </div>
        )}

        <div>
          <label className="block text-slate-400 mb-1.5 font-medium">Password</label>
          <div className="relative">
            <Lock size={14} className="absolute left-3.5 top-3.5 text-slate-500" />
            <input
              required
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-brand-dark border border-brand-border rounded-xl pl-10 pr-4 py-3 text-white outline-none focus:border-brand-gold transition"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-full bg-rose-gradient text-brand-dark font-bold text-xs uppercase tracking-wider hover:opacity-90 transition flex items-center justify-center gap-2 shadow-lg shadow-brand-gold/25 cursor-pointer disabled:opacity-50 mt-2"
        >
          {loading ? (
            <>
              <Loader2 size={14} className="animate-spin" />
              Processing...
            </>
          ) : (
            <>
              {isSignUp ? "Create Account & Get Code" : "Sign In to Store"}
              <ArrowRight size={14} />
            </>
          )}
        </button>
      </form>

      <div className="text-center pt-2 border-t border-brand-border/60">
        <button
          type="button"
          onClick={() => {
            setIsSignUp(!isSignUp);
            setErrorMessage("");
          }}
          className="text-xs text-slate-400 hover:text-brand-gold transition cursor-pointer"
        >
          {isSignUp
            ? "Already have an account? Sign In here"
            : "Don't have an account yet? Create one here"}
        </button>
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12 bg-[#0B0608]">
      <Suspense
        fallback={
          <div className="text-xs font-mono text-brand-gold uppercase tracking-widest flex items-center gap-2">
            <Loader2 size={16} className="animate-spin" /> Loading Portal...
          </div>
        }
      >
        <AuthForm />
      </Suspense>
    </div>
  );
}