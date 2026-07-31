import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useCartStore = create(
  persist(
    (set, get) => ({
      // Cart State
      cart: [],
      customerName: "",
      customerPhone: "",
      orderType: "Take Away",
      discount: 0,
      notes: "",
      paymentMethod: "Cash",

      // Menu & Settings Cache (for fast offline reading)
      menuItems: [],
      settings: {
        businessName: "Prasad Cold Coco",
        tagline: "Mix, Sip, Smile",
        address: "Althan-Bhimrad Road, Surat, Gujarat",
        phone: "+91 98765 43210",
        gstNumber: "",
        upiId: "prasadcoldcoco@okaxis",
        receiptHeader: "WELCOME TO PRASAD COLD COCO",
        receiptFooter: "THANK YOU! VISIT AGAIN!",
        googleReviewUrl: "",
        enableSound: true,
        printerWidth: "58mm",
      },

      // Auth Session State
      currentUser: null, // { username, role: 'Admin' | 'Cashier' }

      // Cart Actions
      // Cart Actions - Dual Order Mode Support (Parcel & At Cart per item)
      addParcelItem: (item) => {
        const currentCart = get().cart;
        const existingIndex = currentCart.findIndex((i) => i.name === item.name);
        if (existingIndex > -1) {
          set({
            cart: currentCart.map((i, idx) =>
              idx === existingIndex
                ? {
                    ...i,
                    parcelQty: (i.parcelQty || 0) + 1,
                    atCartQty: i.atCartQty || 0,
                  }
                : i
            ),
          });
        } else {
          set({
            cart: [
              ...currentCart,
              {
                ...item,
                parcelQty: 1,
                atCartQty: 0,
              },
            ],
          });
        }
      },

      addAtCartItem: (item) => {
        const currentCart = get().cart;
        const existingIndex = currentCart.findIndex((i) => i.name === item.name);
        if (existingIndex > -1) {
          set({
            cart: currentCart.map((i, idx) =>
              idx === existingIndex
                ? {
                    ...i,
                    parcelQty: i.parcelQty || 0,
                    atCartQty: (i.atCartQty || 0) + 1,
                  }
                : i
            ),
          });
        } else {
          set({
            cart: [
              ...currentCart,
              {
                ...item,
                parcelQty: 0,
                atCartQty: 1,
              },
            ],
          });
        }
      },

      updateParcelQty: (indexOrName, quantity) => {
        const currentCart = get().cart;
        const index =
          typeof indexOrName === "number"
            ? indexOrName
            : currentCart.findIndex((i) => i.name === indexOrName);

        if (index === -1 || index >= currentCart.length) return;
        const target = currentCart[index];
        const newParcelQty = Math.max(0, quantity);
        const currentAtCartQty = target.atCartQty || 0;

        if (newParcelQty <= 0 && currentAtCartQty <= 0) {
          set({ cart: currentCart.filter((_, idx) => idx !== index) });
        } else {
          set({
            cart: currentCart.map((i, idx) =>
              idx === index ? { ...i, parcelQty: newParcelQty } : i
            ),
          });
        }
      },

      updateAtCartQty: (indexOrName, quantity) => {
        const currentCart = get().cart;
        const index =
          typeof indexOrName === "number"
            ? indexOrName
            : currentCart.findIndex((i) => i.name === indexOrName);

        if (index === -1 || index >= currentCart.length) return;
        const target = currentCart[index];
        const currentParcelQty = target.parcelQty || 0;
        const newAtCartQty = Math.max(0, quantity);

        if (currentParcelQty <= 0 && newAtCartQty <= 0) {
          set({ cart: currentCart.filter((_, idx) => idx !== index) });
        } else {
          set({
            cart: currentCart.map((i, idx) =>
              idx === index ? { ...i, atCartQty: newAtCartQty } : i
            ),
          });
        }
      },

      removeFromCart: (indexOrName) => {
        const currentCart = get().cart;
        if (typeof indexOrName === "number") {
          set({ cart: currentCart.filter((_, idx) => idx !== indexOrName) });
        } else {
          set({ cart: currentCart.filter((i) => i.name !== indexOrName) });
        }
      },

      // Helper getters
      getParcelQty: (itemName) => {
        const item = get().cart.find((i) => i.name === itemName);
        return item?.parcelQty || 0;
      },
      getAtCartQty: (itemName) => {
        const item = get().cart.find((i) => i.name === itemName);
        return item?.atCartQty || 0;
      },
      getTotalQty: (itemName) => {
        const item = get().cart.find((i) => i.name === itemName);
        return (item?.parcelQty || 0) + (item?.atCartQty || 0);
      },

      // Backward compatibility wrappers
      addToCart: (item, targetMode) => {
        const mode = targetMode || item.orderMode || "AT_CART";
        if (mode === "PARCEL" || mode === "Parcel") {
          get().addParcelItem(item);
        } else {
          get().addAtCartItem(item);
        }
      },

      updateQuantity: (indexOrName, quantity) => {
        const currentCart = get().cart;
        const index =
          typeof indexOrName === "number"
            ? indexOrName
            : currentCart.findIndex((i) => i.name === indexOrName);
        if (index === -1) return;
        if (quantity <= 0) {
          get().removeFromCart(index);
        } else {
          set({
            cart: currentCart.map((i, idx) =>
              idx === index ? { ...i, atCartQty: quantity } : i
            ),
          });
        }
      },

      clearCart: () => {
        set({
          cart: [],
          customerName: "",
          customerPhone: "",
          orderType: "Take Away",
          discount: 0,
          notes: "",
          paymentMethod: "Cash",
        });
      },
      setCustomerName: (name) => set({ customerName: name }),
      setCustomerPhone: (phone) => set({ customerPhone: phone }),
      setOrderType: (type) => set({ orderType: type }),
      setDiscount: (discount) => set({ discount: Number(discount) || 0 }),
      setNotes: (notes) => set({ notes }),
      setPaymentMethod: (method) => set({ paymentMethod: method }),

      // App Settings & Cache Actions
      setSettings: (settings) => set({ settings }),
      setMenuItems: (menuItems) => set({ menuItems }),

      // Auth Actions
      login: (username, role) => {
        set({ currentUser: { username, role } });
      },
      logout: () => {
        set({ currentUser: null });
      },
    }),
    {
      name: "smart-cart-store",
    }
  )
);
