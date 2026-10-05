"use client";

import { useEffect, useState } from "react";
import { useCartStore } from "@/store/useCartStore";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { ShieldAlert, LogIn, ShoppingBag, Loader2 } from "lucide-react";

export default function StaffGuard({ children }) {
  const { currentUser } = useCartStore();
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  const isStaff = currentUser?.role === "Admin" || currentUser?.role === "Cashier";

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !isStaff) {
      // Direct link redirection for unauthenticated customers
      const timer = setTimeout(() => {
        router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [mounted, isStaff, pathname, router]);

  if (!mounted) {
    return <div className="min-h-screen bg-[#1e120c]"></div>;
  }

  if (!isStaff) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#1e120c] font-sans px-4 select-none">
        <div className="max-w-md w-full bg-[#fdfaf7] border border-[#e2d3c1]/40 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col items-center text-center gap-5">
          <div className="bg-amber-100 p-4 rounded-full text-amber-700">
            <ShieldAlert className="w-10 h-10 animate-bounce" />
          </div>
          <div>
            <h2 className="text-xl font-black text-[#2d1910] uppercase tracking-wide">
              Staff Access Only
            </h2>
            <p className="text-xs text-[#8c5b47] font-semibold mt-1">
              Kitchen Display is reserved for Cashier and Admin staff. Customers can place orders directly from the POS screen.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-bold text-coco-accent bg-cream-base/50 px-3 py-1.5 rounded-full">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span>Redirecting to Staff Login...</span>
          </div>

          <div className="flex gap-3 w-full mt-1 text-xs">
            <Link
              href={`/login?redirect=${encodeURIComponent(pathname)}`}
              className="flex-1 bg-[#8c5b47] hover:bg-[#a16d57] text-white py-2.5 rounded-xl font-bold shadow-md transition-colors flex items-center justify-center gap-1.5"
            >
              <LogIn className="w-4 h-4" />
              <span>Staff Login</span>
            </Link>
            <Link
              href="/"
              className="flex-1 bg-[#f4ece1] hover:bg-[#e2d3c3] text-[#2d1910] py-2.5 rounded-xl font-bold border border-[#e2d3c1]/30 transition-colors flex items-center justify-center gap-1.5"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Back to POS</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return children;
}
