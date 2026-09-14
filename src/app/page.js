"use client";

import { useEffect, useState, useRef, useMemo } from "react";
// ... (rest unchanged)
// currentOrderNum is defined inside the component

import { useCartStore } from "@/store/useCartStore";
import {
  fetchMenuItemsAction,
  fetchSettingsAction,
  saveOrderAction,
  fetchOrdersAction,
} from "@/app/actions";
import { defaultMenuItems } from "@/lib/mockData";
import {
  Search,
  Plus,
  Minus,
  Trash2,
  QrCode,
  DollarSign,
  Printer,
  ChevronRight,
  TrendingUp,
  RotateCcw,
  Sparkles,
  ShoppingBag,
  Clock,
  UserCheck,
  Banknote,
} from "lucide-react";
import QRCode from "qrcode";

export default function CashierPOS() {
  // Zustand Store
  const {
    cart,
    customerName,
    customerPhone,
    orderType,
    discount,
    notes,
    paymentMethod,
    menuItems,
    settings,
    addParcelItem,
    addAtCartItem,
    updateParcelQty,
    updateAtCartQty,
    removeFromCart,
    clearCart,
    setCustomerName,
    setCustomerPhone,
    setOrderType,
    setDiscount,
    setNotes,
    setPaymentMethod,
    setMenuItems,
    setSettings,
  } = useCartStore();

  // Local component states
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [showQrModal, setShowQrModal] = useState(false);
  const [upiQrUrl, setUpiQrUrl] = useState("");
  const [orderNumber, setOrderNumber] = useState("");
const currentOrderNum = orderNumber || `PC-${Date.now().toString().slice(-4)}`;
  const [recentOrders, setRecentOrders] = useState([]);
  const [lastPlacedOrder, setLastPlacedOrder] = useState(null);
  const [recentCustomers, setRecentCustomers] = useState([]);
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [loading, setLoading] = useState(false);

// Removed redundant QR effect (finalTotal defined later)
  const [shouldPrint, setShouldPrint] = useState(false);
  const [cashReceived, setCashReceived] = useState("");
  const [selectedSizes, setSelectedSizes] = useState({});

  // Audio elements for sound notifications
  const chimeAudioRef = useRef(null);

  // Categories list
  // const categories = ["All", "Cold Coco", "Premium", "Seasonal", "Special"];

  // Fetch menu and settings
  useEffect(() => {
    async function loadData() {
      try {
        const items = await fetchMenuItemsAction();
        if (items && items.length > 0) {
          setMenuItems(items);
        } else if (!menuItems || menuItems.length === 0) {
          setMenuItems(defaultMenuItems);
        }
      } catch (err) {
        console.error("Error loading menu items:", err);
        if (!menuItems || menuItems.length === 0) setMenuItems(defaultMenuItems);
      }

      try {
        const dbSettings = await fetchSettingsAction();
        if (dbSettings) setSettings(dbSettings);
      } catch (err) {
        console.error("Error loading settings:", err);
      }

      try {
        const orders = await fetchOrdersAction();
        if (orders && orders.length > 0) {
          setRecentOrders(orders.slice(0, 5));
          // Extrapolate unique customers
          const uniqueCustomers = [];
          const seenPhones = new Set();
          orders.forEach((o) => {
            if (o.customerPhone && !seenPhones.has(o.customerPhone)) {
              seenPhones.add(o.customerPhone);
              uniqueCustomers.push({ name: o.customerName, phone: o.customerPhone });
            }
          });
          setRecentCustomers(uniqueCustomers.slice(0, 6));
        }
      } catch (err) {
        console.error("Error loading orders:", err);
      }
    }
    loadData();
  }, [setMenuItems, setSettings]);

  // Generate UPI QR Code URL when show QR modal or Cart total changes
  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * ((item.parcelQty || 0) + (item.atCartQty || 0) || item.quantity || 0),
    0
  );
  const totalCartItemsCount = cart.reduce(
    (sum, item) => sum + ((item.parcelQty || 0) + (item.atCartQty || 0) || item.quantity || 0),
    0
  );
  const finalTotal = Math.max(0, subtotal - discount);
  const cashReceivedNum = parseFloat(cashReceived) || 0;
  const changeToReturn = cashReceived !== "" ? cashReceivedNum - finalTotal : 0;

  // Generate UPI QR Code URL when modal opens
  useEffect(() => {
    if (!showQrModal) return;
    const currentOrderNum = orderNumber || `PC-${Date.now().toString().slice(-4)}`;
    const upiUrl = `upi://pay?pa=${settings.upiId || "prasadcoldcoco@okaxis"}&pn=${encodeURIComponent(
      settings.businessName || "Prasad Cold Coco"
    )}&am=${finalTotal}&tn=${currentOrderNum}&cu=INR`;

    QRCode.toDataURL(upiUrl, { margin: 1, width: 220 })
      .then((url) => setUpiQrUrl(url))
      .catch((err) => console.error("QR Generation error", err));
  }, [showQrModal, finalTotal, settings, orderNumber]);

  // Plays a success chime
  const playSuccessSound = () => {
    if (settings.enableSound && chimeAudioRef.current) {
      chimeAudioRef.current.play().catch(() => {});
    }
  };

  // Handle placing the order
  const handlePlaceOrder = async (isPaidOverride = false) => {
    if (!customerPhone.trim()) {
      alert("Mobile Number is required!");
      return;
    }
    if (!customerName.trim()) {
      alert("Customer Name is required!");
      return;
    }
    if (cart.length === 0) {
      alert("Cart is empty!");
      return;
    }

    setLoading(true);
    const generatedOrderNum = `PC-${Date.now().toString().slice(-4)}`;
    setOrderNumber(generatedOrderNum);

    const orderData = {
      orderNumber: generatedOrderNum,
      customerName,
      customerPhone,
      items: cart.map((i) => {
        const pQty = i.parcelQty !== undefined ? i.parcelQty : (i.orderMode === "PARCEL" ? (i.quantity || 1) : 0);
        const cQty = i.atCartQty !== undefined ? i.atCartQty : (i.orderMode === "AT_CART" || !i.orderMode ? (i.quantity || 1) : 0);
        const tQty = (i.parcelQty || 0) + (i.atCartQty || 0) || i.quantity || 1;
        return {
          name: i.name,
          size: i.size || "250 ml",
          price: i.price,
          costPrice: i.costPrice || 0,
          parcelQty: pQty,
          atCartQty: cQty,
          totalQty: tQty,
          quantity: tQty,
          subtotal: i.price * tQty,
        };
      }),
      subtotal,
      discount,
      total: finalTotal,
      paymentMethod,
      paymentStatus: paymentMethod === "Cash" || isPaidOverride ? "Paid" : "Pending",
      cashReceived: paymentMethod === "Cash" && cashReceived !== "" ? cashReceivedNum : finalTotal,
      changeAmount: paymentMethod === "Cash" && cashReceived !== "" ? Math.max(0, changeToReturn) : 0,
      status: "New",
      type: orderType,
      notes,
    };

    // Save order
    const saved = await saveOrderAction(orderData);
    setLoading(false);

    if (saved && !saved.error) {
      setLastPlacedOrder(saved);
      playSuccessSound();

      // Refresh recent orders
      const updatedOrders = await fetchOrdersAction();
      if (updatedOrders) setRecentOrders(updatedOrders.slice(0, 5));

      // Trigger Print immediately after order is saved
      setTimeout(() => {
        if (shouldPrint) {
          window.print();
        }
        clearCart();
        setCashReceived("");
        setOrderNumber("");
        setShowQrModal(false);
      }, 300);
    } else {
      alert("Error saving order: " + (saved?.error || "Unknown error"));
    }
  };

  // Trigger repeat order
  const handleRepeatOrder = (oldOrder) => {
    clearCart();
    setCustomerName(oldOrder.customerName);
    setCustomerPhone(oldOrder.customerPhone || "");
    setOrderType(oldOrder.type);
    setDiscount(oldOrder.discount);
    setPaymentMethod(oldOrder.paymentMethod);
    setNotes(oldOrder.notes || "");
    
    oldOrder.items.forEach((item) => {
      const foundItem = menuItems.find((m) => m.name === item.name) || {
        name: item.name,
        price: item.price,
        price200ml: item.price200ml || item.price,
        price250ml: item.price250ml || item.price,
        costPrice200ml: item.costPrice200ml || 0,
        costPrice250ml: item.costPrice250ml || 0,
        category: "Cold Coco",
      };
      const itemSize = item.size || "250 ml";
      const pQty = item.parcelQty !== undefined ? item.parcelQty : (item.orderMode === "PARCEL" ? (item.quantity || 1) : 0);
      const cQty = item.atCartQty !== undefined ? item.atCartQty : (item.orderMode === "AT_CART" || !item.orderMode ? (item.quantity || 1) : 0);
      for (let k = 0; k < pQty; k++) addParcelItem(foundItem, itemSize);
      for (let k = 0; k < cQty; k++) addAtCartItem(foundItem, itemSize);
    });
  };

  // Map of item name and size to dual order mode quantities in cart (Parcel & At Cart)
  const cartItemQuantities = useMemo(() => {
    const map = {};
    cart.forEach((cItem) => {
      if (cItem.name) {
        const sizeKey = cItem.size || "250 ml";
        const compositeKey = `${cItem.name}__${sizeKey}`;
        map[compositeKey] = {
          parcelQty: cItem.parcelQty || 0,
          atCartQty: cItem.atCartQty || 0,
          totalQty: (cItem.parcelQty || 0) + (cItem.atCartQty || 0),
        };
        // Also maintain general item count across sizes
        if (!map[cItem.name]) {
          map[cItem.name] = { parcelQty: 0, atCartQty: 0, totalQty: 0 };
        }
        map[cItem.name].parcelQty += cItem.parcelQty || 0;
        map[cItem.name].atCartQty += cItem.atCartQty || 0;
        map[cItem.name].totalQty += (cItem.parcelQty || 0) + (cItem.atCartQty || 0);
      }
    });
    return map;
  }, [cart]);

  // Filters menu items based on category and search query
  const effectiveMenuItems = menuItems && menuItems.length > 0 ? menuItems : defaultMenuItems;
  const filteredMenuItems = effectiveMenuItems.filter((item) => {
    const matchesCategory = activeCategory === "All" || item.category === activeCategory;
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.gujaratiName && item.gujaratiName.includes(searchQuery)) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="flex flex-col min-h-screen bg-[#fcf9f5] font-sans text-coco-dark selection:bg-coco-accent selection:text-white">
      {/* Hidden sound chime */}
      <audio ref={chimeAudioRef} src="https://assets.mixkit.co/active_storage/sfx/2568/2568-84.wav" preload="auto"></audio>
      
      

      <main className="flex-1 max-w-[1400px] w-full mx-auto p-3 sm:p-6 pb-8 lg:pb-8 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 no-print relative">
        {/* LEFT COLUMN: Menu Selection (Col span 7 or 8) */}
        <section className="lg:col-span-8 flex flex-col gap-6">
          {/* Header & Stats Banner */}
          <div className="bg-gradient-to-r from-coco-dark to-coco-medium text-cream-light rounded-3xl p-5 sm:p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center shadow-lg relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none"></div>
            <div className="flex items-center gap-4 relative z-10">
              <div className="bg-white/10 backdrop-blur-sm p-3 rounded-2xl border border-white/10">
                <Sparkles className="w-6 h-6 text-cream-deep" />
              </div>
              <div>
                <h2 className="font-extrabold text-xl sm:text-2xl tracking-tight">Quick Checkout</h2>
                <p className="text-sm text-cream-base/80 mt-0.5">Create coco orders seamlessly in seconds</p>
              </div>
            </div>
            {settings.phone && (
              <div className="mt-4 sm:mt-0 text-left sm:text-right relative z-10 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-2xl border border-white/5">
                <p className="text-xs text-cream-base/70 font-medium uppercase tracking-wider">Cart Helpline</p>
                <p className="text-base sm:text-lg font-bold text-white">{settings.phone}</p>
              </div>
            )}
          </div>

          {/* Search and Categories */}
          <div className="flex flex-col sm:flex-row gap-3 items-center sticky top-2 z-20 bg-[#fcf9f5]/90 backdrop-blur-md py-2 rounded-2xl">
            <div className="relative w-full sm:flex-1 px-2">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-coco-light/60" />
              <input
                type="text"
                placeholder="Search drink name, category, or ગુજરાતી..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-2xl border-0 ring-1 ring-cream-deep bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-coco-accent transition-all text-sm placeholder:text-coco-light/50"
              />
            </div>
            
            {/* <div className="flex gap-2 overflow-x-auto w-full p-2 sm:w-auto pb-2 sm:pb-2 scrollbar-none snap-x">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`snap-start px-5 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all duration-300 ${
                    activeCategory === cat
                      ? "bg-coco-medium text-white shadow-md shadow-coco-medium/20 scale-105"
                      : "bg-white text-coco-light ring-1 ring-cream-deep hover:bg-cream-base hover:text-coco-medium"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div> */}
          </div>

          {/* Menu Items Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 overflow-y-auto p-2 pb-10">
            {filteredMenuItems.length > 0 ? (
              filteredMenuItems.map((item, idx) => {
                const currentSize = selectedSizes[item.name || item.id] || "250 ml";
                const itemCartData = cartItemQuantities[`${item.name}__${currentSize}`] || {};
                const parcelQty = itemCartData.parcelQty || 0;
                const atCartQty = itemCartData.atCartQty || 0;
                const hasGlassSizes = (item.price200ml && item.price250ml) || item.category === "Cold Coco" || item.category === "Premium" || item.category === "Special" || item.category === "Seasonal";
                const p200 = item.price200ml || item.price;
                const p250 = item.price250ml || item.price;
                const activePrice = currentSize === "200 ml" ? p200 : p250;

                return (
                  <div
                    key={item.id || item._id || item.name || `menu-item-${idx}`}
                    className={`group bg-white rounded-3xl p-5 flex flex-col justify-between transition-all duration-300 relative ${
                      item.availability
                        ? "ring-1 ring-cream-deep/50 hover:ring-coco-accent/50 shadow-sm hover:shadow-xl hover:-translate-y-1"
                        : "ring-1 ring-cream-deep/30 opacity-60 grayscale-[0.5]"
                    }`}
                  >
                    {/* Image/logo preview */}
                    {item.imageUrl && (
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded-full mx-auto mb-2 border border-cream-deep/30"
                      />
                    )}
                    {/* Tags */}
                    {item.tags && item.tags.length > 0 && (
                      <div className="absolute top-4 right-4 flex gap-1.5 z-10">
                        {item.tags.map((tag) => (
                          <span
                            key={tag}
                            className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full shadow-sm"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="relative z-10 pt-1">
                      <h3 className="font-extrabold text-lg text-coco-dark group-hover:text-coco-accent transition-colors leading-tight pr-12">
                        {item.name}
                      </h3>
                      {item.gujaratiName && (
                        <p className="text-xs text-coco-medium/80 font-bold mt-1">
                          {item.gujaratiName}
                        </p>
                      )}
                      <p className="text-[13px] text-coco-light/70 mt-2.5 line-clamp-2 leading-relaxed">
                        {item.description || "Freshly churned delicious chocolate drink."}
                      </p>

                      {/* Glass Size Toggle (200 ml vs 250 ml) */}
                      {hasGlassSizes && (
                        <div className="mt-3.5 bg-cream-base/50 p-1 rounded-2xl border border-cream-deep/40 flex items-center gap-1">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedSizes((prev) => ({ ...prev, [item.name || item.id]: "200 ml" }));
                            }}
                            className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
                              currentSize === "200 ml"
                                ? "bg-white text-coco-dark shadow-sm ring-1 ring-amber-500/40"
                                : "text-coco-light/70 hover:text-coco-dark"
                            }`}
                          >
                            <span>200 ml</span>
                            <span className={`text-[10px] font-bold ${currentSize === "200 ml" ? "text-amber-800" : "text-coco-light/60"}`}>
                              ₹{p200}
                            </span>
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedSizes((prev) => ({ ...prev, [item.name || item.id]: "250 ml" }));
                            }}
                            className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
                              currentSize === "250 ml"
                                ? "bg-coco-dark text-white shadow-sm"
                                : "text-coco-light/70 hover:text-coco-dark"
                            }`}
                          >
                            <span>250 ml</span>
                            <span className={`text-[10px] font-bold ${currentSize === "250 ml" ? "text-cream-base" : "text-coco-light/60"}`}>
                              ₹{p250}
                            </span>
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="mt-4 flex flex-col sm:flex-row sm:items-end justify-between border-t border-cream-base/60 pt-3.5 gap-3">
                      <div>
                        <span className="text-[10px] uppercase tracking-wider text-coco-light/80 font-bold block mb-0.5">
                          Price {hasGlassSizes ? `(${currentSize})` : ""}
                        </span>
                        <p className="text-xl font-black text-coco-dark tracking-tight">₹{activePrice}</p>
                      </div>
                      {item.availability ? (
                        <div className="flex items-center gap-2">
                          {/* Parcel Button with Badge */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              addParcelItem(item, currentSize);
                            }}
                            className="relative bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300/80 px-2.5 py-2 rounded-xl font-extrabold text-xs transition-all active:scale-95 flex items-center gap-1.5 shadow-sm"
                          >
                            <span>📦 Parcel</span>
                            {parcelQty > 0 && (
                              <span
                                key={`pbadge-${item.name}-${currentSize}-${parcelQty}`}
                                className="absolute -top-2 -right-2 bg-amber-600 text-white font-black text-[10px] min-w-[20px] h-5 px-1 rounded-full flex items-center justify-center shadow-md ring-2 ring-white animate-in zoom-in-50"
                              >
                                {parcelQty}
                              </span>
                            )}
                          </button>

                          {/* At Cart Button with Badge */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              addAtCartItem(item, currentSize);
                            }}
                            className="relative bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300/80 px-2.5 py-2 rounded-xl font-extrabold text-xs transition-all active:scale-95 flex items-center gap-1.5 shadow-sm"
                          >
                            <span>🥤 At Cart</span>
                            {atCartQty > 0 && (
                              <span
                                key={`cbadge-${item.name}-${currentSize}-${atCartQty}`}
                                className="absolute -top-2 -right-2 bg-emerald-600 text-white font-black text-[10px] min-w-[20px] h-5 px-1 rounded-full flex items-center justify-center shadow-md ring-2 ring-white animate-in zoom-in-50"
                              >
                                {atCartQty}
                              </span>
                            )}
                          </button>
                        </div>
                      ) : (
                        <span className="text-[10px] text-red-600 font-extrabold uppercase bg-red-50 px-2.5 py-1.5 rounded-lg border border-red-100">
                          Sold Out
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-full py-16 flex flex-col items-center justify-center bg-white rounded-3xl border border-dashed border-cream-deep">
                <Search className="w-10 h-10 text-cream-deep mb-3" />
                <p className="text-coco-light font-medium">No items found matching your filters.</p>
              </div>
            )}
          </div>

          {/* Quick Repeat Section */}
          {recentOrders.length > 0 && (
            <div className="bg-gradient-to-br from-cream-base to-white border border-cream-deep/40 rounded-3xl p-5">
              <h3 className="font-extrabold text-sm mb-4 text-coco-medium flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-coco-accent" />
                One-Click Repeat Orders
              </h3>
              <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none snap-x">
                {recentOrders.map((ro) => (
                  <button
                    key={ro.id || ro._id}
                    onClick={() => handleRepeatOrder(ro)}
                    className="snap-start flex flex-col text-left p-3.5 bg-white border border-cream-deep/60 rounded-2xl hover:border-coco-accent/60 hover:shadow-md transition-all duration-300 min-w-[180px] flex-shrink-0 relative overflow-hidden group"
                  >
                    <div className="absolute top-0 right-0 w-16 h-16 bg-cream-base rounded-full -mr-8 -mt-8 transition-transform group-hover:scale-150 duration-500 ease-out z-0"></div>
                    <div className="relative z-10">
                      <div className="flex justify-between w-full text-[10px] font-black text-coco-light mb-1">
                        <span>{ro.orderNumber}</span>
                        <span className="text-coco-accent">₹{ro.total}</span>
                      </div>
                      <span className="font-extrabold text-sm text-coco-dark block truncate">
                        {ro.customerName}
                      </span>
                      <span className="text-xs text-coco-light/80 block mt-1 line-clamp-2 leading-tight">
                        {ro.items.map((i) => `${i.name} (${i.size || "250 ml"}) × ${i.quantity}`).join(", ")}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* RIGHT COLUMN: Cart and Billing Panel (Col span 4) */}
        <section id="cart-section" className="lg:col-span-4 relative">
          <div className="lg:sticky lg:top-6 bg-white/95 backdrop-blur-xl border border-cream-deep/30 rounded-[2rem] p-4 sm:p-6 flex flex-col shadow-[0_8px_30px_rgb(0,0,0,0.06)] h-auto  lg:min-h-[620px] transition-all">
            
            {/* Cart Header */}
            <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-cream-base/60">
              <h2 className="font-extrabold text-xl flex items-center gap-2.5 text-coco-dark">
                <ShoppingBag className="w-5 h-5 text-coco-accent" />
                Cart
              </h2>
              {cart.length > 0 && (
                <span className="bg-coco-dark text-white text-xs px-3 py-1 rounded-full font-black shadow-sm">
                  {totalCartItemsCount} Items
                </span>
              )}
            </div>

            {/* Cart Items List */}
            <div className="max-h-[280px] lg:max-h-none lg:flex-1 overflow-y-auto my-3 sm:my-4 p-1.5 scrollbar-thin shadow border border-gray-200 rounded-lg">
              {cart.length > 0 ? (
                <div className="flex flex-col gap-3">
                  {cart.map((item, idx) => {
                    const parcelQty = item.parcelQty !== undefined ? item.parcelQty : (item.orderMode === "PARCEL" ? (item.quantity || 1) : 0);
                    const atCartQty = item.atCartQty !== undefined ? item.atCartQty : (item.orderMode === "AT_CART" || !item.orderMode ? (item.quantity || 1) : 0);
                    const totalQty = (item.parcelQty || 0) + (item.atCartQty || 0) || item.quantity || 0;
                    const itemTotal = item.price * totalQty;

                    return (
                      <div
                        key={`${item.name}-${item.size || "250 ml"}-${idx}`}
                        className="flex flex-col p-3.5 bg-cream-light/30 rounded-2xl border border-cream-deep/30 hover:border-cream-deep/70 transition-colors gap-2.5 shadow-sm"
                      >
                        {/* Top Row: Name, Size, Item Price, Total Price & Delete Button */}
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <h4 className="font-extrabold text-sm text-coco-dark truncate">{item.name}</h4>
                              <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                                item.size === "200 ml"
                                  ? "bg-amber-100 text-amber-900 border border-amber-300/80"
                                  : "bg-coco-light/20 text-coco-dark border border-coco-medium/30"
                              }`}>
                                {item.size || "250 ml"}
                              </span>
                            </div>
                            <p className="text-[11px] text-coco-light font-bold">₹{item.price} each</p>
                          </div>

                          <div className="text-right font-black text-base text-coco-dark tabular-nums">
                            ₹{itemTotal}
                          </div>

                          <button
                            type="button"
                            onClick={() => removeFromCart(idx)}
                            className="text-red-400 hover:text-red-600 hover:bg-red-50 p-1.5 rounded-xl transition-colors ml-1"
                            title="Delete complete product"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Dual Order Mode Controls */}
                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-cream-deep/20">
                          {/* Parcel Controls */}
                          <div className="flex items-center justify-between bg-amber-50/90 border border-amber-200/80 px-2 py-1.5 rounded-xl">
                            <span className="text-[11px] font-extrabold text-amber-900 flex items-center gap-1">
                              📦 Parcel
                            </span>
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => updateParcelQty(idx, parcelQty - 1)}
                                className="text-amber-900 hover:bg-amber-200/70 p-1 rounded-lg transition-colors"
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </button>
                              <span className="text-xs font-black w-4 text-center text-amber-950">{parcelQty}</span>
                              <button
                                type="button"
                                onClick={() => updateParcelQty(idx, parcelQty + 1)}
                                className="text-amber-900 hover:bg-amber-200/70 p-1 rounded-lg transition-colors"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* At Cart Controls */}
                          <div className="flex items-center justify-between bg-emerald-50/90 border border-emerald-200/80 px-2 py-1.5 rounded-xl">
                            <span className="text-[11px] font-extrabold text-emerald-900 flex items-center gap-1">
                              🥤 At Cart
                            </span>
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => updateAtCartQty(idx, atCartQty - 1)}
                                className="text-emerald-900 hover:bg-emerald-200/70 p-1 rounded-lg transition-colors"
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </button>
                              <span className="text-xs font-black w-4 text-center text-emerald-950">{atCartQty}</span>
                              <button
                                type="button"
                                onClick={() => updateAtCartQty(idx, atCartQty + 1)}
                                className="text-emerald-900 hover:bg-emerald-200/70 p-1 rounded-lg transition-colors"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Item Footer Summary */}
                        <div className="flex justify-between items-center text-[11px] font-bold text-coco-light pt-0.5">
                          <span>Serving Breakdown</span>
                          <span className="bg-coco-dark text-white text-[10px] font-black px-2.5 py-0.5 rounded-md">
                            Total: {totalQty}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-coco-light/50">
                  <div className="w-24 h-24 bg-cream-base/50 rounded-full flex items-center justify-center mb-4">
                    <ShoppingBag className="w-10 h-10 text-coco-light/30" />
                  </div>
                  <p className="font-semibold text-sm text-coco-light/80">Your cart is empty</p>
                  <p className="text-xs text-coco-light/50 mt-1">Add items to start order</p>
                </div>
              )}
            </div>

            {/* Checkout Form */}
            <div className="bg-[#fdfaf7] rounded-3xl p-4 border border-cream-deep/30">
              
              {/* Customer Inputs */}
              <div className="flex flex-col gap-3 mb-4">
                {/* Mobile Number Input with Customer Lookup */}
                <div className="relative group">
                  <input
                    type="tel"
                    id="custPhone"
                    placeholder=" "
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    onFocus={() => setShowCustomerDropdown(recentCustomers.length > 0)}
                    onBlur={() => setTimeout(() => setShowCustomerDropdown(false), 200)}
                    className="block px-4 pb-2.5 pt-5 w-full text-sm text-coco-dark bg-white rounded-2xl border border-cream-deep/60 appearance-none focus:outline-none focus:ring-0 focus:border-coco-accent peer shadow-sm transition-colors"
                  />
                  <label htmlFor="custPhone" className="absolute text-[11px] font-bold text-coco-light duration-300 transform -translate-y-3 scale-75 top-4 z-10 origin-[0] left-4 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:font-medium peer-placeholder-shown:text-[13px] peer-focus:scale-75 peer-focus:-translate-y-3 peer-focus:font-bold peer-focus:text-coco-accent cursor-text">
                    Mobile Number <span className="text-red-500">*</span>
                  </label>
                  
                  {/* Phone Lookup Dropdown */}
                  {showCustomerDropdown && (
                    <div className="absolute left-0 right-0 top-full mt-2 bg-white/95 backdrop-blur-xl border border-cream-deep/60 rounded-2xl shadow-xl z-50 max-h-48 overflow-y-auto overflow-x-hidden">
                      {recentCustomers
                        .filter((c) => c.phone.toLowerCase().includes(customerPhone.toLowerCase()) || c.name.toLowerCase().includes(customerPhone.toLowerCase()))
                        .map((cust) => (
                          <button
                            key={cust.phone}
                            type="button"
                            onMouseDown={() => {
                              setCustomerName(cust.name);
                              setCustomerPhone(cust.phone);
                              setShowCustomerDropdown(false);
                            }}
                            className="w-full text-left px-4 py-3 hover:bg-cream-base/80 border-b border-cream-base/40 transition-colors flex justify-between items-center group"
                          >
                            <span className="font-bold text-sm text-coco-dark group-hover:text-coco-accent transition-colors flex items-center gap-1.5">
                              📱 {cust.phone}
                            </span>
                            <span className="text-[11px] text-coco-medium font-bold bg-cream-base px-2.5 py-1 rounded-md">
                              {cust.name}
                            </span>
                          </button>
                        ))}
                    </div>
                  )}
                </div>

                {/* Customer Name Input */}
                <div className="relative group">
                  <input
                    type="text"
                    id="custName"
                    placeholder=" "
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="block px-4 pb-2.5 pt-5 w-full text-sm text-coco-dark bg-white rounded-2xl border border-cream-deep/60 appearance-none focus:outline-none focus:ring-0 focus:border-coco-accent peer shadow-sm transition-colors"
                  />
                  <label htmlFor="custName" className="absolute text-[11px] font-bold text-coco-light duration-300 transform -translate-y-3 scale-75 top-4 z-10 origin-[0] left-4 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:font-medium peer-placeholder-shown:text-[13px] peer-focus:scale-75 peer-focus:-translate-y-3 peer-focus:font-bold peer-focus:text-coco-accent cursor-text">
                    Customer Name <span className="text-red-500">*</span>
                  </label>
                </div>
                
                {/* Notes & Discount Collapse */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="relative col-span-2">
                    <input
                      type="text"
                      id="orderNotes"
                      placeholder=" "
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="block px-4 pb-2 pt-4 w-full text-xs text-coco-dark bg-white/50 rounded-xl border border-cream-deep/40 appearance-none focus:outline-none focus:ring-0 focus:border-coco-accent peer transition-colors"
                    />
                    <label htmlFor="orderNotes" className="absolute text-[10px] font-bold text-coco-light duration-300 transform -translate-y-2.5 scale-75 top-3 z-10 origin-[0] left-4 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:text-[11px] peer-focus:scale-75 peer-focus:-translate-y-2.5 peer-focus:font-bold peer-focus:text-coco-accent cursor-text">
                      Notes (Optional)
                    </label>
                  </div>
                  <div className="relative col-span-1">
                    <input
                      type="number"
                      id="orderDiscount"
                      placeholder=" "
                      value={discount || ""}
                      onChange={(e) => setDiscount(e.target.value)}
                      className="block px-3 pb-2 pt-4 w-full text-xs font-black text-red-500 bg-white/50 rounded-xl border border-cream-deep/40 appearance-none focus:outline-none focus:ring-0 focus:border-red-400 peer transition-colors text-right"
                    />
                    <label htmlFor="orderDiscount" className="absolute text-[10px] font-bold text-coco-light duration-300 transform -translate-y-2.5 scale-75 top-3 z-10 origin-[0] left-3 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:text-[11px] peer-focus:scale-75 peer-focus:-translate-y-2.5 peer-focus:font-bold peer-focus:text-red-500 cursor-text">
                      Discount ₹
                    </label>
                  </div>
                </div>
              </div>

              {/* Pricing Summary */}
              <div className="border-t border-cream-deep/30 pt-3 pb-2 flex flex-col gap-1 text-[13px]">
                <div className="flex justify-between text-coco-light font-medium">
                  <span>Subtotal</span>
                  <span className="font-bold tabular-nums text-coco-dark">₹{subtotal}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-red-500 font-bold">
                    <span>Discount</span>
                    <span className="tabular-nums">- ₹{discount}</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-black pt-2 mt-1 border-t border-dashed border-cream-deep/50 text-coco-dark items-end">
                  <span>Total Amount</span>
                  <span className="text-2xl tracking-tight text-coco-accent">₹{finalTotal}</span>
                </div>
              </div>

              {/* Advanced Payment & Print Toggles */}
              <div className="mt-3 bg-white p-2 sm:p-2.5 rounded-2xl border border-cream-deep/40 shadow-sm flex flex-col gap-2">
                {/* Segmented Control for Payment Method */}
                <div className="flex relative bg-cream-base/30 rounded-xl p-1">
                  {/* Sliding background */}
                  <div 
                    className={`absolute inset-y-1 w-[calc(50%-4px)] bg-white rounded-lg shadow-sm transition-all duration-300 ease-out z-0 border border-cream-deep/30 ${
                      paymentMethod === 'Cash' ? 'left-1' : 'left-[calc(50%+2px)]'
                    }`}
                  ></div>
                  
                  <button
                    onClick={() => setPaymentMethod("Cash")}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-extrabold transition-colors z-10 ${
                      paymentMethod === "Cash" ? "text-green-700" : "text-coco-light hover:text-coco-medium"
                    }`}
                  >
                    <DollarSign className="w-3.5 h-3.5" />
                    Cash Pay
                  </button>
                  <button
                    onClick={() => setPaymentMethod("UPI")}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-extrabold transition-colors z-10 ${
                      paymentMethod === "UPI" ? "text-blue-700" : "text-coco-light hover:text-coco-medium"
                    }`}
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    UPI Pay
                  </button>
                </div>

                {/* Cash Change Calculator (when Cash Pay is selected) */}
                {paymentMethod === "Cash" && (
                  <div className="p-2.5 bg-cream-base/20 rounded-xl border border-cream-deep/30 flex flex-col gap-2 transition-all">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-extrabold text-coco-dark flex items-center gap-1.5">
                        <Banknote className="w-3.5 h-3.5 text-emerald-600" />
                        Cash Tendered / Received
                      </span>
                      {cashReceived !== "" && (
                        <button
                          type="button"
                          onClick={() => setCashReceived("")}
                          className="text-[10px] text-coco-light hover:text-red-500 font-bold transition-colors"
                        >
                          Clear
                        </button>
                      )}
                    </div>

                    {/* Input Field */}
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-black text-coco-medium">
                        ₹
                      </span>
                      <input
                        type="number"
                        placeholder={finalTotal > 0 ? `Enter note (e.g. 500)` : "Cash amount received"}
                        value={cashReceived}
                        onChange={(e) => setCashReceived(e.target.value)}
                        className="w-full pl-7 pr-3 py-1.5 text-xs font-black text-coco-dark bg-white rounded-lg border border-cream-deep/50 focus:outline-none focus:border-coco-accent transition-colors"
                      />
                    </div>

                    {/* Quick Note Suggestions */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {finalTotal > 0 && (
                        <button
                          type="button"
                          onClick={() => setCashReceived(String(finalTotal))}
                          className={`px-2 py-1 text-[10px] font-black rounded-lg border transition-all ${
                            Number(cashReceived) === finalTotal
                              ? "bg-coco-accent text-white border-coco-accent shadow-sm"
                              : "bg-white text-coco-medium border-cream-deep/50 hover:bg-cream-base/60"
                          }`}
                        >
                          Exact ₹{finalTotal}
                        </button>
                      )}
                      {[100, 200, 500].map((note) => (
                        <button
                          key={note}
                          type="button"
                          onClick={() => setCashReceived(String(note))}
                          className={`px-2 py-1 text-[10px] font-black rounded-lg border transition-all ${
                            Number(cashReceived) === note
                              ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                              : "bg-white text-coco-medium border-cream-deep/50 hover:bg-cream-base/60"
                          }`}
                        >
                          ₹{note}
                        </button>
                      ))}
                    </div>

                    {/* Change to Return Display Banner */}
                    {cashReceived !== "" && Number(cashReceived) > 0 && (
                      <div
                        className={`p-2.5 rounded-xl flex items-center justify-between border transition-all ${
                          changeToReturn >= 0
                            ? "bg-emerald-50 border-emerald-300 text-emerald-950"
                            : "bg-amber-50 border-amber-300 text-amber-950"
                        }`}
                      >
                        <div>
                          <div className="text-[10px] font-black uppercase tracking-wider">
                            {changeToReturn >= 0 ? "Change to Return" : "Due / Short Amount"}
                          </div>
                          <div className="text-[10px] font-semibold opacity-80">
                            {changeToReturn >= 0
                              ? `Customer gave ₹${cashReceivedNum} - Bill ₹${finalTotal}`
                              : `Need ₹${Math.abs(changeToReturn)} more from customer`}
                          </div>
                        </div>
                        <div
                          className={`text-lg font-black tabular-nums ${
                            changeToReturn >= 0 ? "text-emerald-700" : "text-amber-700"
                          }`}
                        >
                          ₹{Math.abs(changeToReturn)}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Animated Print Toggle */}
                <div className="flex items-center justify-between px-3 py-2 cursor-pointer rounded-xl hover:bg-cream-base/50 transition-colors group" onClick={() => setShouldPrint(!shouldPrint)}>
                  <label className="text-xs font-extrabold text-coco-dark cursor-pointer flex items-center gap-2">
                    <Printer className={`w-3.5 h-3.5 transition-colors ${shouldPrint ? 'text-coco-accent' : 'text-coco-light'}`} />
                    Print Receipt
                  </label>
                  
                  <div className={`relative w-9 h-5 flex items-center rounded-full p-1 transition-colors duration-300 ${shouldPrint ? 'bg-coco-accent' : 'bg-cream-deep/60'}`}>
                    <div className={`bg-white w-3.5 h-3.5 rounded-full shadow-md transform transition-transform duration-300 ${shouldPrint ? 'translate-x-3.5' : 'translate-x-0'}`}></div>
                  </div>
                </div>
              </div>

              {/* Place Order CTA */}
              <button
                onClick={() => {
                  if (paymentMethod === "UPI") {
                    if (!customerPhone.trim()) {
                      alert("Mobile Number is required!");
                      return;
                    }
                    if (!customerName.trim()) {
                      alert("Customer Name is required!");
                      return;
                    }
                    if (cart.length === 0) {
                      alert("Cart is empty!");
                      return;
                    }
                    setShowQrModal(true);
                  } else {
                    handlePlaceOrder();
                  }
                }}
                disabled={cart.length === 0 || loading}
                className={`w-full mt-3 py-4 rounded-2xl font-black text-sm text-white shadow-lg transition-all duration-300 flex items-center justify-center gap-2 relative overflow-hidden group ${
                  cart.length === 0
                    ? "bg-coco-medium/50 cursor-not-allowed opacity-70"
                    : "bg-gradient-to-r from-coco-dark to-coco-accent hover:from-coco-accent hover:to-coco-light active:scale-[0.98] shadow-coco-accent/30 hover:shadow-coco-accent/50"
                }`}
              >
                {/* Shine effect for active state */}
                {cart.length > 0 && (
                   <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-20 group-hover:animate-pulse" />
                )}
                
                {loading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Processing...
                  </span>
                ) : paymentMethod === "UPI" ? (
                  <>
                    <QrCode className="w-4 h-4" />
                    Generate QR (₹{finalTotal})
                  </>
                ) : (
                  <>
                    {shouldPrint ? <Printer className="w-4 h-4" /> : <DollarSign className="w-4 h-4" />}
                    <span>{shouldPrint ? "Pay & Print Bill" : "Pay Only"} (₹{finalTotal})</span>
                    {paymentMethod === "Cash" && cashReceived !== "" && changeToReturn > 0 && (
                      <span className="ml-1.5 px-2 py-0.5 bg-white/25 rounded-md text-xs font-black">
                        Change: ₹{changeToReturn}
                      </span>
                    )}
                  </>
                )}
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Floating Mobile Cart Quick Button with badge */}
      {cart.length > 0 && (
        <div className="lg:hidden fixed bottom-16 left-4 right-4 z-40 no-print">
          <button
            onClick={() => {
              const cartElem = document.getElementById("cart-section");
              if (cartElem) cartElem.scrollIntoView({ behavior: "smooth" });
            }}
            className="relative w-full bg-gradient-to-r from-coco-dark to-coco-accent text-white py-3.5 px-5 rounded-2xl font-black text-sm shadow-xl flex items-center justify-between border border-white/20 active:scale-[0.98] transition-all"
          >
            {/* Cart icon with badge */}
            <div className="flex items-center gap-2">
              <div className="relative bg-white/20 p-1.5 rounded-xl">
                <ShoppingBag className="w-4 h-4 text-cream-light" />
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-coco-accent text-xs font-bold text-white">
                  {totalCartItemsCount}
                </span>
              </div>
              <span>View Order</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-base">₹{finalTotal}</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </button>
        </div>
      )}

      {/* UPI QR PAYMENT MODAL */}
      {showQrModal && (
        <div className="fixed inset-0 bg-coco-dark/60 backdrop-blur-md z-50 flex items-center justify-center p-4 no-print animate-in fade-in duration-200">
          <div className="bg-white rounded-[2rem] p-6 sm:p-8 max-w-sm w-full text-center shadow-2xl flex flex-col items-center gap-5 relative animate-in zoom-in-95 duration-200">
            {/* Close button */}
            <button onClick={() => setShowQrModal(false)} className="absolute top-4 right-4 text-coco-light hover:text-coco-dark bg-cream-base/50 p-2 rounded-full transition-colors">
               <Plus className="w-4 h-4 rotate-45" />
            </button>
            
            <div className="mt-2">
              <div className="bg-blue-50 text-blue-600 w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <QrCode className="w-6 h-6" />
              </div>
              <h3 className="font-black text-xl text-coco-dark tracking-tight">Scan to Pay</h3>
              <p className="text-xs text-coco-light/80 mt-1">Accepts GPay, PhonePe, Paytm</p>
            </div>

            {/* QR Canvas Container */}
            <div className="bg-white p-4 rounded-3xl shadow-inner border-2 border-cream-base relative">
              {/* Scanline simple animation using standard tailwind classes */}
              <div className="absolute inset-x-4 top-4 h-0.5 bg-blue-500/50 blur-[1px] animate-pulse"></div>
              
              {upiQrUrl ? (
                <img src={upiQrUrl} alt="UPI QR Code" className="w-[200px] h-[200px] object-contain mx-auto mix-blend-multiply" />
              ) : (
                <div className="w-[200px] h-[200px] bg-cream-base/50 rounded-2xl flex items-center justify-center text-xs font-bold text-coco-light animate-pulse">
                  Generating QR...
                </div>
              )}
            </div>

            <div className="w-full bg-cream-base/40 rounded-2xl p-4 border border-cream-deep/30">
              <p className="text-xs text-coco-light font-bold uppercase tracking-wider mb-1">Amount to Pay</p>
              <p className="text-3xl font-black text-coco-dark">₹{finalTotal}</p>
              <p className="text-[10px] text-coco-accent mt-2 font-extrabold tracking-widest bg-white py-1 px-3 rounded-lg inline-block border border-cream-deep/50 shadow-sm">
                ID: {currentOrderNum}
              </p>
            </div>

            {/* Modal Actions */}
            <div className="flex flex-col gap-2.5 w-full mt-2">
              <button
                onClick={() => handlePlaceOrder(true)}
                className="w-full bg-gradient-to-r from-coco-dark to-coco-accent text-white py-3.5 rounded-2xl font-black text-sm shadow-lg hover:shadow-xl active:scale-[0.98] transition-all"
              >
                {shouldPrint ? "Confirm Paid & Print Receipt" : "Confirm Paid"}
              </button>
              <button
                onClick={() => setShowQrModal(false)}
                className="w-full bg-white text-coco-medium py-3 rounded-2xl font-bold text-xs border-2 border-cream-deep/50 hover:bg-cream-base/50 transition-colors"
              >
                Cancel / Change Method
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PRINT RECEIPT COMPONENT (Hidden from view on web, visible during print) */}
      {lastPlacedOrder && (
        <div
          className={`print-receipt-container ${
            settings.printerWidth === "80mm" ? "print-receipt-container-80" : ""
          } hidden`}
        >
          <div className="text-center font-bold" style={{ fontSize: "14px", borderBottom: "1px dashed black", paddingBottom: "4px" }}>
            {settings.businessName || "PRASAD COLD COCO"}
          </div>
          <div className="text-center" style={{ fontSize: "10px", margin: "2px 0 6px 0" }}>
            {settings.tagline && <div>"{settings.tagline}"</div>}
            {settings.address && <div style={{ fontSize: "9px" }}>{settings.address}</div>}
            {settings.phone && <div>Tel: {settings.phone}</div>}
            {settings.gstNumber && <div>GSTIN: {settings.gstNumber}</div>}
          </div>

          <div style={{ borderBottom: "1px dashed black", paddingBottom: "4px", marginBottom: "4px", fontSize: "10px" }}>
            <div><b>Bill No:</b> {lastPlacedOrder.orderNumber}</div>
            <div><b>Date:</b> {new Date(lastPlacedOrder.createdAt).toLocaleDateString()} {new Date(lastPlacedOrder.createdAt).toLocaleTimeString()}</div>
            <div><b>Customer:</b> {lastPlacedOrder.customerName}</div>
            {lastPlacedOrder.customerPhone && <div><b>Phone:</b> {lastPlacedOrder.customerPhone}</div>}
            <div><b>Type:</b> {lastPlacedOrder.type} ({lastPlacedOrder.paymentMethod})</div>
          </div>

          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "10px", textAlign: "left" }}>
            <thead>
              <tr style={{ borderBottom: "1px dashed black" }}>
                <th style={{ paddingBottom: "3px" }}>Item</th>
                <th style={{ textAlign: "center", paddingBottom: "3px" }}>Qty</th>
                <th style={{ textAlign: "right", paddingBottom: "3px" }}>Amt</th>
              </tr>
            </thead>
            <tbody>
              {lastPlacedOrder.items.map((item, idx) => {
                const pQty = item.parcelQty !== undefined ? item.parcelQty : (item.orderMode === "PARCEL" ? (item.quantity || 1) : 0);
                const cQty = item.atCartQty !== undefined ? item.atCartQty : (item.orderMode === "AT_CART" || !item.orderMode ? (item.quantity || 1) : 0);
                const tQty = item.totalQty || item.quantity || (pQty + cQty);
                const amt = item.subtotal || item.price * tQty;

                return (
                  <tr key={`${item.name}-${item.size || "250 ml"}-${idx}`} style={{ borderBottom: "1px dotted #eee" }}>
                    <td style={{ padding: "3px 0" }}>
                      <div style={{ fontWeight: "bold" }}>
                        {item.name} {item.size ? `(${item.size})` : ""}
                      </div>
                      <div style={{ fontSize: "8.5px", color: "#555" }}>
                        {pQty > 0 ? `Parcel: ${pQty}` : ""}
                        {pQty > 0 && cQty > 0 ? ` | ` : ""}
                        {cQty > 0 ? `At Cart: ${cQty}` : ""}
                      </div>
                    </td>
                    <td style={{ textAlign: "center", padding: "3px 0", fontWeight: "bold" }}>{tQty}</td>
                    <td style={{ textAlign: "right", padding: "3px 0", fontWeight: "bold" }}>₹{amt}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div style={{ borderTop: "1px dashed black", paddingTop: "4px", marginTop: "4px", fontSize: "10px" }}>
            <div style={{ display: "flex", justifyContent: "between", width: "100%" }}>
              <span>Subtotal:</span>
              <span style={{ float: "right" }}>₹{lastPlacedOrder.subtotal}</span>
            </div>
            {lastPlacedOrder.discount > 0 && (
              <div style={{ display: "flex", justifyContent: "between", width: "100%", color: "red" }}>
                <span>Discount:</span>
                <span style={{ float: "right" }}>- ₹{lastPlacedOrder.discount}</span>
              </div>
            )}
            <div style={{ display: "flex", justifyContent: "between", width: "100%", fontWeight: "bold", fontSize: "12px", borderTop: "1px dashed black", marginTop: "2px", paddingTop: "2px" }}>
              <span>GRAND TOTAL:</span>
              <span style={{ float: "right" }}>₹{lastPlacedOrder.total}</span>
            </div>
            {lastPlacedOrder.paymentMethod === "Cash" && lastPlacedOrder.cashReceived > 0 && (
              <>
                <div style={{ display: "flex", justifyContent: "between", width: "100%", fontSize: "9.5px", marginTop: "3px" }}>
                  <span>Cash Tendered:</span>
                  <span style={{ float: "right" }}>₹{lastPlacedOrder.cashReceived}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "between", width: "100%", fontWeight: "bold", fontSize: "10.5px" }}>
                  <span>Change Return:</span>
                  <span style={{ float: "right" }}>₹{lastPlacedOrder.changeAmount}</span>
                </div>
              </>
            )}
          </div>

          <div className="text-center" style={{ marginTop: "12px", borderTop: "1px dashed black", paddingTop: "6px", fontSize: "9px" }}>
            <div>{settings.receiptHeader || "WELCOME TO PRASAD COLD COCO"}</div>
            <div style={{ fontWeight: "bold", margin: "2px 0" }}>{settings.receiptFooter || "THANK YOU! VISIT AGAIN!"}</div>
            {settings.googleReviewUrl && (
              <div style={{ fontSize: "8px", color: "#555" }}>
                Scan to review us on Google!
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
