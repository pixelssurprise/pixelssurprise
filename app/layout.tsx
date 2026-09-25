import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { CartProvider } from "@/context/CartContext";

export const metadata: Metadata = {
  title: "PixelsSurprise | Surprise Begins Here",
  description: "Custom interactive surprise websites and royal digital invitations.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-[#080506] text-[#fcebed] antialiased">
        <CartProvider>
          <Navbar />

          {/* Added pt-20 / sm:pt-24 so content doesn't hide under the fixed navbar on mobile */}
          <main className="flex-1 pt-4 sm:pt-6 pb-12 px-4 sm:px-6 max-w-7xl mx-auto w-full">
  {children}
</main>

          {/* Floating WhatsApp Button */}
          <a
            href="https://wa.me/919112114603?text=Hi%20PixelsSurprise%2C%20I%20want%20to%20know%20more%20about%20your%20services!"
            target="_blank"
            rel="noreferrer"
            aria-label="Chat on WhatsApp"
            className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-[#25D366] hover:bg-[#20ba59] text-white rounded-full flex items-center justify-center shadow-lg shadow-black/50 transition-all hover:scale-110 active:scale-95"
          >
            <svg
              className="w-8 h-8 fill-current"
              viewBox="0 0 24 24"
            >
              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
            </svg>
          </a>

          {/* Branded Footer with centered alignment classes on mobile */}
          <footer className="bg-[#080506] border-t border-[#25181b] pt-16 pb-12 text-stone-400">
            <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-10 text-center md:text-left">
              
              {/* Brand Column */}
              <div className="flex flex-col items-center md:items-start">
                <div className="flex items-center gap-3 mb-4">
                  <div className="relative w-8 h-8 rounded-full overflow-hidden border border-[#382328] bg-[#180f12] flex items-center justify-center">
                    <Image
                      src="/logo.jpg"
                      alt="PixelsSurprise Logo"
                      width={32}
                      height={32}
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <span className="font-serif text-xl text-white font-medium">PixelsSurprise</span>
                </div>
                <p className="text-sm text-stone-400 leading-relaxed mb-6">
                  Creating memories into interactive digital keepsake sites. Delivered in 24 hours.
                </p>
                <a
                  href="https://instagram.com/pixelssurprise"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Instagram"
                  className="w-9 h-9 rounded-full border border-[#2e1d21] flex items-center justify-center text-stone-400 hover:text-white hover:border-rose-500/50 transition-colors mx-auto md:mx-0"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </a>
              </div>

              {/* Surprise Websites */}
              <div>
                <h4 className="font-serif text-rose-200 text-sm font-semibold mb-4 tracking-wider">
                  Surprise Websites
                </h4>
                <ul className="space-y-2.5 text-sm">
                  <li><Link href="/explore" className="hover:text-white transition-colors">Birthday Arcades & Letters</Link></li>
                  <li><Link href="/explore" className="hover:text-white transition-colors">Love Story Milestones</Link></li>
                  <li><Link href="/explore" className="hover:text-white transition-colors">Interactive Proposals</Link></li>
                  <li><Link href="/explore" className="hover:text-white transition-colors">Apology Keepsakes</Link></li>
                </ul>
              </div>

              {/* Invitations */}
              <div>
                <h4 className="font-serif text-rose-200 text-sm font-semibold mb-4 tracking-wider">
                  Invitations
                </h4>
                <ul className="space-y-2.5 text-sm">
                  <li><Link href="/explore" className="hover:text-white transition-colors">Royal Wedding Invites</Link></li>
                  <li><Link href="/explore" className="hover:text-white transition-colors">Bappa Agman Invites</Link></li>
                  <li><Link href="/explore" className="hover:text-white transition-colors">Puja & Ceremony Links</Link></li>
                  <li><Link href="/explore" className="hover:text-white transition-colors">Birthday RSVP Pages</Link></li>
                </ul>
              </div>

              {/* Direct Support */}
              <div className="flex flex-col items-center md:items-start">
                <h4 className="font-serif text-rose-200 text-sm font-semibold mb-4 tracking-wider">
                  Direct Support
                </h4>
                <p className="text-sm mb-2">
                  Instagram:{" "}
                  <a href="https://instagram.com/pixelssurprise" target="_blank" rel="noreferrer" className="text-stone-300 hover:underline">
                    @pixelssurprise
                  </a>
                </p>
                <p className="text-sm mb-4">
                  WhatsApp:{" "}
                  <a href="https://wa.me/919112114603" target="_blank" rel="noreferrer" className="text-stone-300 hover:underline">
                    +91 9112114603
                  </a>
                </p>
                <div className="p-3 rounded-lg border border-[#382328] bg-[#140b0d] text-xs text-rose-200/90 leading-relaxed text-center md:text-left">
                  ✨ 50% advance booking. Free revisions until you are completely satisfied.
                </div>
              </div>

            </div>

            <div className="max-w-7xl mx-auto px-6 mt-12 pt-6 border-t border-[#1f1416] flex flex-col sm:flex-row items-center justify-between text-xs text-stone-500 gap-4 text-center">
              <p>© 2026 PixelsSurprise. All rights reserved.</p>
              <p>Crafted with love for extraordinary moments.</p>
            </div>
          </footer>

        </CartProvider>
      </body>
    </html>
  );
}