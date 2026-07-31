"use client";

import { useEffect, useState } from "react";

import AdminGuard from "@/components/AdminGuard";
import { fetchCustomersAction, saveCustomerAction } from "@/app/actions";
import {
  Users,
  Search,
  Calendar,
  FileSpreadsheet,
  Award,
  Coffee,
  Check,
  Edit2,
  X,
  MessageSquareCode,
} from "lucide-react";
import Navbar from "@/components/Navbar";

export default function CustomerManagement() {
  const [customers, setCustomers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  
  // Note editing state
  const [editNotesId, setEditNotesId] = useState(null);
  const [editedNotes, setEditedNotes] = useState("");

  const loadCustomers = async () => {
    const dbCustomers = await fetchCustomersAction();
    if (dbCustomers) setCustomers(dbCustomers);
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  // Save notes updates
  const handleSaveNotes = async (cust) => {
    const updated = {
      ...cust,
      notes: editedNotes,
    };
    await saveCustomerAction(updated);
    setEditNotesId(null);
    setEditedNotes("");
    loadCustomers();
  };

  // Filter customer list
  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery)
  );

  // Calculate high-level stats
  const totalCustomers = customers.length;
  const regularCustomers = customers.filter((c) => c.visits >= 5).length;
  const totalCustomerSpend = customers.reduce((sum, c) => sum + (c.totalSpend || 0), 0);
  const avgCustomerSpend = totalCustomers > 0 ? Math.round(totalCustomerSpend / totalCustomers) : 0;

  // Export to CSV
  const handleExportCSV = () => {
    if (customers.length === 0) return alert("No customer data to export!");
    
    const headers = ["Name", "Phone", "Visits", "Orders", "Total Spend (INR)", "Favorite Item", "Last Visit", "Notes"];
    const rows = customers.map((c) => [
      c.name,
      c.phone,
      c.visits,
      c.orders,
      c.totalSpend,
      c.favoriteItem || "N/A",
      c.lastVisit ? new Date(c.lastVisit).toLocaleDateString() : "N/A",
      c.notes || ""
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((r) => r.map(val => `"${val}"`).join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `prasad_coco_customers_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <AdminGuard>
      <div className="flex flex-col min-h-screen bg-cream-light font-sans text-coco-dark">
        {/* <Navbar /> */}

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* Header Block */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h1 className="text-2xl font-black text-coco-dark flex items-center gap-2">
              <Users className="w-6 h-6 text-coco-accent" />
              Customer Database
            </h1>
            <p className="text-xs text-coco-light">
              Track customer visit counts, total lifetime spends, and special preferences
            </p>
          </div>
          <button
            onClick={handleExportCSV}
            className="bg-coco-accent hover:bg-coco-light text-cream-light font-bold text-xs px-4 py-2.5 rounded-xl shadow-md transition-colors flex items-center gap-1.5 border border-coco-accent"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Export to CSV</span>
          </button>
        </div>

        {/* STATS BANNER */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-cream-deep/40 rounded-2xl p-4 shadow-sm flex flex-col justify-between">
            <span className="text-xs font-bold text-coco-light uppercase tracking-wider">
              Total Profiles
            </span>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-2xl font-black">{totalCustomers}</span>
              <span className="text-[10px] text-coco-accent font-bold">customers</span>
            </div>
          </div>

          <div className="bg-white border border-cream-deep/40 rounded-2xl p-4 shadow-sm flex flex-col justify-between">
            <span className="text-xs font-bold text-coco-light uppercase tracking-wider">
              Repeat Customers
            </span>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-green-700">{regularCustomers}</span>
              <span className="text-[10px] text-coco-accent font-bold">5+ visits</span>
            </div>
          </div>

          <div className="bg-white border border-cream-deep/40 rounded-2xl p-4 shadow-sm flex flex-col justify-between">
            <span className="text-xs font-bold text-coco-light uppercase tracking-wider">
              Total Customer Spend
            </span>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-2xl font-black">₹{totalCustomerSpend}</span>
              <span className="text-[10px] text-coco-accent font-bold">gross</span>
            </div>
          </div>

          <div className="bg-white border border-cream-deep/40 rounded-2xl p-4 shadow-sm flex flex-col justify-between">
            <span className="text-xs font-bold text-coco-light uppercase tracking-wider">
              Average Life Value
            </span>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-2xl font-black">₹{avgCustomerSpend}</span>
              <span className="text-[10px] text-coco-accent font-bold">per head</span>
            </div>
          </div>
        </section>

        {/* SEARCH FILTER */}
        <div className="relative max-w-md w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-coco-light" />
          <input
            type="text"
            placeholder="Search customers by name or mobile number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-cream-deep bg-white focus:outline-none focus:ring-2 focus:ring-coco-accent text-sm"
          />
        </div>

        {/* CUSTOMERS TABLE */}
        <section className="bg-white border border-cream-deep/40 rounded-3xl overflow-hidden shadow-md">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-cream-base/40 border-b border-cream-deep/30 font-bold text-coco-light uppercase tracking-wider">
                  <th className="py-4 px-4">Customer Details</th>
                  <th className="py-4 px-3">Visits / Orders</th>
                  <th className="py-4 px-3">Lifetime Spend</th>
                  <th className="py-4 px-3">Favorite Drink</th>
                  <th className="py-4 px-3">Last Visit</th>
                  <th className="py-4 px-4">Customer Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-base/50">
                {filteredCustomers.length > 0 ? (
                  filteredCustomers.map((cust) => {
                    const isEditingNotes = editNotesId === (cust.id || cust._id);
                    const isVip = cust.visits >= 8;
                    return (
                      <tr key={cust.id || cust._id} className="hover:bg-cream-light/40 transition-colors">
                        {/* Name & Phone */}
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="font-extrabold text-sm text-coco-dark">
                                  {cust.name}
                                </span>
                                {isVip && (
                                  <span className="bg-coco-accent/15 text-coco-accent text-[9px] font-black px-2 py-0.5 rounded-full flex items-center gap-0.5">
                                    <Award className="w-2.5 h-2.5" /> VIP
                                  </span>
                                )}
                              </div>
                              <span className="block text-[10px] text-coco-light font-bold mt-0.5">
                                {cust.phone || "No phone added"}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Visit Count */}
                        <td className="py-4 px-3">
                          <span className="font-bold text-sm text-coco-dark bg-cream-base/50 px-2.5 py-1 rounded-lg">
                            {cust.visits || 0}
                          </span>
                        </td>

                        {/* Total Spend */}
                        <td className="py-4 px-3 font-extrabold text-sm text-coco-dark">
                          ₹{cust.totalSpend || 0}
                        </td>

                        {/* Favorite Drink */}
                        <td className="py-4 px-3">
                          {cust.favoriteItem ? (
                            <span className="inline-flex items-center gap-1 bg-coco-accent/10 text-coco-accent px-2 py-1 rounded-lg font-bold">
                              <Coffee className="w-3.5 h-3.5" />
                              {cust.favoriteItem}
                            </span>
                          ) : (
                            <span className="text-gray-400 font-medium">None ordered</span>
                          )}
                        </td>

                        {/* Last Visit */}
                        <td className="py-4 px-3 text-coco-light font-semibold">
                          {cust.lastVisit ? (
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5" />
                              {new Date(cust.lastVisit).toLocaleDateString("en-IN", {
                                dateStyle: "medium",
                              })}
                            </span>
                          ) : (
                            "N/A"
                          )}
                        </td>

                        {/* Notes Section with Inline Editing */}
                        <td className="py-4 px-4">
                          {isEditingNotes ? (
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                value={editedNotes}
                                onChange={(e) => setEditedNotes(e.target.value)}
                                className="px-2 py-1 border border-cream-deep rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-coco-accent"
                                placeholder="Edit customer note..."
                              />
                              <button
                                onClick={() => handleSaveNotes(cust)}
                                className="bg-coco-accent text-white p-1 rounded-md"
                              >
                                <Check className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => {
                                  setEditNotesId(null);
                                  setEditedNotes("");
                                }}
                                className="bg-cream-base text-coco-light p-1 rounded-md border border-cream-deep/30"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-between gap-2 max-w-[200px]">
                              <span className="text-coco-light/95 italic truncate">
                                {cust.notes || "Add personal preference..."}
                              </span>
                              <button
                                onClick={() => {
                                  setEditNotesId(cust.id || cust._id);
                                  setEditedNotes(cust.notes || "");
                                }}
                                className="text-coco-light/60 hover:text-coco-accent p-1 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity hover:bg-cream-base/30 rounded"
                                style={{ opacity: 1 }} // Fallback visible
                                title="Edit notes"
                              >
                                <Edit2 className="w-3 h-3" />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="6" className="py-12 text-center text-coco-light font-bold">
                      No customer profiles matched the criteria.
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
