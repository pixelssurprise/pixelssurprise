import type { Metadata } from "next";
import { Cormorant_Garamond, Montserrat } from "next/font/google";
import "./globals.css";
import Image from "next/image";
import Link from "next/link";
import { MessageCircle } from "lucide-react";
import Navbar from "@/components/Navbar";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "600", "700"],
  variable: "--font-cormorant",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-montserrat",
});

export const metadata: Metadata = {
  title: "PixelsSurprise | Surprise Begins Here",
  description: "Personalized surprise websites and digital invitations crafted for Instagram.",
};

function InstagramIcon({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${cormorant.variable} ${montserrat.variable} scroll-smooth`}>
      <body
        suppressHydrationWarning
        className="bg-brand-dark text-slate-200 font-sans min-h-screen flex flex-col antialiased selection:bg-brand-gold selection:text-brand-dark"
      >
        {/* Dynamic Auth-Aware Header */}
        <Navbar />

        {/* Dynamic Page Content */}
        <main className="flex-1 relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-dark-glow pointer-events-none" />
          {children}
        </main>

        {/* Floating WhatsApp Action Button */}
        <a
          href="https://wa.me/919112114603?text=Hi%20PixelsSurprise!%20I%20want%20to%20customize%20a%20website"
          target="_blank"
          rel="noreferrer"
          className="fixed bottom-6 right-6 z-50 bg-[#25D366] hover:bg-[#20bd5a] text-white p-3.5 rounded-full shadow-2xl transition transform hover:scale-105 flex items-center gap-2 group"
        >
          <MessageCircle size={22} />
          <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-xs transition-all duration-300 text-xs font-bold font-sans">
            WhatsApp Us
          </span>
        </a>

        {/* Luxury Celestial Dark Footer */}
        <footer className="border-t border-brand-border bg-[#0B0608] pt-14 pb-8 text-xs text-slate-400">
          <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
            {/* Brand Information */}
            <div className="space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full overflow-hidden border border-brand-gold/30 flex-shrink-0">
                  <Image
                    src="/Logo.jpg"
                    alt="PixelsSurprise"
                    width={32}
                    height={32}
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="font-serif text-lg font-bold text-brand-goldLight">PixelsSurprise</span>
              </div>
              <p className="text-slate-400 leading-relaxed text-[11px]">
                Creating memories into interactive digital keepsake sites. Delivered in 24 hours.
              </p>
              <div className="flex gap-3 pt-2">
                <a
                  href="https://instagram.com/pixelssurprise"
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 rounded-full border border-brand-border hover:border-brand-gold text-brand-gold transition"
                >
                  <InstagramIcon size={15} />
                </a>
              </div>
            </div>

            {/* Surprise Sites Links */}
            <div>
              <p className="font-serif text-brand-gold font-bold text-sm tracking-wide mb-3">Surprise Websites</p>
              <ul className="space-y-2 text-[11px]">
                <li>
                  <Link href="/explore" className="hover:text-brand-goldLight transition">
                    Birthday Arcades & Letters
                  </Link>
                </li>
                <li>
                  <Link href="/explore" className="hover:text-brand-goldLight transition">
                    Love Story Milestones
                  </Link>
                </li>
                <li>
                  <Link href="/explore" className="hover:text-brand-goldLight transition">
                    Interactive Proposals
                  </Link>
                </li>
                <li>
                  <Link href="/explore" className="hover:text-brand-goldLight transition">
                    Apology Keepsakes
                  </Link>
                </li>
              </ul>
            </div>

            {/* Digital Invitations Links */}
            <div>
              <p className="font-serif text-brand-gold font-bold text-sm tracking-wide mb-3">Invitations</p>
              <ul className="space-y-2 text-[11px]">
                <li>
                  <Link href="/explore" className="hover:text-brand-goldLight transition">
                    Royal Wedding Invites
                  </Link>
                </li>
                <li>
                  <Link href="/explore" className="hover:text-brand-goldLight transition">
                    Bappa Agman Invites
                  </Link>
                </li>
                <li>
                  <Link href="/explore" className="hover:text-brand-goldLight transition">
                    Puja & Ceremony Links
                  </Link>
                </li>
                <li>
                  <Link href="/explore" className="hover:text-brand-goldLight transition">
                    Birthday RSVP Pages
                  </Link>
                </li>
              </ul>
            </div>

            {/* Support & Guarantee */}
            <div>
              <p className="font-serif text-brand-gold font-bold text-sm tracking-wide mb-3">Direct Support</p>
              <p className="text-[11px] mb-1">
                Instagram: <span className="text-brand-goldLight">@pixelssurprise</span>
              </p>
              <p className="text-[11px] mb-2">
                WhatsApp: <span className="text-brand-goldLight">+91 9112114603</span>
              </p>
              <p className="text-[10px] text-brand-goldMuted border border-brand-border p-2.5 rounded-xl bg-brand-card">
                ✨ 50% advance booking. Free revisions until you are completely satisfied.
              </p>
            </div>
          </div>

          {/* Sub-Footer */}
          <div className="max-w-7xl mx-auto px-6 border-t border-brand-border/40 pt-6 flex flex-col sm:flex-row justify-between text-slate-500 text-[10px]">
            <p>© 2026 PixelsSurprise. All rights reserved.</p>
            <p>Crafted with love for extraordinary occasions.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}