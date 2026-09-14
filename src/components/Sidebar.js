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
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const { currentUser, logout } = useCartStore();

  const [mounted, setMounted] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  // Prevent hydration mismatch & load saved preference
  useEffect(() => {
    setMounted(true);
    try {
      const saved = localStorage.getItem("prasad_sidebar_collapsed");
      if (saved !== null) {
        setCollapsed(saved === "true");
      }
    } catch {
      // ignore storage access errors
    }
  }, []);

  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("prasad_sidebar_collapsed", String(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const navLinks = [
    {
      href: "/",
      label: "POS Cashier",
      icon: ShoppingBag,
      role: ["Admin", "Cashier"],
    },
    {
      href: "/kitchen",
      label: "Kitchen TV",
      icon: Tv,
      role: ["Admin", "Cashier"],
    },
    {
      href: "/dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      role: ["Admin"],
    },
    {
      href: "/menu",
      label: "Menu",
      icon: MenuIcon,
      role: ["Admin"],
    },
    {
      href: "/customers",
      label: "Customers",
      icon: Users,
      role: ["Admin"],
    },
    {
      href: "/reports",
      label: "Reports",
      icon: FileBarChart,
      role: ["Admin"],
    },
    {
      href: "/settings",
      label: "Settings",
      icon: Settings,
      role: ["Admin"],
    },
  ];

  const userRole = currentUser?.role || "Cashier";

  const visibleLinks = navLinks.filter((link) =>
    link.role.includes(userRole)
  );

  const isActiveLink = (href) => {
    if (href === "/") {
      return pathname === "/";
    }

    return pathname === href || pathname.startsWith(`${href}/`);
  };

  // Hide sidebar on Login page
  if (pathname === "/login") {
    return null;
  }

  // Before client mount
  if (!mounted) {
    return (
      <aside className="hidden md:flex flex-col w-64 bg-coco-dark text-cream-light border-r border-coco-medium shadow-xl no-print h-screen sticky top-0 z-40 shrink-0">
        <div className="p-4 border-b border-[#FCF4E3] flex justify-center">
          <Image
            src="/prasad%20cold%20coco%20logo%202.png"
            alt="Prasad Cold Coco"
            width={180}
            height={60}
            className="h-12 w-auto object-contain"
            priority
          />
        </div>
      </aside>
    );
  }

  return (
    <>
      {/* ================================
          MOBILE MENU BUTTON
      ================================= */}
      <button
        type="button"
        onClick={() => setSidebarOpen((prev) => !prev)}
        className="md:hidden fixed top-3 left-3 z-[60] p-2 rounded-lg bg-coco-medium text-cream-light hover:bg-coco-accent transition-colors shadow-md no-print"
        aria-label="Toggle sidebar"
        aria-expanded={sidebarOpen}
      >
        <MenuIcon className="w-6 h-6" />
      </button>

      {/* ================================
          MOBILE SIDEBAR OVERLAY
      ================================= */}
      {sidebarOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-40 no-print"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ================================
          MOBILE SIDEBAR
      ================================= */}
      <aside
        className={`md:hidden fixed top-0 left-0 bottom-0 z-50 w-72 bg-coco-dark text-cream-light border-r border-coco-medium shadow-2xl no-print transform transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo */}
        <div className="p-4 border-b border-[#FCF4E3] flex justify-center">
          <Link
            href="/"
            onClick={() => setSidebarOpen(false)}
            className="hover:opacity-90 transition-opacity"
          >
            <Image
              src="/prasad%20cold%20coco%20logo%202.png"
              alt="Prasad Cold Coco"
              width={180}
              height={60}
              className="h-12 w-auto object-contain"
              priority
            />
          </Link>
        </div>

        {/* Mobile Navigation */}
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {visibleLinks.map((link) => {
            const Icon = link.icon;
            const isActive = isActiveLink(link.href);

            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                  isActive
                    ? "bg-coco-accent text-cream-light shadow-md"
                    : "text-cream-deep hover:bg-coco-medium hover:text-cream-light"
                }`}
              >
                <Icon className="w-5 h-5 shrink-0" />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Mobile User Section */}
        <div className="p-4 border-t border-coco-medium/50 space-y-4">
          <div className="flex flex-col">
            <span className="text-xs text-cream-deep font-semibold">
              Logged in as
            </span>

            <span className="text-sm text-cream-light font-bold truncate">
              {currentUser
                ? `${currentUser.username} (${currentUser.role})`
                : "Cashier Mode"}
            </span>
          </div>

          {currentUser ? (
            <button
              type="button"
              onClick={handleLogout}
              className="w-full bg-coco-medium border border-coco-accent/30 text-cream-deep hover:bg-coco-light hover:text-cream-light p-3 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm font-bold shadow-sm"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          ) : (
            <Link
              href="/login"
              onClick={() => setSidebarOpen(false)}
              className="w-full bg-coco-accent text-cream-light hover:bg-coco-light p-3 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm font-bold shadow-sm"
            >
              <LogIn className="w-4 h-4" />
              <span>Admin Login</span>
            </Link>
          )}
        </div>
      </aside>

      {/* ================================
          DESKTOP SIDEBAR (EXPANDABLE / COLLAPSIBLE)
      ================================= */}
      <aside
        className={`hidden md:flex flex-col bg-coco-dark text-cream-light border-r border-coco-medium shadow-xl no-print h-screen sticky top-0 z-40 shrink-0 transition-all duration-300 ease-in-out ${
          collapsed ? "w-20" : "w-64"
        }`}
      >
        {/* Header: Logo & Toggle Button */}
        <div className="p-3 border-b border-[#FCF4E3] flex items-center justify-between min-h-[72px] gap-1">
          {!collapsed ? (
            <>
              <Link
                href="/"
                className="hover:opacity-90 transition-opacity flex-1 overflow-hidden"
              >
                <Image
                  src="/prasad%20cold%20coco%20logo%202.png"
                  alt="Prasad Cold Coco"
                  width={150}
                  height={50}
                  className="h-11 w-auto object-contain"
                  priority
                />
              </Link>
              <button
                type="button"
                onClick={toggleCollapsed}
                className="p-2 rounded-xl text-cream-deep hover:text-cream-light hover:bg-coco-medium transition-colors cursor-pointer"
                title="Collapse sidebar (Show icons only)"
                aria-label="Collapse sidebar"
              >
                <PanelLeftClose className="w-5 h-5" />
              </button>
            </>
          ) : (
            <div className="w-full flex flex-col items-center gap-2">
              <button
                type="button"
                onClick={toggleCollapsed}
                className="p-2 rounded-xl text-cream-light bg-coco-medium hover:bg-coco-accent transition-colors shadow-xs cursor-pointer"
                title="Expand sidebar (Show text)"
                aria-label="Expand sidebar"
              >
                <PanelLeftOpen className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>

        {/* Desktop Navigation Links */}
        <div className="flex-1 py-4 px-2 space-y-1.5">
          {visibleLinks.map((link) => {
            const Icon = link.icon;
            const isActive = isActiveLink(link.href);

            return (
              <div key={link.href} className="relative group">
                <Link
                  href={link.href}
                  className={`flex items-center rounded-xl font-bold transition-all ${
                    collapsed
                      ? "justify-center p-3 text-center"
                      : "gap-3 px-3.5 py-3 text-sm"
                  } ${
                    isActive
                      ? "bg-coco-accent text-cream-light shadow-md"
                      : "text-cream-deep hover:bg-coco-medium hover:text-cream-light"
                  }`}
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  {!collapsed && <span className="truncate">{link.label}</span>}
                </Link>

                {/* Floating Tooltip in Collapsed Mode */}
                {collapsed && (
                  <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-coco-dark text-cream-light text-xs font-bold rounded-lg shadow-xl border border-coco-medium whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity z-50">
                    {link.label}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Desktop User Section */}
        {!collapsed ? (
          <div className="p-4 border-t border-coco-medium/50 space-y-3">
            <div className="flex flex-col">
              <span className="text-xs text-cream-deep font-semibold">
                Logged in as
              </span>
              <span className="text-sm text-cream-light font-bold truncate">
                {currentUser
                  ? `${currentUser.username} (${currentUser.role})`
                  : "Cashier Mode"}
              </span>
            </div>

            {currentUser ? (
              <button
                type="button"
                onClick={handleLogout}
                className="w-full bg-coco-medium border border-coco-accent/30 text-cream-deep hover:bg-coco-light hover:text-cream-light p-2.5 rounded-xl transition-colors flex items-center justify-center gap-2 text-xs font-bold shadow-sm cursor-pointer"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            ) : (
              <Link
                href="/login"
                className="w-full bg-coco-accent text-cream-light hover:bg-coco-light p-2.5 rounded-xl transition-colors flex items-center justify-center gap-2 text-xs font-bold shadow-sm"
              >
                <LogIn className="w-4 h-4" />
                <span>Admin Login</span>
              </Link>
            )}
          </div>
        ) : (
          <div className="p-3 border-t border-coco-medium/50 flex flex-col items-center gap-2.5">
            {/* Collapsed user badge */}
            <div className="relative group flex items-center justify-center">
              <div className="w-9 h-9 rounded-xl bg-coco-medium text-cream-light flex items-center justify-center font-black text-xs border border-coco-accent/40 shadow-xs cursor-default">
                {currentUser?.username
                  ? currentUser.username.charAt(0).toUpperCase()
                  : "C"}
              </div>
              <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-coco-dark text-cream-light text-xs font-bold rounded-lg shadow-xl border border-coco-medium whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50">
                {currentUser
                  ? `${currentUser.username} (${currentUser.role})`
                  : "Cashier Mode"}
              </div>
            </div>

            {currentUser ? (
              <div className="relative group">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-9 h-9 bg-coco-medium border border-coco-accent/30 text-cream-deep hover:bg-coco-light hover:text-cream-light rounded-xl transition-colors flex items-center justify-center shadow-sm cursor-pointer"
                  aria-label="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
                <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-coco-dark text-cream-light text-xs font-bold rounded-lg shadow-xl border border-coco-medium whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50">
                  Logout
                </div>
              </div>
            ) : (
              <div className="relative group">
                <Link
                  href="/login"
                  className="w-9 h-9 bg-coco-accent text-cream-light hover:bg-coco-light rounded-xl transition-colors flex items-center justify-center shadow-sm"
                  aria-label="Admin Login"
                >
                  <LogIn className="w-4 h-4" />
                </Link>
                <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-coco-dark text-cream-light text-xs font-bold rounded-lg shadow-xl border border-coco-medium whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50">
                  Admin Login
                </div>
              </div>
            )}
          </div>
        )}
      </aside>

      {/* ================================
          MOBILE BOTTOM NAVIGATION
      ================================= */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-coco-dark border-t border-coco-medium z-30 flex items-center justify-around pt-2 pb-4 px-1 shadow-[0_-4px_10px_rgba(0,0,0,0.2)] no-print">
        {visibleLinks.slice(0, 5).map((link) => {
          const Icon = link.icon;
          const isActive = isActiveLink(link.href);

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex flex-col items-center gap-1 p-2 rounded-lg text-[10px] sm:text-xs transition-colors ${
                isActive
                  ? "text-cream-light font-bold bg-coco-accent/40"
                  : "text-cream-deep"
              }`}
            >
              <Icon className="w-5 h-5 sm:w-6 sm:h-6" />

              <span className="truncate max-w-[60px] text-center">
                {link.label.split(" ")[0]}
              </span>
            </Link>
          );
        })}
      </div>
    </>
  );
}