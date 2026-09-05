"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Sparkles, User, LogOut, Shield, ArrowRight } from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function initAuth() {
      // 1. Instant check from local browser storage (no network wait)
      const { data: { session } } = await supabase.auth.getSession();
      const currentUser = session?.user || null;
      
      if (!isMounted) return;
      setUser(currentUser);

      if (currentUser) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("is_admin")
          .eq("id", currentUser.id)
          .single();
        if (isMounted) setIsAdmin(Boolean(profile?.is_admin));
      }
    }

    initAuth();

    // 2. Listen only for auth events (login/logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        const currentUser = session?.user || null;
        setUser(currentUser);

        if (currentUser) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("is_admin")
            .eq("id", currentUser.id)
            .single();
          setIsAdmin(Boolean(profile?.is_admin));
        } else {
          setIsAdmin(false);
        }
      }
    );

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Prevent background scrolling when mobile menu drawer is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [menuOpen]);

  async function handleLogout() {
    await supabase.auth.signOut();
    setUser(null);
    setIsAdmin(false);
    setMenuOpen(false);
    router.push("/");
    router.refresh();
  }

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Explore Demos", href: "/explore" },
    { name: "How It Works", href: "/how-it-works" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-[#0B0608]/95 backdrop-blur-md border-b border-brand-border/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link
          href="/"
          onClick={() => setMenuOpen(false)}
          className="flex items-center gap-2.5 group cursor-pointer"
        >
          <div className="w-8 h-8 rounded-xl bg-rose-gradient flex items-center justify-center text-brand-dark shadow-md shadow-brand-gold/20 group-hover:scale-105 transition-transform">
            <Sparkles size={16} />
          </div>
          <span className="font-serif text-lg sm:text-xl font-bold tracking-tight text-brand-goldLight">
            Pixels<span className="text-brand-gold">Surprise</span>
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-7 lg:gap-8">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`text-xs uppercase tracking-wider transition font-medium ${
                  isActive
                    ? "text-brand-gold font-bold"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* Desktop Auth Controls */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-2.5">
              {isAdmin ? (
                <Link
                  href="/admin"
                  className="flex items-center gap-1.5 text-xs text-brand-gold hover:text-white px-3.5 py-2 rounded-xl border border-brand-gold/40 bg-brand-gold/10 font-bold uppercase tracking-wider transition shadow-sm"
                >
                  <Shield size={13} /> Admin Panel
                </Link>
              ) : (
                <Link
                  href="/dashboard"
                  className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white px-3.5 py-2 rounded-xl border border-brand-border bg-brand-card hover:border-brand-gold/40 transition"
                >
                  <User size={13} /> Dashboard
                </Link>
              )}

              <button
                onClick={handleLogout}
                className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-brand-card border border-transparent hover:border-brand-border transition cursor-pointer"
                title="Log Out"
              >
                <LogOut size={15} />
              </button>
            </div>
          ) : (
            <Link
              href="/auth"
              className="px-5 py-2 rounded-full bg-rose-gradient text-brand-dark font-bold text-xs uppercase tracking-wider hover:opacity-90 transition shadow-md shadow-brand-gold/15 flex items-center gap-1.5 cursor-pointer"
            >
              Sign In <ArrowRight size={13} />
            </Link>
          )}
        </div>

        {/* Mobile 3-Line Animated Hamburger Button */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle Navigation Menu"
          aria-expanded={menuOpen}
          className="md:hidden flex flex-col justify-center items-center w-10 h-10 rounded-xl bg-brand-card border border-brand-border text-slate-300 hover:text-white focus:outline-none transition cursor-pointer gap-1.5 p-2"
        >
          <span
            className={`h-0.5 w-5 bg-current rounded-full transition-all duration-300 ease-out origin-center ${
              menuOpen ? "rotate-45 translate-y-2" : ""
            }`}
          />
          <span
            className={`h-0.5 w-5 bg-current rounded-full transition-all duration-200 ease-out ${
              menuOpen ? "opacity-0 scale-x-0" : "opacity-100"
            }`}
          />
          <span
            className={`h-0.5 w-5 bg-current rounded-full transition-all duration-300 ease-out origin-center ${
              menuOpen ? "-rotate-45 -translate-y-2" : ""
            }`}
          />
        </button>
      </div>

      {/* Mobile Backdrop & Drawer Menu */}
      {menuOpen && (
        <div className="md:hidden fixed inset-x-0 top-16 h-[calc(100dvh-4rem)] bg-[#0B0608]/98 backdrop-blur-xl border-t border-brand-border flex flex-col justify-between p-6 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="space-y-3">
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest px-3">
              Navigation
            </span>

            <nav className="flex flex-col space-y-1">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    className={`px-4 py-3 rounded-2xl text-sm font-semibold uppercase tracking-wider flex items-center justify-between transition ${
                      isActive
                        ? "bg-brand-card text-brand-gold border border-brand-gold/30"
                        : "text-slate-300 hover:bg-brand-card/50 hover:text-white"
                    }`}
                  >
                    <span>{link.name}</span>
                    <ArrowRight size={14} className={isActive ? "text-brand-gold" : "text-slate-600"} />
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Mobile Auth Bottom Panel */}
          <div className="pt-6 border-t border-brand-border/80 space-y-3">
            {user ? (
              <div className="space-y-2">
                {isAdmin ? (
                  <Link
                    href="/admin"
                    onClick={() => setMenuOpen(false)}
                    className="w-full py-3.5 px-4 rounded-2xl bg-brand-gold/20 border border-brand-gold/40 text-brand-gold text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2"
                  >
                    <Shield size={14} /> Open Admin Panel
                  </Link>
                ) : (
                  <Link
                    href="/dashboard"
                    onClick={() => setMenuOpen(false)}
                    className="w-full py-3.5 px-4 rounded-2xl bg-brand-card border border-brand-border text-brand-goldLight text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 hover:border-brand-gold/40 transition"
                  >
                    <User size={14} /> Customer Dashboard
                  </Link>
                )}

                <button
                  onClick={handleLogout}
                  className="w-full py-3 px-4 rounded-2xl border border-rose-500/20 bg-rose-500/10 text-rose-400 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-rose-500/20 transition cursor-pointer"
                >
                  <LogOut size={14} /> Sign Out
                </button>
              </div>
            ) : (
              <Link
                href="/auth"
                onClick={() => setMenuOpen(false)}
                className="w-full py-3.5 rounded-2xl bg-rose-gradient text-brand-dark text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-brand-gold/20"
              >
                Sign In to PixelsSurprise <ArrowRight size={14} />
              </Link>
            )}

            <div className="text-center pt-2">
              <span className="text-[10px] font-mono text-slate-500">
                WhatsApp Support: +91 9112114603
              </span>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}