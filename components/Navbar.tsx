"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { useCart } from "@/context/CartContext";
import { checkIsAdmin } from "@/lib/adminConfig";
import { User, LogOut, Menu, X, ShoppingBag } from "lucide-react";
import type { User as SupabaseUser } from "@supabase/supabase-js";

export default function Navbar() {
  const router = useRouter();
  const { cart } = useCart();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const isAdmin = checkIsAdmin(user?.email);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    router.push("/auth");
    router.refresh();
  };

  return (
    <header className="navbar sticky top-0 z-50 border-b border-brand-border bg-[#080506]/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        
        {/* Brand Logo & Name */}
        <Link href={isAdmin ? "/admin" : "/"} className="flex items-center gap-2.5 group">
          <div className="relative w-8 h-8 rounded-full overflow-hidden border border-brand-border bg-brand-card flex items-center justify-center shrink-0">
            <Image
              src="/Logo.jpg"
              alt="PixelsSurprise Logo"
              width={32}
              height={32}
              className="object-cover w-full h-full"
              priority
            />
          </div>
          <span className="nav-brand font-serif text-xl sm:text-2xl font-bold">PixelsSurprise</span>
          {isAdmin && (
            <span className="px-2 py-0.5 text-[9px] font-bold tracking-wider uppercase rounded bg-brand-gold/20 text-brand-goldLight border border-brand-gold/40">
              Admin
            </span>
          )}
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-xs tracking-widest font-semibold uppercase">
          {isAdmin ? (
            <Link href="/admin" className="font-bold tracking-wider">Admin's Dashboard</Link>
          ) : (
            <>
              <Link href="/">HOME</Link>
              <Link href="/explore">EXPLORE</Link>
              <Link href="/how-it-works">HOW IT WORKS</Link>
              <Link href="/book">BOOK YOURS</Link>
              {user && <Link href="/track">TRACK</Link>}
            </>
          )}
        </nav>

        {/* Right Actions: Cart, User Icon/Dashboard & Mobile Menu Toggle */}
        <div className="flex items-center gap-3">
          {/* Cart Icon */}
          {!isAdmin && user && (
            <Link href="/cart" className="relative p-2 text-stone-300 hover:text-white transition">
              <ShoppingBag size={20} />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 flex items-center justify-center bg-brand-gold text-brand-dark text-[9px] font-bold rounded-full h-4 w-4">
                  {cartItemCount}
                </span>
              )}
            </Link>
          )}

          {!loading && (
            user ? (
              <div className="flex items-center gap-2">
                {/* User Dashboard Icon Button */}
                {!isAdmin && (
                  <Link
                    href="/dashboard"
                    aria-label="User Dashboard"
                    className="p-2 rounded-full bg-[#180f12] border border-brand-border text-brand-goldLight hover:bg-[#25181b] transition flex items-center justify-center"
                    title="User Dashboard"
                  >
                    <User size={18} />
                  </Link>
                )}

                {/* Sign Out Icon Button */}
                <button
                  onClick={handleSignOut}
                  aria-label="Sign Out"
                  className="p-2 rounded-full bg-rose-950/40 border border-rose-500/30 text-rose-300 hover:bg-rose-900/40 transition cursor-pointer flex items-center justify-center"
                  title="Sign Out"
                >
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <Link
                href="/auth"
                className="btn-primary px-4 py-2 rounded-full text-xs tracking-wider uppercase flex items-center gap-1 font-bold"
              >
                <span>SIGN IN</span>
              </Link>
            )
          )}

          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-stone-300 hover:text-white focus:outline-none"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

      </div>

      {/* Mobile Dropdown Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 right-0 bg-[#080506] border-b border-brand-border px-6 py-6 space-y-4 shadow-2xl animate-in fade-in slide-in-from-top-2">
          {isAdmin ? (
            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-semibold tracking-wider text-brand-goldLight uppercase"
            >
              Admin Dashboard
            </Link>
          ) : (
            <>
              <Link href="/" onClick={() => setMobileMenuOpen(false)} className="block text-xs font-semibold tracking-widest uppercase py-1">Home</Link>
              <Link href="/explore" onClick={() => setMobileMenuOpen(false)} className="block text-xs font-semibold tracking-widest uppercase py-1">Explore Demos</Link>
              <Link href="/how-it-works" onClick={() => setMobileMenuOpen(false)} className="block text-xs font-semibold tracking-widest uppercase py-1">How It Works</Link>
              <Link href="/book" onClick={() => setMobileMenuOpen(false)} className="block text-xs font-semibold tracking-widest uppercase py-1">Book Yours</Link>
              {user && <Link href="/track" onClick={() => setMobileMenuOpen(false)} className="block text-xs font-semibold tracking-widest uppercase py-1">Track Orders</Link>}
            </>
          )}
        </div>
      )}
    </header>
  );
}