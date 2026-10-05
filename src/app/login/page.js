"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCartStore } from "@/store/useCartStore";
import { verifyAdminPasswordAction, verifyCashierPasswordAction } from "@/app/actions";
import { Shield, User, Lock, KeyRound, ShoppingBag, ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect");

  const { login } = useCartStore();
  const [role, setRole] = useState("Cashier"); // Cashier or Admin
  const [username, setUsername] = useState("Cashier - Prasad");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!pin.trim()) {
      setError("Please enter your password / PIN");
      return;
    }

    setLoading(true);

    if (role === "Admin") {
      const res = await verifyAdminPasswordAction(pin.trim());
      setLoading(false);
      if (res && res.success) {
        login("Admin Owner", "Admin");
        router.push(redirectUrl || "/dashboard");
      } else {
        setError(res?.error || "Invalid Admin Password!");
      }
    } else {
      const res = await verifyCashierPasswordAction(pin.trim());
      setLoading(false);
      if (res && res.success) {
        login(username || "Cashier - Prasad", "Cashier");
        router.push(redirectUrl || "/");
      } else {
        setError(res?.error || "Invalid Cashier Password!");
      }
    }
  };

  return (
    <div className="flex flex-col flex-1 items-center justify-center min-h-screen bg-[#1e120c] font-sans px-4 select-none py-8">
      <div className="max-w-md w-full bg-[#fdfaf7] border border-[#e2d3c1]/40 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col items-center gap-6">
        
        {/* Brand Banner */}
        <div className="text-center flex flex-col items-center gap-2">
          <div className="p-2">
            <Image
              src="/logo-chocolate-nobg.png"
              alt="Prasad Cold Coco"
              width={240}
              height={80}
              className="object-contain"
              priority
            />
          </div>
          <p className="text-xs text-[#8c5b47] font-semibold uppercase tracking-widest mt-0.5">
            STAFF & ADMIN ACCESS PORTAL
          </p>
          {redirectUrl && (
            <span className="text-[11px] bg-amber-100 text-amber-900 border border-amber-300/80 px-2.5 py-1 rounded-full font-bold">
              Staff login required to access {redirectUrl}
            </span>
          )}
        </div>

        {/* Tab Selector */}
        <div className="grid grid-cols-2 gap-2 bg-[#f4ece1] p-1.5 rounded-2xl w-full border border-[#e2d3c1]/40">
          <button
            type="button"
            onClick={() => {
              setRole("Cashier");
              setUsername("Cashier - Prasad");
              setPin("");
              setError("");
            }}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              role === "Cashier"
                ? "bg-white text-[#2d1910] shadow-md"
                : "text-[#8c5b47] hover:text-[#2d1910]"
            }`}
          >
            <User className="w-4 h-4" />
            <span>Cashier POS</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setRole("Admin");
              setUsername("Owner");
              setPin("");
              setError("");
            }}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              role === "Admin"
                ? "bg-[#8c5b47] text-white shadow-md"
                : "text-[#8c5b47] hover:text-[#2d1910]"
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Admin Panel</span>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="w-full flex flex-col gap-4 text-sm">
          {role === "Cashier" ? (
            <>
              <div>
                <label className="text-xs font-bold text-[#8c5b47] block mb-1">Cashier Identity</label>
                <select
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#e2d3c1] focus:outline-none focus:ring-2 focus:ring-[#8c5b47] bg-white font-bold text-coco-dark text-sm"
                >
                  <option value="Cashier - Prasad">Cashier - Prasad</option>
                  <option value="Cashier - Amit">Cashier - Amit</option>
                  <option value="Cashier - Pooja">Cashier - Pooja</option>
                  <option value="Staff Cashier">Staff Cashier</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-[#8c5b47] block mb-1">
                  Cashier PIN / Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8c5b47]" />
                  <input
                    type="password"
                    placeholder="Enter Cashier Password..."
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#e2d3c1] focus:outline-none focus:ring-2 focus:ring-[#8c5b47] font-mono font-bold text-center text-sm bg-white"
                    required
                    autoFocus
                  />
                </div>
                <p className="text-[10px] text-[#8c5b47]/70 mt-1">Configured in Admin Settings &gt; Security</p>
              </div>
            </>
          ) : (
            <div>
              <label className="text-xs font-bold text-[#8c5b47] block mb-1">
                Admin Master Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8c5b47]" />
                <input
                  type="password"
                  placeholder="Enter Admin Password..."
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#e2d3c1] focus:outline-none focus:ring-2 focus:ring-[#8c5b47] font-mono font-bold text-center text-sm bg-white"
                  required
                  autoFocus
                />
              </div>
              <p className="text-[10px] text-[#8c5b47]/70 mt-1">Unlocks settings, reports, dashboard, and menu editor</p>
            </div>
          )}

          {error && (
            <div className="text-red-600 font-bold text-xs bg-red-50 border border-red-200/50 p-2.5 rounded-xl text-center">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3.5 rounded-2xl font-black text-xs text-white shadow-md transition-all active:scale-[0.99] flex items-center justify-center gap-1.5 cursor-pointer ${
              role === "Admin" ? "bg-[#8c5b47] hover:bg-[#a16d57]" : "bg-[#2d1910] hover:bg-[#3d2317]"
            }`}
          >
            <KeyRound className="w-4 h-4" />
            <span>
              {loading
                ? "Verifying Password..."
                : role === "Admin"
                ? "Login to Admin Panel"
                : "Unlock Cashier POS"}
            </span>
          </button>
        </form>

        {/* Customer Self-Order Link */}
        <div className="w-full pt-4 border-t border-[#e2d3c1]/40 flex flex-col items-center gap-2">
          <p className="text-xs text-[#8c5b47] font-semibold text-center">
            Are you a customer wanting to order?
          </p>
          <Link
            href="/"
            className="w-full bg-[#f4ece1] hover:bg-[#ebdcc9] text-[#2d1910] py-2.5 px-4 rounded-xl text-xs font-black transition-colors flex items-center justify-center gap-2 border border-[#e2d3c1]/60"
          >
            <ShoppingBag className="w-4 h-4 text-coco-accent" />
            <span>Open Customer POS Screen</span>
            <ArrowRight className="w-3.5 h-3.5 text-coco-accent" />
          </Link>
        </div>

        <div className="text-center">
          <p className="text-[10px] text-[#8c5b47]/70 font-semibold uppercase tracking-wider">
            Smart Food Cart POS v1.0
          </p>
        </div>

      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#1e120c]" />}>
      <LoginForm />
    </Suspense>
  );
}
