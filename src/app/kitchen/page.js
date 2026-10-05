"use client";

import { useEffect, useState, useRef } from "react";
import { fetchOrdersAction, updateOrderStatusAction } from "@/app/actions";
import { Tv, Volume2, VolumeX, Maximize, Play, Check, ChevronRight, RefreshCw, Clock } from "lucide-react";
import Link from "next/link";
import StaffGuard from "@/components/StaffGuard";

export default function KitchenDisplay() {
  const [orders, setOrders] = useState([]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const prevOrderCountRef = useRef(0);
  const beepAudioRef = useRef(null);
  const containerRef = useRef(null);

  // Load orders
  const loadOrders = async (isInitial = false) => {
    setLoading(true);
    const dbOrders = await fetchOrdersAction();
    setLoading(false);
    if (dbOrders) {
      // Filter orders relevant to the kitchen (New, Preparing, Ready)
      const activeOrders = dbOrders.filter((o) =>
        ["New", "Preparing", "Ready"].includes(o.status)
      );

      // Play sound alert if a new order arrives (compare sizes)
      if (!isInitial && activeOrders.length > prevOrderCountRef.current) {
        const hasNewOrder = activeOrders.some(o => o.status === "New");
        if (hasNewOrder && soundEnabled && beepAudioRef.current) {
          beepAudioRef.current.play().catch(() => {});
        }
      }
      
      setOrders(activeOrders);
      prevOrderCountRef.current = activeOrders.length;
    }
  };

  // Poll orders every 5 seconds
  useEffect(() => {
    loadOrders(true);
    const interval = setInterval(() => {
      loadOrders(false);
    }, 5000);
    return () => clearInterval(interval);
  }, [soundEnabled]);

  // Handle advancing order status
  const handleAdvanceStatus = async (orderId, currentStatus) => {
    let nextStatus = "Completed";
    if (currentStatus === "New") nextStatus = "Preparing";
    else if (currentStatus === "Preparing") nextStatus = "Ready";
    else if (currentStatus === "Ready") nextStatus = "Completed";

    setOrders((prev) =>
      prev.map((o) => (o.id === orderId || o._id === orderId ? { ...o, status: nextStatus } : o))
    );

    await updateOrderStatusAction(orderId, nextStatus);
    loadOrders(false);
  };

  // Toggle fullscreen mode
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch((err) => {
        console.error("Error enabling fullscreen", err);
      });
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFsChange);
    return () => document.removeEventListener("fullscreenchange", handleFsChange);
  }, []);

  // Split orders into columns
  const preparingOrders = orders.filter((o) => ["New", "Preparing"].includes(o.status));
  const readyOrders = orders.filter((o) => o.status === "Ready");

  // Format order timer
  const getOrderAge = (createdAt) => {
    const minutes = Math.floor((new Date() - new Date(createdAt)) / 60000);
    if (minutes < 1) return "Just now";
    return `${minutes} min ago`;
  };

  return (
    <StaffGuard>
      <div
        ref={containerRef}
        className="dark-theme-kds flex flex-col min-h-screen md:h-screen bg-[#3F1A13] text-[#fcf8f6] font-sans overflow-y-auto md:overflow-hidden select-none"
      >
      {/* Hidden audio beep */}
      <audio
        ref={beepAudioRef}
        src="/notification%20for%20POS.wav"
        preload="auto"
      ></audio>

      {/* KDS Header */}
      <header className="flex items-center justify-between pl-14 pr-3 sm:px-6 py-2.5 sm:py-3.5 bg-[#21120a] border-b border-[#331d12] shadow-md shrink-0 gap-2">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="bg-[#8c5b47] p-1.5 sm:p-2 rounded-xl text-white shrink-0">
            <Tv className="w-5 h-5 sm:w-6 sm:h-6 animate-pulse" />
          </div>
          <div className="min-w-0">
            <h1 className="text-sm sm:text-lg md:text-xl font-black tracking-wide uppercase truncate text-white leading-tight">
              <span className="sm:hidden">Kitchen TV</span>
              <span className="hidden sm:inline">Kitchen Display System</span>
            </h1>
            <p className="text-[10px] sm:text-xs text-[#e2d3c1] font-semibold flex items-center gap-1.5 truncate">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-ping shrink-0"></span>
              <span className="sm:hidden">Live &bull; Auto-sync</span>
              <span className="hidden sm:inline">Live TV Mode &bull; Auto-refreshing</span>
            </p>
          </div>
        </div>

        {/* Action controls */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          {/* Refresh button */}
          <button
            onClick={() => loadOrders(false)}
            className="bg-[#331d12] hover:bg-[#4d2d1d] active:scale-95 text-[#fcf8f6] p-2 sm:p-2.5 rounded-xl border border-[#4d2d1d]/40 transition-all shadow-sm"
            title="Force Refresh"
            aria-label="Force Refresh"
          >
            <RefreshCw className={`w-4 h-4 sm:w-5 sm:h-5 ${loading ? "animate-spin" : ""}`} />
          </button>

          {/* Sound toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2 sm:px-3.5 sm:py-2.5 rounded-xl border transition-all active:scale-95 flex items-center gap-1.5 text-xs sm:text-sm font-bold shadow-sm ${
              soundEnabled
                ? "bg-[#331d12] hover:bg-[#4d2d1d] text-[#fcf8f6] border-[#4d2d1d]/40"
                : "bg-red-950/40 hover:bg-red-900/40 text-red-300 border-red-800/40"
            }`}
            title={soundEnabled ? "Sound Enabled" : "Sound Muted"}
            aria-label={soundEnabled ? "Mute Sound" : "Enable Sound"}
          >
            {soundEnabled ? (
              <>
                <Volume2 className="w-4 h-4 sm:w-5 sm:h-5 text-green-400 shrink-0" />
                <span className="hidden sm:inline">Sound On</span>
              </>
            ) : (
              <>
                <VolumeX className="w-4 h-4 sm:w-5 sm:h-5 text-red-400 shrink-0" />
                <span className="hidden sm:inline">Muted</span>
              </>
            )}
          </button>

          {/* Fullscreen button */}
          <button
            onClick={toggleFullscreen}
            className="bg-[#8c5b47] hover:bg-[#a16d57] active:scale-95 text-white p-2 sm:px-3.5 sm:py-2.5 rounded-xl transition-all flex items-center gap-1.5 text-xs sm:text-sm font-extrabold shadow-md"
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
            aria-label={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
          >
            <Maximize className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
            <span className="hidden sm:inline">{isFullscreen ? "Exit TV" : "TV Mode"}</span>
          </button>

          {/* Back link - desktop only */}
          <Link
            href="/"
            className="hidden md:flex text-[#e2d3c1] hover:text-white px-3 py-2 text-sm font-bold border-l border-[#331d12] transition-colors"
          >
            POS Screen
          </Link>
        </div>
      </header>

      {/* Kanban Grid */}
      <main className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 p-3 sm:p-6 pb-24 md:pb-6 overflow-y-auto md:overflow-hidden min-h-0">
        {/* COLUMN 1: Preparing */}
        <section className="flex flex-col bg-[#21120a]/40 border border-[#F7E1B8] rounded-3xl p-5 overflow-hidden">
          <div className="flex justify-between items-center pb-3 border-b border-[#331d12] shrink-0">
            <h2 className="text-lg font-black tracking-wide uppercase flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-orange-500"></span>
              Preparing / New Queue
            </h2>
            <span className="bg-orange-500/20 text-orange-400 font-extrabold text-sm px-3 py-1 rounded-full">
              {preparingOrders.length} orders
            </span>
          </div>

          <div className="flex-1 overflow-y-auto mt-4 pr-1 space-y-4">
            {preparingOrders.length > 0 ? (
              preparingOrders.map((order) => {
                const isNew = order.status === "New";
                return (
                  <div
                    key={order.id || order._id}
                    className={`bg-[#21120a]/40 border rounded-2xl p-5 shadow-md flex flex-col justify-between transition-all ${
                      isNew
                        ? "border-[#8c5b47] animate-new-order"
                        : "border-[#331d12] hover:border-[#4d2d1d]"
                    }`}
                  >
                    {/* Card Header */}
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xl font-black text-white">
                            {order.orderNumber}
                          </span>
                          <span className={`text-xs font-black px-2.5 py-0.5 rounded-md border ${
                            order.type === "Parcel"
                              ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                              : order.type === "At Cart"
                              ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                              : "bg-[#331d12] text-[#e2d3c1] border-[#8c5b47]/40"
                          }`}>
                            {order.type === "Parcel" ? "📦 Parcel" : order.type === "At Cart" ? "🥤 At Cart" : order.type}
                          </span>
                        </div>
                        <h3 className="font-extrabold text-base text-[#e2d3c1] mt-1">
                          {order.customerName}
                        </h3>
                      </div>
                      <div className="text-right flex flex-col items-end">
                        <span className="text-xs text-[#8c5b47] font-extrabold flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" />
                          {getOrderAge(order.createdAt)}
                        </span>
                        {isNew && (
                          <span className="text-[10px] text-white font-extrabold tracking-wide uppercase bg-[#8c5b47] px-2 py-0.5 rounded mt-1">
                            New Order
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Card Items List */}
                    <div className="my-4 border-t border-b border-[#331d12]/50 py-3 space-y-3">
                      {order.items.map((item, idx) => {
                        const parcelCount = item.parcelQty !== undefined ? item.parcelQty : (item.orderMode === "PARCEL" ? (item.quantity || 1) : 0);
                        const atCartCount = item.atCartQty !== undefined ? item.atCartQty : (item.orderMode === "AT_CART" || !item.orderMode ? (item.quantity || 1) : 0);
                        const totalCount = item.totalQty !== undefined ? item.totalQty : (item.quantity || (parcelCount + atCartCount));

                        return (
                          <div key={idx} className="flex flex-col gap-1 pb-2 border-b border-[#331d12]/40 last:border-0 last:pb-0">
                            <div className="flex justify-between items-center text-[#fcf8f6]">
                              <div className="flex items-center gap-2 flex-1 flex-wrap">
                                <span className="font-extrabold text-base sm:text-lg">
                                  {item.name}
                                </span>
                                <span className={`text-xs font-black px-2 py-0.5 rounded-md border ${
                                  item.size === "200 ml"
                                    ? "bg-amber-400/20 text-amber-300 border-amber-400/40"
                                    : "bg-[#e2d3c1]/20 text-[#fcf8f6] border-[#e2d3c1]/30"
                                }`}>
                                  🥛 {item.size || "250 ml"}
                                </span>
                              </div>
                              <span className="text-xs font-black bg-[#331d12] text-white-200 px-2.5 py-0.5 rounded-md border border-[#8c5b47]/40">
                                Total: {totalCount}
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-2 mt-0.5">
                              {parcelCount > 0 && (
                                <span className="text-xs font-black px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/50 flex items-center gap-1.5 shadow-sm">
                                  <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                                  📦 Parcel: {parcelCount}
                                </span>
                              )}
                              {atCartCount > 0 && (
                                <span className="text-xs font-black px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 flex items-center gap-1.5 shadow-sm">
                                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                                  🥤 At Cart: {atCartCount}
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                      {order.notes && (
                        <div className="mt-2 text-sm text-[#8c5b47] bg-[#331d12]/50 px-3 py-1.5 rounded-lg font-bold border-l-2 border-[#8c5b47]">
                          Note: {order.notes}
                        </div>
                      )}
                    </div>

                    {/* Action Button */}
                    <button
                      onClick={() => handleAdvanceStatus(order._id || order.id, order.status)}
                      className="w-full bg-[#8c5b47] hover:bg-[#a16d57] text-white font-extrabold text-base py-3 rounded-xl transition-all shadow-md active:scale-[0.99] flex items-center justify-center gap-2"
                    >
                      {isNew ? (
                        <>
                          <Play className="w-5 h-5 fill-current" />
                          Start Preparing
                        </>
                      ) : (
                        <>
                          <Check className="w-5 h-5" />
                          Mark Ready
                        </>
                      )}
                    </button>
                  </div>
                );
              })
            ) : (
              <div className="h-48 flex items-center justify-center text-gray-500 font-bold text-sm">
                No orders in preparation.
              </div>
            )}
          </div>
        </section>

        {/* COLUMN 2: Ready */}
        <section className="flex flex-col bg-[#21120a]/40 border border-[#F7E1B8] rounded-3xl p-5 overflow-hidden">
          <div className="flex justify-between items-center pb-3 border-b border-[#331d12] shrink-0">
            <h2 className="text-lg font-black tracking-wide uppercase flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-green-500"></span>
              Ready for Dispatch
            </h2>
            <span className="bg-green-500/20 text-green-400 font-extrabold text-sm px-3 py-1 rounded-full">
              {readyOrders.length} orders
            </span>
          </div>

          <div className="flex-1 overflow-y-auto mt-4 pr-1 space-y-4">
            {readyOrders.length > 0 ? (
              readyOrders.map((order) => (
                <div
                  key={order.id || order._id}
                  className="bg-[#21120a]/40 border border-[#F7E1B8] rounded-2xl p-5 shadow-md flex flex-col justify-between transition-all hover:border-green-900"
                >
                  {/* Card Header */}
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xl font-black text-green-400">
                          {order.orderNumber}
                        </span>
                        <span className={`text-xs font-black px-2.5 py-0.5 rounded-md border ${
                          order.type === "Parcel"
                            ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                            : order.type === "At Cart"
                            ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                            : "bg-[#331d12] text-[#e2d3c1] border-[#8c5b47]/40"
                        }`}>
                          {order.type === "Parcel" ? "📦 Parcel" : order.type === "At Cart" ? "🥤 At Cart" : order.type}
                        </span>
                      </div>
                      <h3 className="font-extrabold text-base text-[#e2d3c1] mt-1">
                        {order.customerName}
                      </h3>
                    </div>
                    <span className="text-xs text-gray-400 font-bold flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {getOrderAge(order.createdAt)}
                    </span>
                  </div>

                  {/* Card Items List */}
                  <div className="my-4 border-t border-b border-[#331d12]/50 py-3 space-y-3">
                    {order.items.map((item, idx) => {
                      const parcelCount = item.parcelQty !== undefined ? item.parcelQty : (item.orderMode === "PARCEL" ? (item.quantity || 1) : 0);
                      const atCartCount = item.atCartQty !== undefined ? item.atCartQty : (item.orderMode === "AT_CART" || !item.orderMode ? (item.quantity || 1) : 0);
                      const totalCount = item.totalQty !== undefined ? item.totalQty : (item.quantity || (parcelCount + atCartCount));

                      return (
                        <div key={idx} className="flex flex-col gap-1 pb-2 border-b border-[#331d12]/40 last:border-0 last:pb-0">
                          <div className="flex justify-between items-center text-[#fcf8f6]">
                            <div className="flex items-center gap-2 flex-1 flex-wrap">
                              <span className="font-bold text-[#e2d3c1] text-base">
                                {item.name}
                              </span>
                              <span className={`text-[11px] font-black px-2 py-0.5 rounded-md border ${
                                item.size === "200 ml"
                                  ? "bg-amber-400/20 text-amber-300 border-amber-400/40"
                                  : "bg-[#e2d3c1]/20 text-[#fcf8f6] border-[#e2d3c1]/30"
                              }`}>
                                🥛 {item.size || "250 ml"}
                              </span>
                            </div>
                            <span className="text-xs font-black bg-[#331d12] text-amber-200 px-2.5 py-0.5 rounded-md border border-[#8c5b47]/40">
                              Total: {totalCount}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-2 mt-0.5">
                            {parcelCount > 0 && (
                              <span className="text-xs font-black px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/50 flex items-center gap-1.5 shadow-sm">
                                <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                                📦 Parcel: {parcelCount}
                              </span>
                            )}
                            {atCartCount > 0 && (
                              <span className="text-xs font-black px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 flex items-center gap-1.5 shadow-sm">
                                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                                🥤 At Cart: {atCartCount}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                    {order.notes && (
                      <div className="text-xs text-gray-400 mt-1 font-semibold">
                        Note: {order.notes}
                      </div>
                    )}
                  </div>

                  {/* Action Button */}
                  <button
                    onClick={() => handleAdvanceStatus(order._id || order.id, order.status)}
                    className="w-full bg-green-700 hover:bg-green-600 text-white font-extrabold text-base py-3 rounded-xl transition-all shadow-md active:scale-[0.99] flex items-center justify-center gap-2"
                  >
                    <Check className="w-5 h-5" />
                    Complete Order
                  </button>
                </div>
              ))
            ) : (
              <div className="h-48 flex items-center justify-center text-gray-500 font-bold text-sm">
                No orders waiting for dispatch.
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
    </StaffGuard>
  );
}
