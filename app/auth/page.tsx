"use client";

import { useState, Suspense } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Sparkles, Mail, Lock, User, ArrowRight, Loader2, AlertCircle } from "lucide-react";

function AuthForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get("redirect");

  const [isSignUp, setIsSignUp] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleAuth(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

    try {
      if (isSignUp) {
        // Sign Up Flow
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
            },
          },
        });

        if (error) throw error;

        if (data.user) {
          // Sync new user profile into public.profiles
          await supabase.from("profiles").upsert({
            id: data.user.id,
            email: data.user.email,
            full_name: fullName,
            is_admin: false,
          });

          // Route to pending redirect or dashboard
          router.push(redirectParam || "/dashboard");
          router.refresh();
        }
      } else {
        // Sign In Flow
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        if (data.user) {
          // Check role to direct to correct panel
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
      setErrorMessage(err.message || "Authentication failed. Please verify credentials.");
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
            ? "Start customizing dynamic interactive experiences."
            : "Access your customized builds and live previews."}
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
                placeholder="John Doe"
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
          className="w-full py-3 rounded-full bg-rose-gradient text-brand-dark font-bold text-xs uppercase tracking-wider hover:opacity-90 transition flex items-center justify-center gap-2 shadow-lg shadow-brand-gold/20 cursor-pointer disabled:opacity-50 mt-2"
        >
          {loading ? (
            <>
              <Loader2 size={14} className="animate-spin" />
              Processing...
            </>
          ) : (
            <>
              {isSignUp ? "Sign Up & Continue" : "Sign In to Store"}
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