"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/useCartStore";
import { verifyAdminPasswordAction } from "@/app/actions";
import { Coffee, Shield, User, Lock, KeyRound } from "lucide-react";
import Image from "next/image";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useCartStore();
  const [role, setRole] = useState("Cashier"); // Cashier or Admin
  const [username, setUsername] = useState("Cashier-1");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (role === "Admin") {
      setLoading(true);
      const res = await verifyAdminPasswordAction(pin);
      setLoading(false);
      if (res && res.success) {
        login("Admin Owner", "Admin");
        router.push("/dashboard");
      } else {
        setError(res?.error || "Invalid Admin Password!");
      }
    } else {
      login(username || "Cashier-1", "Cashier");
      router.push("/");
    }
  };

  return (
    <div className="flex flex-col flex-1 items-center justify-center min-h-screen bg-[#1e120c] font-sans px-4 select-none">
      <div className="max-w-md w-full bg-[#fdfaf7] border border-[#e2d3c1]/40 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col items-center gap-6">
        
        {/* Brand Banner */}
        <div className="text-center flex flex-col items-center gap-2">
          <div className="p-2">
            <Image src="/logo-chocolate-nobg.png" alt="Prasad Cold Coco" width={240} height={80} className="object-contain" priority />
          </div>
          <p className="text-xs text-[#8c5b47] font-semibold uppercase tracking-widest mt-0.5">
            WELCOME BACK TO PRASAD COLD COCO
          </p>
        </div>

        {/* Tab Selector */}
        <div className="grid grid-cols-2 gap-2 bg-[#f4ece1] p-1.5 rounded-2xl w-full border border-[#e2d3c1]/40">
          <button
            type="button"
            onClick={() => {
              setRole("Cashier");
              setUsername("Cashier-1");
              setError("");
            }}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
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
              setError("");
            }}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
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
            <div>
              <label className="text-xs font-bold text-[#8c5b47] block mb-1">Cashier Identity</label>
              <select
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#e2d3c1] focus:outline-none focus:ring-2 focus:ring-[#8c5b47] bg-white font-bold"
              >
                <option value="Cashier-1">Cashier - Prasad</option>
                <option value="Cashier-2">Cashier - Amit</option>
                <option value="Cashier-3">Cashier - Pooja</option>
              </select>
            </div>
          ) : (
            <div>
              <label className="text-xs font-bold text-[#8c5b47] block mb-1">
                Admin Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8c5b47]" />
                <input
                  type="password"
                  placeholder="Enter Admin Password..."
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#e2d3c1] focus:outline-none focus:ring-2 focus:ring-[#8c5b47] tracking-wider font-extrabold text-center text-base"
                  required
                />
              </div>
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
            className={`w-full py-3.5 rounded-2xl font-black text-xs text-white shadow-md transition-all active:scale-[0.99] flex items-center justify-center gap-1.5 ${
              role === "Admin" ? "bg-[#8c5b47] hover:bg-[#a16d57]" : "bg-[#2d1910] hover:bg-[#3d2317]"
            }`}
          >
            <KeyRound className="w-4 h-4" />
            <span>
              {loading
                ? "Verifying Password..."
                : role === "Admin"
                ? "Login to Admin Panel"
                : "Open POS Cashier Screen"}
            </span>
          </button>
        </form>

        <div className="text-center">
          <p className="text-[10px] text-[#8c5b47]/70 font-semibold uppercase tracking-wider">
            Smart Food Cart POS v1.0
          </p>
        </div>

      </div>
    </div>
  );
}
