"use client";

import { useEffect, useState } from "react";

import AdminGuard from "@/components/AdminGuard";
import { fetchOrdersAction } from "@/app/actions";
import {
  TrendingUp,
  ShoppingBag,
  CreditCard,
  CircleDollarSign,
  Users,
  Utensils,
  DollarSign,
  Calendar,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
} from "recharts";

export default function AdminDashboard() {
  const [orders, setOrders] = useState([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    async function loadData() {
      const dbOrders = await fetchOrdersAction();
      if (dbOrders) setOrders(dbOrders);
    }
    loadData();
  }, []);

  // Calculate statistics
  const today = new Date().toISOString().split("T")[0];
  const todayOrders = orders.filter(
    (o) => new Date(o.createdAt).toISOString().split("T")[0] === today
  );

  const todaySales = todayOrders.reduce((sum, o) => sum + o.total, 0);
  const todayCount = todayOrders.length;
  
  const cashPayments = todayOrders
    .filter((o) => o.paymentMethod === "Cash" && o.paymentStatus === "Paid")
    .reduce((sum, o) => sum + o.total, 0);
    
  const upiPayments = todayOrders
    .filter((o) => o.paymentMethod === "UPI" && o.paymentStatus === "Paid")
    .reduce((sum, o) => sum + o.total, 0);

  const averageOrderValue = todayCount > 0 ? Math.round(todaySales / todayCount) : 0;
  
  const pendingOrders = todayOrders.filter((o) => ["New", "Preparing", "Ready"].includes(o.status)).length;
  const completedOrders = todayOrders.filter((o) => o.status === "Completed").length;
  const cancelledOrders = todayOrders.filter((o) => o.status === "Cancelled").length;

  // Chart 1: Daily Sales Trend
  const dailyDataMap = {};
  // Initialize last 7 days to ensure a good visual even with no data
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
    const fullDateKey = d.toISOString().split("T")[0];
    dailyDataMap[fullDateKey] = { date: dateStr, sales: 0, orders: 0 };
  }

  orders.forEach((o) => {
    const d = new Date(o.createdAt);
    const dateStr = d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
    const fullDateKey = d.toISOString().split("T")[0];
    
    if (!dailyDataMap[fullDateKey]) {
      dailyDataMap[fullDateKey] = { date: dateStr, sales: 0, orders: 0 };
    }
    
    dailyDataMap[fullDateKey].sales += o.total;
    dailyDataMap[fullDateKey].orders += 1;
  });

  const dailyChartData = Object.keys(dailyDataMap)
    .sort()
    .map(k => dailyDataMap[k]);

  // Chart 2: Top Selling Items
  const itemSalesMap = {};
  orders.forEach((o) => {
    o.items.forEach((item) => {
      if (itemSalesMap[item.name]) {
        itemSalesMap[item.name].quantity += item.quantity;
        itemSalesMap[item.name].revenue += item.subtotal;
      } else {
        itemSalesMap[item.name] = { name: item.name, quantity: item.quantity, revenue: item.subtotal };
      }
    });
  });

  const topItemsData = Object.values(itemSalesMap)
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5);

  // Chart 3: Payment Method Split
  const paymentSplitData = [
    { name: "UPI", value: upiPayments || 1 }, // Default fallback to 1 for visual layout
    { name: "Cash", value: cashPayments || 1 },
  ];

  const PIE_COLORS = ["#8c5b47", "#e2d3c1"];

  return (
    <AdminGuard>
      <div className="flex flex-col min-h-screen bg-cream-light font-sans text-coco-dark">
        

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* Dashboard Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div>
            <h1 className="text-2xl font-black text-coco-dark flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-coco-accent" />
              Owner Dashboard
            </h1>
            <p className="text-xs text-coco-light">
              Real-time analytics and food cart sales data for Today
            </p>
          </div>
          <div className="bg-cream-base border border-cream-deep/60 px-4 py-2 rounded-xl flex items-center gap-2 text-xs font-bold shadow-sm">
            <Calendar className="w-4 h-4 text-coco-accent" />
            <span>Today's Date: {new Date().toLocaleDateString("en-IN", { dateStyle: "long" })}</span>
          </div>
        </div>

        {/* KPI CARDS GRID */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Today's Revenue */}
          <div className="bg-white border border-cream-deep/40 rounded-2xl p-4 shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-center text-coco-light">
              <span className="text-xs font-bold uppercase tracking-wider">Today's Sales</span>
              <CircleDollarSign className="w-5 h-5 text-coco-accent" />
            </div>
            <div className="mt-4">
              <span className="text-2xl font-black">₹{todaySales}</span>
              <p className="text-[10px] text-green-600 font-bold mt-1">Live sales counting</p>
            </div>
          </div>

          {/* Card 2: Today's Orders */}
          <div className="bg-white border border-cream-deep/40 rounded-2xl p-4 shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-center text-coco-light">
              <span className="text-xs font-bold uppercase tracking-wider">Total Orders</span>
              <ShoppingBag className="w-5 h-5 text-coco-accent" />
            </div>
            <div className="mt-4">
              <span className="text-2xl font-black">{todayCount}</span>
              <p className="text-[10px] text-coco-light font-medium mt-1">
                Avg Value: ₹{averageOrderValue}
              </p>
            </div>
          </div>

          {/* Card 3: UPI Payments */}
          <div className="bg-white border border-cream-deep/40 rounded-2xl p-4 shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-center text-coco-light">
              <span className="text-xs font-bold uppercase tracking-wider">UPI Split</span>
              <CreditCard className="w-5 h-5 text-blue-600" />
            </div>
            <div className="mt-4">
              <span className="text-2xl font-black">₹{upiPayments}</span>
              <p className="text-[10px] text-coco-light font-medium mt-1">
                {todaySales > 0 ? Math.round((upiPayments / todaySales) * 100) : 0}% of sales
              </p>
            </div>
          </div>

          {/* Card 4: Cash Payments */}
          <div className="bg-white border border-cream-deep/40 rounded-2xl p-4 shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-center text-coco-light">
              <span className="text-xs font-bold uppercase tracking-wider">Cash Split</span>
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
            <div className="mt-4">
              <span className="text-2xl font-black">₹{cashPayments}</span>
              <p className="text-[10px] text-coco-light font-medium mt-1">
                {todaySales > 0 ? Math.round((cashPayments / todaySales) * 100) : 0}% of sales
              </p>
            </div>
          </div>
        </section>

        {/* STATUS COUNTER BANNER */}
        <section className="bg-cream-base border border-cream-deep/30 rounded-2xl p-3 grid grid-cols-3 text-center shadow-sm">
          <div>
            <span className="text-[10px] font-bold text-coco-light block uppercase">Pending</span>
            <span className="text-base font-black text-orange-600">{pendingOrders}</span>
          </div>
          <div className="border-l border-r border-cream-deep/60">
            <span className="text-[10px] font-bold text-coco-light block uppercase">Completed</span>
            <span className="text-base font-black text-green-700">{completedOrders}</span>
          </div>
          <div>
            <span className="text-[10px] font-bold text-coco-light block uppercase">Cancelled</span>
            <span className="text-base font-black text-red-600">{cancelledOrders}</span>
          </div>
        </section>

        {/* CHARTS CONTAINER */}
        {mounted && (
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Chart 1: Daily Sales Trend (Col span 2) */}
            <div className="lg:col-span-2 bg-white border border-cream-deep/40 rounded-3xl p-5 shadow-sm">
              <h3 className="font-extrabold text-sm mb-4 uppercase tracking-wider text-coco-medium">
                Daily Sales Trend (₹)
              </h3>
              <div className="h-64 sm:h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dailyChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f4ece1" />
                    <XAxis dataKey="date" stroke="#8c5b47" style={{ fontSize: 10, fontWeight: "bold" }} />
                    <YAxis stroke="#8c5b47" style={{ fontSize: 10, fontWeight: "bold" }} />
                    <Tooltip contentStyle={{ background: "#fdfaf7", border: "1px solid #e2d3c1", borderRadius: 8 }} />
                    <Line
                      type="monotone"
                      dataKey="sales"
                      stroke="#8c5b47"
                      strokeWidth={3}
                      dot={{ r: 4 }}
                      activeDot={{ r: 7 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 2: Payment Splits (Col span 1) */}
            <div className="bg-white border border-cream-deep/40 rounded-3xl p-5 shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="font-extrabold text-sm mb-4 uppercase tracking-wider text-coco-medium">
                  Payment Method Share
                </h3>
                <div className="h-48 w-full flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={paymentSplitData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {paymentSplitData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="flex justify-around text-xs font-bold mt-2">
                <div className="flex items-center gap-1.5">
                  <span className="w-3.5 h-3.5 rounded bg-[#8c5b47]"></span>
                  <span>UPI: ₹{upiPayments}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3.5 h-3.5 rounded bg-[#e2d3c1]"></span>
                  <span>Cash: ₹{cashPayments}</span>
                </div>
              </div>
            </div>

            {/* Chart 3: Top Selling Items (Col span 3) */}
            <div className="lg:col-span-3 bg-white border border-cream-deep/40 rounded-3xl p-5 shadow-sm">
              <h3 className="font-extrabold text-sm mb-4 uppercase tracking-wider text-coco-medium">
                Top 5 Best-Selling Drinks (By Quantity)
              </h3>
              <div className="h-64 sm:h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topItemsData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#f4ece1" />
                    <XAxis type="number" stroke="#8c5b47" style={{ fontSize: 10, fontWeight: "bold" }} />
                    <YAxis
                      dataKey="name"
                      type="category"
                      stroke="#8c5b47"
                      width={120}
                      style={{ fontSize: 10, fontWeight: "bold" }}
                    />
                    <Tooltip contentStyle={{ background: "#fdfaf7", border: "1px solid #e2d3c1", borderRadius: 8 }} />
                    <Bar dataKey="quantity" fill="#8c5b47" radius={[0, 8, 8, 0]}>
                      {topItemsData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill="#8c5b47" opacity={1 - index * 0.15} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </section>
        )}
      </main>
      </div>
    </AdminGuard>
  );
}
