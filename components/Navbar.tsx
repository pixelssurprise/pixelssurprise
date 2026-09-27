"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { useCart } from "@/context/CartContext";
import { checkIsAdmin } from "@/lib/adminConfig";
import { User, LogOut, Menu, X, ShoppingBag } from "lucide-react";
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
    // .navbar already supplies background/blur/border — the extra
    // border-brand-border + bg-[#080506]/95 on this element were redundant
    // with (and in the bg case, fighting) that class, so they're dropped.
    <header className="navbar sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-16 flex items-center justify-between">

        {/* Brand Logo & Name */}
        <Link href={isAdmin ? "/admin" : "/"} className="flex items-center gap-2 group min-w-0">
          <div className="relative w-7 h-7 sm:w-8 sm:h-8 rounded-full overflow-hidden border border-brand-border bg-brand-card flex items-center justify-center shrink-0">
  <Image
    src="/Logo.png"
    alt="PixelsSurprise Logo"
    width={64}
    height={64}
    className="object-cover w-full h-full"
    priority
  />
</div>
          <span className="nav-brand font-serif text-base sm:text-2xl font-bold truncate">PixelsSurprise</span>
          {isAdmin && (
            <span className="px-1.5 py-0.5 text-[9px] font-bold tracking-wider uppercase rounded bg-brand-gold/20 text-brand-goldLight border border-brand-gold/40 shrink-0">
              Admin
            </span>
          )}
        </Link>

        {/* Desktop Navigation Links — rose pill hover/active, no underline, no hardcoded grey */}
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
              {user && (
                <Link href="/track" className={`nav-link ${isActive("/track") ? "active" : ""}`}>TRACK</Link>
              )}
            </>
          )}
        </nav>

        {/* Right Actions: Cart, User Icon/Dashboard & Mobile Menu Toggle */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {!isAdmin && user && (
            <Link href="/cart" className="relative p-2 text-brand-goldMuted hover:text-brand-goldLight transition">
              <ShoppingBag size={18} />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 flex items-center justify-center bg-brand-gold text-brand-dark text-[9px] font-bold rounded-full h-4 w-4">
                  {cartItemCount}
                </span>
              )}
            </Link>
          )}

          {!loading && (
            user ? (
              <div className="flex items-center gap-1.5">
                {!isAdmin && (
                  <Link
                    href="/dashboard"
                    aria-label="User Dashboard"
                    title="User Dashboard"
                    className="btn-icon p-2 rounded-xl flex items-center justify-center"
                  >
                    <User size={17} />
                  </Link>
                )}

                <button
                  onClick={handleSignOut}
                  aria-label="Sign Out"
                  title="Sign Out"
                  className="btn-icon-danger p-2 rounded-xl cursor-pointer flex items-center justify-center"
                >
                  <LogOut size={17} />
                </button>
              </div>
            ) : (
              <Link
                href="/auth"
                aria-label="Sign In"
                title="Sign In"
                className="btn-icon p-2 rounded-xl flex items-center justify-center"
              >
                <User size={17} />
              </Link>
            )
          )}

          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-brand-goldMuted hover:text-brand-goldLight transition focus:outline-none"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

      </div>

      {/* Mobile Dropdown Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 right-0 bg-brand-dark border-b border-brand-border px-4 py-6 space-y-1 shadow-2xl animate-in fade-in slide-in-from-top-2">
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