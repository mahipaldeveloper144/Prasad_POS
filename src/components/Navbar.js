"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useCartStore } from "@/store/useCartStore";
import { useEffect, useState } from "react";
import {
  ShoppingBag,
  Tv,
  LayoutDashboard,
  Menu as MenuIcon,
  Users,
  FileBarChart,
  Settings,
  LogIn,
  LogOut,
  Coffee,
} from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { currentUser, logout } = useCartStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Hydration guard to avoid mismatch between server/client HTML
  if (!mounted) {
    return (
      <header className="bg-coco-dark text-cream-light h-16 flex items-center justify-between px-6 border-b border-coco-medium no-print">
        <div className="flex items-center gap-2">
          <Image src="/prasad%20cold%20coco%20logo%202.png" alt="Prasad Cold Coco" width={180} height={60} className="h-10 w-auto object-contain" priority />
        </div>
      </header>
    );
  }

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const navLinks = [
    { href: "/", label: "POS Cashier", icon: ShoppingBag, role: ["Admin", "Cashier"] },
    { href: "/kitchen", label: "Kitchen TV", icon: Tv, role: ["Admin", "Cashier"] },
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, role: ["Admin"] },
    { href: "/menu", label: "Menu", icon: MenuIcon, role: ["Admin"] },
    { href: "/customers", label: "Customers", icon: Users, role: ["Admin"] },
    { href: "/reports", label: "Reports", icon: FileBarChart, role: ["Admin"] },
    { href: "/settings", label: "Settings", icon: Settings, role: ["Admin"] },
  ];

  // If no user is logged in, restrict to Cashier links as default role is Cashier
  const userRole = currentUser?.role || "Cashier";

  const visibleLinks = navLinks.filter((link) => link.role.includes(userRole));

  return (
    <header className="bg-coco-dark text-cream-light border-b border-coco-medium shadow-md no-print sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center hover:opacity-90 transition-opacity">
            <Image src="/prasad%20cold%20coco%20logo%202.png" alt="Prasad Cold Coco" width={180} height={60} className="h-10 sm:h-12 w-auto object-contain" priority />
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex space-x-1 lg:space-x-2">
            {visibleLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? "bg-coco-accent text-cream-light shadow-sm"
                      : "text-cream-deep hover:bg-coco-medium hover:text-cream-light"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* User Status / Login / Logout */}
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-xs text-cream-deep font-semibold">Logged in as</span>
              <span className="text-sm text-cream-light font-bold">
                {currentUser ? `${currentUser.username} (${currentUser.role})` : "Cashier Mode"}
              </span>
            </div>

            {currentUser ? (
              <button
                onClick={handleLogout}
                className="bg-coco-medium border border-coco-accent/30 text-cream-deep hover:bg-coco-light hover:text-cream-light p-2 rounded-lg transition-colors flex items-center gap-1 text-sm font-medium"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden md:inline">Logout</span>
              </button>
            ) : (
              <Link
                href="/login"
                className="bg-coco-accent text-cream-light hover:bg-coco-light p-2 rounded-lg transition-colors flex items-center gap-1 text-sm font-medium"
              >
                <LogIn className="w-4 h-4" />
                <span className="hidden md:inline">Admin Login</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Nav Bar - Bottom sticky or scrollable for responsiveness */}
      <div className="md:hidden bg-coco-medium border-t border-coco-dark flex items-center justify-around py-2 px-1">
        {visibleLinks.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-md text-xs transition-colors ${
                isActive ? "text-cream-light font-bold bg-coco-accent/40" : "text-cream-deep"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{link.label.split(" ")[0]}</span>
            </Link>
          );
        })}
      </div>
    </header>
  );
}
