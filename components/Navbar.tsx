"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { useCart } from "@/context/CartContext";
import { checkIsAdmin } from "@/lib/adminConfig";
import Image from "next/image";
import { User, LogOut, Menu, X, ShoppingBag, Heart } from "lucide-react";
import type { User as SupabaseUser } from "@supabase/supabase-js";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { cart } = useCart();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const isAdmin = checkIsAdmin(user?.email);
  const isActive = (href: string) => pathname === href;

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
    <header className="navbar sticky top-0 z-50">
      {/* Taller bar: 72px on mobile, 96px on desktop */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-[76px] sm:h-[104px] flex items-center justify-between">

        {/* Brand Logo & Name */}
        <Link href={isAdmin ? "/admin" : "/"} className="flex items-center gap-2.5 sm:gap-3.5 group min-w-0">
          <div className="relative w-14 h-14 sm:w-24 sm:h-24 rounded-full overflow-hidden shrink-0 bg-black ring-1 ring-[#e8b4c4]/60 shadow-[0_0_18px_rgba(232,180,196,0.3)] transition-transform group-hover:scale-105">
            <Image
              src="/logo-full.webp"
              alt="PixelsSurprise - Surprise begins here"
              width={192}
              height={192}
              className="w-full h-full object-cover"
              priority
            />
          </div>
          <div className="flex flex-col min-w-0 leading-tight md:hidden xl:flex">
            <span className="nav-brand font-serif text-xl sm:text-3xl font-bold truncate">PixelsSurprise</span>
            <span className="hidden sm:block text-[9px] tracking-[0.32em] uppercase text-brand-goldMuted">
              Surprise begins here
            </span>
          </div>
          {isAdmin && (
            <span className="px-1.5 py-0.5 text-[9px] font-bold tracking-wider uppercase rounded bg-brand-gold/20 text-brand-goldLight border border-brand-gold/40 shrink-0">
              Admin
            </span>
          )}
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-2 text-xs tracking-widest font-semibold uppercase">
          {isAdmin ? (
            <Link href="/admin" className={`nav-link ${isActive("/admin") ? "active" : ""}`}>
              Admin's Dashboard
            </Link>
          ) : (
            <>
              <Link href="/" className={`nav-link ${isActive("/") ? "active" : ""}`}>HOME</Link>
              <Link href="/explore" className={`nav-link ${isActive("/explore") ? "active" : ""}`}>EXPLORE</Link>
              <Link href="/how-it-works" className={`nav-link ${isActive("/how-it-works") ? "active" : ""}`}>HOW IT WORKS</Link>
              <Link href="/book" className={`nav-link ${isActive("/book") ? "active" : ""}`}>BOOK YOURS</Link>
              <Link href="/feedback" className={`nav-link ${isActive("/feedback") ? "active" : ""}`}>REVIEWS</Link>
              {user && (
                <Link href="/track" className={`nav-link ${isActive("/track") ? "active" : ""}`}>TRACK</Link>
              )}
            </>
          )}
        </nav>

        {/* Right Actions: Wishlist, Cart, User Icon/Dashboard & Mobile Menu Toggle */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {!isAdmin && user && (
            <>
              {/* Wishlist Link */}
              <Link 
                href="/wishlist" 
                aria-label="Wishlist"
                title="Your Wishlist"
                className={`p-2 transition ${isActive("/wishlist") ? "text-rose-400" : "text-brand-goldMuted hover:text-brand-goldLight"}`}
              >
                <Heart size={20} fill={isActive("/wishlist") ? "currentColor" : "none"} />
              </Link>

              {/* Cart Link */}
              <Link href="/cart" aria-label="Cart" title="Cart" className="relative p-2 text-brand-goldMuted hover:text-brand-goldLight transition">
                <ShoppingBag size={20} />
                {cartItemCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex items-center justify-center bg-brand-gold text-brand-dark text-[9px] font-bold rounded-full h-4 w-4">
                    {cartItemCount}
                  </span>
                )}
              </Link>
            </>
          )}

          {!loading && (
            user ? (
              <div className="flex items-center gap-1.5">
                {!isAdmin && (
                  <Link
                    href="/dashboard"
                    aria-label="User Dashboard"
                    title="User Dashboard"
                    className="btn-icon p-2.5 rounded-xl flex items-center justify-center"
                  >
                    <User size={18} />
                  </Link>
                )}

                <button
                  onClick={handleSignOut}
                  aria-label="Sign Out"
                  title="Sign Out"
                  className="btn-icon-danger p-2.5 rounded-xl cursor-pointer flex items-center justify-center"
                >
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <Link
                href="/auth"
                aria-label="Sign In"
                title="Sign In"
                className="btn-icon p-2.5 rounded-xl flex items-center justify-center"
              >
                <User size={18} />
              </Link>
            )
          )}

          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-brand-goldMuted hover:text-brand-goldLight transition focus:outline-none"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

      </div>

      {/* Mobile Dropdown Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-brand-dark border-b border-brand-border px-4 py-6 space-y-1 shadow-2xl animate-in fade-in slide-in-from-top-2">
          {isAdmin ? (
            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="nav-link-mobile active text-sm font-semibold tracking-wider uppercase"
            >
              Admin Dashboard
            </Link>
          ) : (
            <>
              <Link
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className={`nav-link-mobile text-xs font-semibold tracking-widest uppercase ${isActive("/") ? "active" : ""}`}
              >
                Home
              </Link>
              <Link
                href="/explore"
                onClick={() => setMobileMenuOpen(false)}
                className={`nav-link-mobile text-xs font-semibold tracking-widest uppercase ${isActive("/explore") ? "active" : ""}`}
              >
                Explore Demos
              </Link>
              <Link
                href="/wishlist"
                onClick={() => setMobileMenuOpen(false)}
                className={`nav-link-mobile text-xs font-semibold tracking-widest uppercase flex items-center gap-2 ${isActive("/wishlist") ? "active text-rose-400" : ""}`}
              >
                <Heart size={14} /> My Wishlist
              </Link>
              <Link
                href="/how-it-works"
                onClick={() => setMobileMenuOpen(false)}
                className={`nav-link-mobile text-xs font-semibold tracking-widest uppercase ${isActive("/how-it-works") ? "active" : ""}`}
              >
                How It Works
              </Link>
              <Link
                href="/book"
                onClick={() => setMobileMenuOpen(false)}
                className={`nav-link-mobile text-xs font-semibold tracking-widest uppercase ${isActive("/book") ? "active" : ""}`}
              >
                Book Yours
              </Link>
              <Link
                href="/feedback"
                onClick={() => setMobileMenuOpen(false)}
                className={`nav-link-mobile text-xs font-semibold tracking-widest uppercase ${isActive("/feedback") ? "active" : ""}`}
              >
                Client Reviews
              </Link>
              {user && (
                <Link
                  href="/track"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`nav-link-mobile text-xs font-semibold tracking-widest uppercase ${isActive("/track") ? "active" : ""}`}
                >
                  Track Orders
                </Link>
              )}
            </>
          )}
        </div>
      )}
    </header>
  );
}