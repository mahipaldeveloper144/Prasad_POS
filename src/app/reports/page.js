"use client";

import { useEffect, useState } from "react";

import AdminGuard from "@/components/AdminGuard";
import { fetchOrdersAction, fetchMenuItemsAction } from "@/app/actions";
import {
  FileBarChart,
  Calendar,
  FileSpreadsheet,
  Printer,
  ChevronRight,
  Search,
  Filter,
  DollarSign,
  Briefcase,
  Layers,
  ShoppingBag,
} from "lucide-react";

export default function ReportsScreen() {
  const [orders, setOrders] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [dateFilter, setDateFilter] = useState("Today"); // Today, Yesterday, Week, Month, Custom
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    async function loadData() {
      const dbOrders = await fetchOrdersAction();
      if (dbOrders) setOrders(dbOrders);
      
      const dbItems = await fetchMenuItemsAction();
      if (dbItems) setMenuItems(dbItems);
    }
    loadData();
  }, []);

  // Filter orders based on Date selection
  const getFilteredOrders = () => {
    const now = new Date();
    const todayStr = now.toISOString().split("T")[0];

    const yesterday = new Date();
    yesterday.setDate(now.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split("T")[0];

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(now.getDate() - 7);

    const oneMonthAgo = new Date();
    oneMonthAgo.setDate(now.getDate() - 30);

    return orders.filter((order) => {
      const orderDate = new Date(order.createdAt);
      const orderDateStr = orderDate.toISOString().split("T")[0];

      let matchesDate = false;
      if (dateFilter === "Today") {
        matchesDate = orderDateStr === todayStr;
      } else if (dateFilter === "Yesterday") {
        matchesDate = orderDateStr === yesterdayStr;
      } else if (dateFilter === "Week") {
        matchesDate = orderDate >= oneWeekAgo;
      } else if (dateFilter === "Month") {
        matchesDate = orderDate >= oneMonthAgo;
      } else if (dateFilter === "Custom") {
        const start = startDate ? new Date(startDate) : null;
        const end = endDate ? new Date(endDate) : null;
        if (end) end.setHours(23, 59, 59, 999); // include entire end day

        if (start && end) {
          matchesDate = orderDate >= start && orderDate <= end;
        } else if (start) {
          matchesDate = orderDate >= start;
        } else if (end) {
          matchesDate = orderDate <= end;
        } else {
          matchesDate = true;
        }
      }

      const matchesSearch =
        order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.paymentMethod.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesDate && matchesSearch;
    });
  };

  const filteredOrders = getFilteredOrders();

  // Computations
  const totalSales = filteredOrders
    .filter((o) => o.status !== "Cancelled" && o.paymentStatus === "Paid")
    .reduce((sum, o) => sum + o.total, 0);

  const totalOrders = filteredOrders.length;
  
  const cashSales = filteredOrders
    .filter((o) => o.paymentMethod === "Cash" && o.status !== "Cancelled" && o.paymentStatus === "Paid")
    .reduce((sum, o) => sum + o.total, 0);

  const upiSales = filteredOrders
    .filter((o) => o.paymentMethod === "UPI" && o.status !== "Cancelled" && o.paymentStatus === "Paid")
    .reduce((sum, o) => sum + o.total, 0);

  const cancelledCount = filteredOrders.filter((o) => o.status === "Cancelled").length;

  // Calculate COGS (Cost of Goods Sold) and Profit
  const totalCost = filteredOrders
    .filter((o) => o.status !== "Cancelled" && o.paymentStatus === "Paid")
    .reduce((sum, o) => {
      let orderCost = 0;
      o.items.forEach((item) => {
        // Find cost price from menu catalog fallback to 45% of price
        const menuMatch = menuItems.find((m) => m.name === item.name);
        const unitCost = menuMatch ? menuMatch.costPrice || 0 : Math.round(item.price * 0.45);
        orderCost += unitCost * item.quantity;
      });
      return sum + orderCost;
    }, 0);

  const netProfit = Math.max(0, totalSales - totalCost);

  // Item-Level Order Mode breakdown
  const atCartItemsCount = filteredOrders
    .filter((o) => o.status !== "Cancelled")
    .reduce((sum, o) => {
      const atCartInOrder = o.items
        .filter((i) => (i.orderMode || "AT_CART") === "AT_CART")
        .reduce((itemSum, i) => itemSum + i.quantity, 0);
      return sum + atCartInOrder;
    }, 0);

  const parcelItemsCount = filteredOrders
    .filter((o) => o.status !== "Cancelled")
    .reduce((sum, o) => {
      const parcelInOrder = o.items
        .filter((i) => (i.orderMode || "AT_CART") === "PARCEL")
        .reduce((itemSum, i) => itemSum + i.quantity, 0);
      return sum + parcelInOrder;
    }, 0);

  // Export filtered orders to CSV
  const handleExportCSV = () => {
    if (filteredOrders.length === 0) return alert("No data available for export!");

    const headers = [
      "Order Number",
      "Customer",
      "Phone",
      "Date",
      "Items (Name x Qty [Mode])",
      "Subtotal",
      "Discount",
      "Total",
      "Payment Method",
      "Status",
    ];

    const rows = filteredOrders.map((o) => [
      o.orderNumber,
      o.customerName,
      o.customerPhone || "N/A",
      new Date(o.createdAt).toLocaleString(),
      o.items.map((i) => `${i.name}(${i.quantity})[${i.orderMode === "PARCEL" ? "PARCEL" : "AT_CART"}]`).join(";"),
      o.subtotal,
      o.discount,
      o.total,
      o.paymentMethod,
      o.status,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((r) => r.map((val) => `"${val}"`).join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `prasad_coco_report_${dateFilter}_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <AdminGuard>
      <div className="flex flex-col min-h-screen bg-cream-light font-sans text-coco-dark">
        

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* Title & Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h1 className="text-2xl font-black text-coco-dark flex items-center gap-2">
              <FileBarChart className="w-6 h-6 text-coco-accent" />
              Sales & Financial Reports
            </h1>
            <p className="text-xs text-coco-light">
              Audit sales, payment channels, COGS, and exact cart profit margins
            </p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleExportCSV}
              className="flex-1 sm:flex-none bg-coco-accent hover:bg-coco-light text-cream-light font-bold text-xs px-4 py-2.5 rounded-xl shadow-md transition-colors flex items-center justify-center gap-1.5 border border-coco-accent"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={() => window.print()}
              className="flex-1 sm:flex-none bg-white hover:bg-cream-base/40 text-coco-dark font-bold text-xs px-4 py-2.5 rounded-xl shadow-sm border border-cream-deep/60 transition-colors flex items-center justify-center gap-1.5 no-print"
            >
              <Printer className="w-4 h-4" />
              <span>Print Report</span>
            </button>
          </div>
        </div>

        {/* REPORT FILTERING BAR (Hidden on print) */}
        <section className="bg-white border border-cream-deep/40 rounded-3xl p-4 sm:p-5 shadow-sm space-y-4 no-print">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-coco-accent" />
              <span className="font-extrabold text-sm text-coco-medium">Filters</span>
            </div>
            
            {/* Quick Date buttons */}
            <div className="flex gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
              {["Today", "Yesterday", "Week", "Month", "Custom"].map((f) => (
                <button
                  key={f}
                  onClick={() => setDateFilter(f)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    dateFilter === f
                      ? "bg-coco-medium text-cream-light shadow-sm"
                      : "bg-cream-base/50 text-coco-light hover:bg-cream-deep/40"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Date select inputs */}
          {dateFilter === "Custom" && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-cream-base">
              <div>
                <label className="text-[10px] font-bold text-coco-light block mb-1">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl border border-cream-deep text-xs focus:outline-none focus:ring-1 focus:ring-coco-accent bg-white"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-coco-light block mb-1">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl border border-cream-deep text-xs focus:outline-none focus:ring-1 focus:ring-coco-accent bg-white"
                />
              </div>
            </div>
          )}

          {/* Search Table input */}
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-coco-light" />
            <input
              type="text"
              placeholder="Search table by order, name, UPI..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-cream-deep text-xs focus:outline-none focus:ring-1 focus:ring-coco-accent bg-white"
            />
          </div>
        </section>

        {/* FINANCIAL SUMMARY & ITEM MODE KPI CARDS */}
        <section className="grid grid-cols-2 lg:grid-cols-6 gap-4">
          <div className="bg-white border border-cream-deep/40 rounded-2xl p-4 shadow-sm">
            <span className="text-[10px] font-bold text-coco-light uppercase block">Total Sales</span>
            <span className="text-xl font-black mt-1 block">₹{totalSales}</span>
          </div>

          <div className="bg-white border border-cream-deep/40 rounded-2xl p-4 shadow-sm">
            <span className="text-[10px] font-bold text-coco-light uppercase block">Total Orders</span>
            <span className="text-xl font-black mt-1 block">{totalOrders}</span>
          </div>

          <div className="bg-white border border-cream-deep/40 rounded-2xl p-4 shadow-sm">
            <span className="text-[10px] font-bold text-coco-light uppercase block">At Cart Items</span>
            <span className="text-xl font-black mt-1 block text-emerald-600">{atCartItemsCount} items</span>
          </div>

          <div className="bg-white border border-cream-deep/40 rounded-2xl p-4 shadow-sm">
            <span className="text-[10px] font-bold text-coco-light uppercase block">Parcel Items</span>
            <span className="text-xl font-black mt-1 block text-amber-600">{parcelItemsCount} items</span>
          </div>

          <div className="bg-white border border-cream-deep/40 rounded-2xl p-4 shadow-sm">
            <span className="text-[10px] font-bold text-coco-light uppercase block">Cash / UPI</span>
            <span className="text-sm font-black mt-1 block text-coco-dark">₹{cashSales} / ₹{upiSales}</span>
          </div>

          <div className="bg-coco-medium text-cream-light rounded-2xl p-4 shadow-sm col-span-2 lg:col-span-1">
            <span className="text-[10px] font-bold text-cream-deep uppercase block">Net Profit</span>
            <span className="text-xl font-black mt-1 block">₹{netProfit}</span>
            <span className="text-[9px] text-cream-base/80 block mt-0.5">Margin: {totalSales > 0 ? Math.round((netProfit / totalSales) * 100) : 0}%</span>
          </div>
        </section>

        {/* REPORT TABLE */}
        <section className="bg-white border border-cream-deep/40 rounded-3xl overflow-hidden shadow-md">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-cream-base/40 border-b border-cream-deep/30 font-bold text-coco-light uppercase tracking-wider">
                  <th className="py-4 px-4">Order No</th>
                  <th className="py-4 px-3">Customer</th>
                  <th className="py-4 px-3">Time</th>
                  <th className="py-4 px-3">Items Ordered & Mode</th>
                  <th className="py-4 px-3">Payment</th>
                  <th className="py-4 px-3">Status</th>
                  <th className="py-4 px-4 text-right">Total Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-base/50">
                {filteredOrders.length > 0 ? (
                  filteredOrders.map((o) => (
                    <tr key={o.id || o._id} className="hover:bg-cream-light/40 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-coco-dark">{o.orderNumber}</td>
                      <td className="py-3.5 px-3">
                        <span className="font-extrabold block text-coco-dark">{o.customerName}</span>
                        {o.customerPhone && (
                          <span className="text-[9px] text-coco-light block mt-0.5">{o.customerPhone}</span>
                        )}
                      </td>
                      <td className="py-3.5 px-3 text-coco-light font-semibold">
                        {new Date(o.createdAt).toLocaleDateString()} {new Date(o.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="py-3.5 px-3 font-semibold text-coco-light">
                        <div className="flex flex-wrap gap-1.5">
                          {o.items.map((i, idx) => {
                            const isParcel = (i.orderMode || "AT_CART") === "PARCEL";
                            return (
                              <span
                                key={idx}
                                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                                  isParcel
                                    ? "bg-amber-50 text-amber-800 border-amber-200"
                                    : "bg-emerald-50 text-emerald-800 border-emerald-200"
                                }`}
                              >
                                {i.name} ({i.quantity})
                                <span className={`text-[8px] uppercase font-black px-1 py-0.2 rounded ${isParcel ? "bg-amber-200 text-amber-900" : "bg-emerald-200 text-emerald-900"}`}>
                                  {isParcel ? "Parcel" : "At Cart"}
                                </span>
                              </span>
                            );
                          })}
                        </div>
                      </td>
                      <td className="py-3.5 px-3">
                        <span className="font-bold text-coco-dark block">{o.paymentMethod}</span>
                        <span
                          className={`text-[9px] font-bold ${
                            o.paymentStatus === "Paid" ? "text-green-600" : "text-orange-500"
                          }`}
                        >
                          {o.paymentStatus}
                        </span>
                      </td>
                      <td className="py-3.5 px-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                            o.status === "Completed"
                              ? "bg-green-100 text-green-700"
                              : o.status === "Cancelled"
                              ? "bg-red-100 text-red-600"
                              : "bg-orange-100 text-orange-600"
                          }`}
                        >
                          {o.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-black text-sm text-coco-dark">
                        ₹{o.total}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="py-12 text-center text-coco-light font-bold">
                      No matching records found for the selected range.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
      </div>
    </AdminGuard>
  );
}
