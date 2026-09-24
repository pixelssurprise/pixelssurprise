"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { useCart } from "@/context/CartContext";
import { checkIsAdmin } from "@/lib/adminConfig";
import type { User } from "@supabase/supabase-js";

export default function Navbar() {
  const router = useRouter();
  const { cart } = useCart();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const isAdmin = checkIsAdmin(user?.email);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
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
    <header className="sticky top-0 z-50 bg-[#080506]/95 backdrop-blur-md border-b border-[#25181b]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
        
        {/* Brand Logo & Name */}
        <Link href={isAdmin ? "/admin" : "/"} className="flex items-center gap-3 group">
          <div className="relative w-9 h-9 rounded-full overflow-hidden border border-[#382328] bg-[#180f12] flex items-center justify-center">
            <Image
              src="/logo.jpg"
              alt="PixelsSurprise Logo"
              width={36}
              height={36}
              className="object-cover w-full h-full"
              priority
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-serif text-2xl tracking-wide text-white group-hover:text-rose-200 transition-colors">
              PixelsSurprise
            </span>
            {isAdmin && (
              <span className="px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase rounded bg-rose-500/20 text-rose-300 border border-rose-500/40">
                Admin Panel
              </span>
            )}
          </div>
        </Link>

        {/* Navigation Bar */}
        <nav className="hidden md:flex items-center gap-8 text-xs tracking-widest font-semibold uppercase">
          {isAdmin ? (
            /* ADMIN NAV: Only show admin controls */
            <div className="flex items-center gap-6">
              <Link href="/admin" className="text-rose-300 font-bold tracking-wider hover:text-white transition">
                Admin's Dashboard
              </Link>
              <span className="text-stone-700">|</span>
              <span className="text-stone-400 font-mono text-[11px] lowercase">
                {user?.email}
              </span>
            </div>
          ) : (
            /* REGULAR USER NAV: Show standard customer options */
            <div className="flex items-center gap-8 text-stone-300">
              <Link href="/" className="hover:text-rose-300 transition-colors">
                HOME
              </Link>
              <Link href="/explore" className="hover:text-rose-300 transition-colors">
                EXPLORE DEMOS
              </Link>
              <Link href="/how-it-works" className="hover:text-rose-300 transition-colors">
                HOW IT WORKS
              </Link>
              <Link href="/book" className="hover:text-rose-300 transition-colors">
                BOOK YOURS
              </Link>

              {user && (
                <>
                  <Link href="/track" className="hover:text-rose-300 transition-colors">
                    TRACK ORDERS
                  </Link>
                  <Link
                    href="/cart"
                    className="relative hover:text-rose-300 transition-colors flex items-center gap-1.5"
                  >
                    <span>CART</span>
                    {cartItemCount > 0 && (
                      <span className="inline-flex items-center justify-center bg-rose-500 text-white text-[10px] font-bold rounded-full h-4 w-4">
                        {cartItemCount}
                      </span>
                    )}
                  </Link>
                </>
              )}
            </div>
          )}
        </nav>

        {/* User Auth Controls */}
        <div className="flex items-center gap-4">
          {!loading &&
            (user ? (
              <div className="flex items-center gap-3">
                {!isAdmin && (
                  <Link
                    href="/dashboard"
                    className="text-xs uppercase tracking-wider text-stone-400 hover:text-white transition-colors"
                  >
                    Dashboard
                  </Link>
                )}

                <button
                  onClick={handleSignOut}
                  className="px-4 py-2 rounded-full border border-[#382328] bg-[#180f12] text-xs font-semibold uppercase tracking-wider text-stone-300 hover:bg-[#25181b] hover:text-white transition-all cursor-pointer"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <Link
                href="/auth"
                className="px-6 py-2.5 rounded-full bg-gradient-to-r from-rose-200 via-rose-300 to-rose-400 text-stone-900 font-semibold text-xs tracking-widest uppercase hover:opacity-95 transition-opacity shadow-md shadow-rose-950/40 flex items-center gap-1.5"
              >
                <span>SIGN IN</span>
                <span>→</span>
              </Link>
            ))}
        </div>
      </div>
    </header>
  );
}