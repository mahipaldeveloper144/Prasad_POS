"use client";

import { useEffect, useState } from "react";
import { useCartStore } from "@/store/useCartStore";
import Link from "next/link";
import { ShieldAlert, LogIn, ShoppingBag } from "lucide-react";

export default function AdminGuard({ children }) {
  const { currentUser } = useCartStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="min-h-screen bg-cream-light"></div>;
  }

  if (currentUser?.role !== "Admin") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#1e120c] font-sans px-4">
        <div className="max-w-md w-full bg-[#fdfaf7] border border-[#e2d3c1]/40 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col items-center text-center gap-5">
          <div className="bg-red-100 p-4 rounded-full text-red-600">
            <ShieldAlert className="w-10 h-10 animate-bounce" />
          </div>
          <div>
            <h2 className="text-xl font-black text-[#2d1910] uppercase tracking-wide">
              Admin Access Sealed
            </h2>
            <p className="text-xs text-[#8c5b47] font-semibold mt-1">
              You are currently in Cashier Mode. Please login with an Admin PIN to unlock these analytics, configurations, and reports.
            </p>
          </div>
          <div className="flex gap-3 w-full mt-2 text-xs">
            <Link
              href="/login"
              className="flex-1 bg-[#8c5b47] hover:bg-[#a16d57] text-white py-2.5 rounded-xl font-bold shadow-md transition-colors flex items-center justify-center gap-1.5"
            >
              <LogIn className="w-4 h-4" />
              <span>Login as Admin</span>
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
