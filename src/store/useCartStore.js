import { create } from "zustand";
import { persist } from "zustand/middleware";
import { defaultMenuItems } from "@/lib/mockData";

export const useCartStore = create(
  persist(
    (set, get) => ({
      // Cart State
      cart: [],
      customerName: "",
      customerPhone: "",
      orderType: "Parcel",
      discount: 0,
      notes: "",
      paymentMethod: "Cash",

      // Menu & Settings Cache (for fast offline reading)
      menuItems: defaultMenuItems,
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
      // Cart Actions - Dual Order Mode Support (Parcel & At Cart per item) & Glass Size
      addParcelItem: (item, size = "250 ml") => {
        const resolvedSize = size || item.size || "250 ml";
        const unitPrice =
          resolvedSize === "200 ml"
            ? (item.price200ml || item.price)
            : (item.price250ml || item.price);
        const unitCostPrice =
          resolvedSize === "200 ml"
            ? (item.costPrice200ml || item.costPrice || 0)
            : (item.costPrice250ml || item.costPrice || 0);

        const currentCart = get().cart;
        const existingIndex = currentCart.findIndex(
          (i) => i.name === item.name && (i.size || "250 ml") === resolvedSize
        );
        if (existingIndex > -1) {
          set({
            cart: currentCart.map((i, idx) =>
              idx === existingIndex
                ? {
                    ...i,
                    price: unitPrice,
                    costPrice: unitCostPrice,
                    size: resolvedSize,
                    parcelQty: (i.parcelQty || 0) + 1,
                    atCartQty: i.atCartQty || 0,
                    quantity: (i.parcelQty || 0) + 1 + (i.atCartQty || 0),
                    subtotal: ((i.parcelQty || 0) + 1 + (i.atCartQty || 0)) * unitPrice,
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
                size: resolvedSize,
                price: unitPrice,
                costPrice: unitCostPrice,
                parcelQty: 1,
                atCartQty: 0,
                quantity: 1,
                subtotal: unitPrice,
              },
            ],
          });
        }
      },

      addAtCartItem: (item, size = "250 ml") => {
        const resolvedSize = size || item.size || "250 ml";
        const unitPrice =
          resolvedSize === "200 ml"
            ? (item.price200ml || item.price)
            : (item.price250ml || item.price);
        const unitCostPrice =
          resolvedSize === "200 ml"
            ? (item.costPrice200ml || item.costPrice || 0)
            : (item.costPrice250ml || item.costPrice || 0);

        const currentCart = get().cart;
        const existingIndex = currentCart.findIndex(
          (i) => i.name === item.name && (i.size || "250 ml") === resolvedSize
        );
        if (existingIndex > -1) {
          set({
            cart: currentCart.map((i, idx) =>
              idx === existingIndex
                ? {
                    ...i,
                    price: unitPrice,
                    costPrice: unitCostPrice,
                    size: resolvedSize,
                    parcelQty: i.parcelQty || 0,
                    atCartQty: (i.atCartQty || 0) + 1,
                    quantity: (i.parcelQty || 0) + (i.atCartQty || 0) + 1,
                    subtotal: ((i.parcelQty || 0) + (i.atCartQty || 0) + 1) * unitPrice,
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
                size: resolvedSize,
                price: unitPrice,
                costPrice: unitCostPrice,
                parcelQty: 0,
                atCartQty: 1,
                quantity: 1,
                subtotal: unitPrice,
              },
            ],
          });
        }
      },

      updateParcelQty: (indexOrKey, quantity) => {
        const currentCart = get().cart;
        const index =
          typeof indexOrKey === "number"
            ? indexOrKey
            : currentCart.findIndex(
                (i) => i.name === indexOrKey || `${i.name}-${i.size}` === indexOrKey
              );

        if (index === -1 || index >= currentCart.length) return;
        const target = currentCart[index];
        const newParcelQty = Math.max(0, quantity);
        const currentAtCartQty = target.atCartQty || 0;

        if (newParcelQty <= 0 && currentAtCartQty <= 0) {
          set({ cart: currentCart.filter((_, idx) => idx !== index) });
        } else {
          const totalQ = newParcelQty + currentAtCartQty;
          set({
            cart: currentCart.map((i, idx) =>
              idx === index
                ? {
                    ...i,
                    parcelQty: newParcelQty,
                    quantity: totalQ,
                    subtotal: totalQ * i.price,
                  }
                : i
            ),
          });
        }
      },

      updateAtCartQty: (indexOrKey, quantity) => {
        const currentCart = get().cart;
        const index =
          typeof indexOrKey === "number"
            ? indexOrKey
            : currentCart.findIndex(
                (i) => i.name === indexOrKey || `${i.name}-${i.size}` === indexOrKey
              );

        if (index === -1 || index >= currentCart.length) return;
        const target = currentCart[index];
        const currentParcelQty = target.parcelQty || 0;
        const newAtCartQty = Math.max(0, quantity);

        if (currentParcelQty <= 0 && newAtCartQty <= 0) {
          set({ cart: currentCart.filter((_, idx) => idx !== index) });
        } else {
          const totalQ = currentParcelQty + newAtCartQty;
          set({
            cart: currentCart.map((i, idx) =>
              idx === index
                ? {
                    ...i,
                    atCartQty: newAtCartQty,
                    quantity: totalQ,
                    subtotal: totalQ * i.price,
                  }
                : i
            ),
          });
        }
      },

      removeFromCart: (indexOrKey) => {
        const currentCart = get().cart;
        if (typeof indexOrKey === "number") {
          set({ cart: currentCart.filter((_, idx) => idx !== indexOrKey) });
        } else {
          set({
            cart: currentCart.filter(
              (i) => i.name !== indexOrKey && `${i.name}-${i.size}` !== indexOrKey
            ),
          });
        }
      },

      // Helper getters
      getParcelQty: (itemName, size = "250 ml") => {
        const item = get().cart.find(
          (i) => i.name === itemName && (i.size || "250 ml") === size
        );
        return item?.parcelQty || 0;
      },
      getAtCartQty: (itemName, size = "250 ml") => {
        const item = get().cart.find(
          (i) => i.name === itemName && (i.size || "250 ml") === size
        );
        return item?.atCartQty || 0;
      },
      getTotalQty: (itemName, size) => {
        if (size) {
          const item = get().cart.find(
            (i) => i.name === itemName && (i.size || "250 ml") === size
          );
          return (item?.parcelQty || 0) + (item?.atCartQty || 0);
        }
        return get()
          .cart.filter((i) => i.name === itemName)
          .reduce((sum, i) => sum + (i.parcelQty || 0) + (i.atCartQty || 0), 0);
      },

      // Backward compatibility wrappers
      addToCart: (item, targetMode, size = "250 ml") => {
        const mode = targetMode || item.orderMode || "AT_CART";
        if (mode === "PARCEL" || mode === "Parcel") {
          get().addParcelItem(item, size);
        } else {
          get().addAtCartItem(item, size);
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
          orderType: "Parcel",
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
      setMenuItems: (items) =>
        set({
          menuItems: items && items.length > 0 ? items : defaultMenuItems,
        }),

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
