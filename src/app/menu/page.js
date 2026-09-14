"use client";

import { useEffect, useState } from "react";

import AdminGuard from "@/components/AdminGuard";
import {
  fetchMenuItemsAction,
  saveMenuItemAction,
  deleteMenuItemAction,
} from "@/app/actions";
import {
  Plus,
  Edit2,
  Trash2,
  Copy,
  ChevronRight,
  TrendingUp,
  Search,
  Check,
  X,
  FileCheck,
  Grid,
  DollarSign,
  Clock,
  Layers,
} from "lucide-react";

export default function MenuManagement() {
  const [menuItems, setMenuItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  // Form State
  const [isEditing, setIsEditing] = useState(false);
  const [itemId, setItemId] = useState(null);
  const [name, setName] = useState("");
  const [gujaratiName, setGujaratiName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState(0);
  const [costPrice, setCostPrice] = useState(0);
  const [price200ml, setPrice200ml] = useState(0);
  const [costPrice200ml, setCostPrice200ml] = useState(0);
  const [price250ml, setPrice250ml] = useState(0);
  const [costPrice250ml, setCostPrice250ml] = useState(0);
  const [category, setCategory] = useState("Cold Coco");
  const [preparationTime, setPreparationTime] = useState(2);
  const [availability, setAvailability] = useState(true);
  const [displayOrder, setDisplayOrder] = useState(0);
  const [tagsInput, setTagsInput] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  // Bulk Price Update State
  const [showBulkPriceModal, setShowBulkPriceModal] = useState(false);
  const [bulkUpdateAmount, setBulkUpdateAmount] = useState(0);
  const [bulkUpdateType, setBulkUpdateType] = useState("Flat"); // Flat or Percent

  // const categories = ["All", "Cold Coco", "Premium", "Seasonal", "Special"];

  // Fetch Menu Items
  const loadMenu = async () => {
    const items = await fetchMenuItemsAction();
    if (items) setMenuItems(items);
  };

  useEffect(() => {
    loadMenu();
  }, []);

  // Form Reset
  const resetForm = () => {
    setIsEditing(false);
    setItemId(null);
    setName("");
    setGujaratiName("");
    setDescription("");
    setPrice(0);
    setCostPrice(0);
    setPrice200ml(0);
    setCostPrice200ml(0);
    setPrice250ml(0);
    setCostPrice250ml(0);
    setCategory("Cold Coco");
    setPreparationTime(2);
    setAvailability(true);
    setDisplayOrder(0);
    setTagsInput("");
    setImageUrl("");
  };

  // Populate form for editing
  const handleEdit = (item) => {
    setIsEditing(true);
    setItemId(item.id || item._id);
    setName(item.name);
    setGujaratiName(item.gujaratiName || "");
    setDescription(item.description || "");
    setPrice(item.price250ml || item.price || 0);
    setCostPrice(item.costPrice250ml || item.costPrice || 0);
    setPrice200ml(item.price200ml || item.price || 0);
    setCostPrice200ml(item.costPrice200ml || item.costPrice || 0);
    setPrice250ml(item.price250ml || item.price || 0);
    setCostPrice250ml(item.costPrice250ml || item.costPrice || 0);
    setCategory(item.category);
    setPreparationTime(item.preparationTime || 2);
    setAvailability(item.availability);
    setDisplayOrder(item.displayOrder || 0);
    setTagsInput(item.tags ? item.tags.join(", ") : "");
    setImageUrl(item.imageUrl || "");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Submit Menu Item Form
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return alert("Item Name is required!");

    const tags = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const p200 = Number(price200ml) || Number(price);
    const cp200 = Number(costPrice200ml) || Number(costPrice);
    const p250 = Number(price250ml) || Number(price);
    const cp250 = Number(costPrice250ml) || Number(costPrice);

    const itemData = {
      id: itemId,
      name,
      gujaratiName,
      description,
      price: p250 || p200 || Number(price),
      costPrice: cp250 || cp200 || Number(costPrice),
      price200ml: p200,
      costPrice200ml: cp200,
      price250ml: p250,
      costPrice250ml: cp250,
      category,
      preparationTime: Number(preparationTime),
      availability,
      displayOrder: Number(displayOrder),
      tags,
      imageUrl,
    };

    const result = await saveMenuItemAction(itemData);
    if (result && !result.error) {
      loadMenu();
      resetForm();
    } else {
      alert("Error saving item: " + (result?.error || "Unknown error"));
    }
  };

  // Handle Duplicate Item
  const handleDuplicate = (item) => {
    setIsEditing(true);
    setItemId(null); // Clear ID to make it a new item
    setName(`${item.name} (Copy)`);
    setGujaratiName(item.gujaratiName ? `${item.gujaratiName} (નકલ)` : "");
    setDescription(item.description || "");
    setPrice(item.price250ml || item.price || 0);
    setCostPrice(item.costPrice250ml || item.costPrice || 0);
    setPrice200ml(item.price200ml || item.price || 0);
    setCostPrice200ml(item.costPrice200ml || item.costPrice || 0);
    setPrice250ml(item.price250ml || item.price || 0);
    setCostPrice250ml(item.costPrice250ml || item.costPrice || 0);
    setCategory(item.category);
    setPreparationTime(item.preparationTime || 2);
    setAvailability(item.availability);
    setDisplayOrder((item.displayOrder || 0) + 1);
    setTagsInput(item.tags ? item.tags.join(", ") : "");
    setImageUrl(item.imageUrl || "");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Delete Menu Item
  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to archive/delete this menu item?")) return;
    const result = await deleteMenuItemAction(id);
    if (result && !result.error) {
      loadMenu();
    } else {
      alert("Error deleting item: " + (result?.error || "Unknown error"));
    }
  };

  // Perform Bulk Price Update
  const handleBulkPriceUpdate = async () => {
    if (!confirm(`Are you sure you want to adjust all menu item prices by ${bulkUpdateType === "Percent" ? bulkUpdateAmount + "%" : "₹" + bulkUpdateAmount}?`)) return;
    
    let updateCount = 0;
    for (let item of menuItems) {
      let newPrice = item.price;
      let newPrice200 = item.price200ml || item.price;
      let newPrice250 = item.price250ml || item.price;

      if (bulkUpdateType === "Flat") {
        newPrice += Number(bulkUpdateAmount);
        newPrice200 += Number(bulkUpdateAmount);
        newPrice250 += Number(bulkUpdateAmount);
      } else {
        const factor = 1 + Number(bulkUpdateAmount) / 100;
        newPrice = Math.round(newPrice * factor);
        newPrice200 = Math.round(newPrice200 * factor);
        newPrice250 = Math.round(newPrice250 * factor);
      }
      // Guarantee positive price
      newPrice = Math.max(0, newPrice);
      newPrice200 = Math.max(0, newPrice200);
      newPrice250 = Math.max(0, newPrice250);

      await saveMenuItemAction({
        id: item.id || item._id,
        price: newPrice,
        price200ml: newPrice200,
        price250ml: newPrice250,
      });
      updateCount++;
    }

    setShowBulkPriceModal(false);
    setBulkUpdateAmount(0);
    loadMenu();
    alert(`Successfully updated prices for ${updateCount} menu items!`);
  };

  // Filter list
  const filteredItems = menuItems.filter((item) => {
    const matchesCategory = activeCategory === "All" || item.category === activeCategory;
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.gujaratiName && item.gujaratiName.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <AdminGuard>
      <div className="flex flex-col min-h-screen bg-cream-light font-sans text-coco-dark">
        

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT COLUMN: Add / Edit Item Form (Col span 1) */}
        <section className="bg-white border border-cream-deep/40 rounded-3xl p-5 shadow-md h-fit">
          <h2 className="font-extrabold text-lg mb-4 text-coco-medium flex items-center gap-1.5 border-b border-cream-base pb-3">
            <Plus className="w-5 h-5 text-coco-accent" />
            {isEditing ? "Edit Menu Item" : "Add New Coco Drink"}
          </h2>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-sm">
            <div>
              <label className="text-xs font-bold text-coco-light block mb-1">
                Item Name (English) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Premium Badam Coco"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-cream-deep focus:outline-none focus:ring-2 focus:ring-coco-accent"
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold text-coco-light block mb-1">
                Gujarati Name (ગુજરાતી નામ)
              </label>
              <input
                type="text"
                placeholder="દા.ત. પ્રિમિયમ બદામ કોકો"
                value={gujaratiName}
                onChange={(e) => setGujaratiName(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-cream-deep focus:outline-none focus:ring-2 focus:ring-coco-accent font-semibold"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-coco-light block mb-1">Description</label>
              <textarea
                placeholder="Drink description..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                className="w-full px-3.5 py-2 rounded-xl border border-cream-deep focus:outline-none focus:ring-2 focus:ring-coco-accent text-xs"
              />
            </div>

            {/* Glass Size Pricing (200 ml and 250 ml) */}
            <div className="bg-cream-base/40 p-3.5 rounded-2xl border border-cream-deep/50 flex flex-col gap-3">
              <span className="text-xs font-black text-coco-dark uppercase tracking-wider flex items-center gap-1.5">
                🥛 Glass Size Pricing
              </span>

              {/* 200 ml Row */}
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[11px] font-extrabold text-amber-900 block mb-1">
                    200 ml Price (₹) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={price200ml || ""}
                    onChange={(e) => {
                      setPrice200ml(e.target.value);
                      if (!price) setPrice(e.target.value);
                    }}
                    placeholder="e.g. 40"
                    className="w-full px-3 py-1.5 rounded-xl border border-amber-200 focus:outline-none focus:ring-2 focus:ring-amber-500 text-xs font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="text-[11px] font-extrabold text-coco-light block mb-1">
                    200 ml Cost (₹)
                  </label>
                  <input
                    type="number"
                    value={costPrice200ml || ""}
                    onChange={(e) => setCostPrice200ml(e.target.value)}
                    placeholder="e.g. 18"
                    className="w-full px-3 py-1.5 rounded-xl border border-cream-deep focus:outline-none focus:ring-2 focus:ring-coco-accent text-xs"
                  />
                </div>
              </div>

              {/* 250 ml Row */}
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[11px] font-extrabold text-coco-dark block mb-1">
                    250 ml Price (₹) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={price250ml || ""}
                    onChange={(e) => {
                      setPrice250ml(e.target.value);
                      setPrice(e.target.value);
                    }}
                    placeholder="e.g. 50"
                    className="w-full px-3 py-1.5 rounded-xl border border-cream-deep focus:outline-none focus:ring-2 focus:ring-coco-accent text-xs font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="text-[11px] font-extrabold text-coco-light block mb-1">
                    250 ml Cost (₹)
                  </label>
                  <input
                    type="number"
                    value={costPrice250ml || ""}
                    onChange={(e) => {
                      setCostPrice250ml(e.target.value);
                      setCostPrice(e.target.value);
                    }}
                    placeholder="e.g. 22"
                    className="w-full px-3 py-1.5 rounded-xl border border-cream-deep focus:outline-none focus:ring-2 focus:ring-coco-accent text-xs"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-coco-light block mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-cream-deep focus:outline-none focus:ring-2 focus:ring-coco-accent bg-white"
                >
                  <option value="Cold Coco">Cold Coco</option>
                  <option value="Premium">Premium</option>
                  <option value="Seasonal">Seasonal</option>
                  <option value="Special">Special</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-coco-light block mb-1">Prep Time (min)</label>
                <input
                  type="number"
                  value={preparationTime}
                  onChange={(e) => setPreparationTime(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-cream-deep focus:outline-none focus:ring-2 focus:ring-coco-accent"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-coco-light block mb-1">Display Order</label>
                <input
                  type="number"
                  value={displayOrder}
                  onChange={(e) => setDisplayOrder(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-cream-deep focus:outline-none focus:ring-2 focus:ring-coco-accent"
                />
              </div>

              <div className="flex items-center gap-2 mt-5">
                <input
                  type="checkbox"
                  id="avail"
                  checked={availability}
                  onChange={(e) => setAvailability(e.target.checked)}
                  className="w-4 h-4 text-coco-accent border-cream-deep focus:ring-coco-accent rounded"
                />
                <label htmlFor="avail" className="text-xs font-bold text-coco-light cursor-pointer">
                  In Stock / Available
                </label>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-coco-light block mb-1">
                Image URL (Direct Link)
              </label>
              <input
                type="url"
                placeholder="https://images.unsplash.com/photo-..."
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-cream-deep focus:outline-none focus:ring-2 focus:ring-coco-accent text-xs"
              />
              {imageUrl && (
                <div className="mt-2 flex items-center gap-2 bg-cream-base/30 p-2 rounded-xl border border-cream-deep/30">
                  <img
                    src={imageUrl}
                    alt="Preview"
                    className="w-10 h-10 object-cover rounded-lg border border-cream-deep shadow-sm"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                  <span className="text-[10px] text-coco-light font-bold">Image Preview</span>
                </div>
              )}
            </div>

            <div>
              <label className="text-xs font-bold text-coco-light block mb-1">
                Tags (comma separated)
              </label>
              <input
                type="text"
                placeholder="e.g. Popular, New, Special"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-cream-deep focus:outline-none focus:ring-2 focus:ring-coco-accent"
              />
            </div>

            <div className="flex gap-2.5 mt-2">
              <button
                type="submit"
                className="flex-1 bg-coco-accent hover:bg-coco-light text-white py-2.5 rounded-xl font-bold transition-all shadow-sm flex items-center justify-center gap-1.5"
              >
                <FileCheck className="w-4 h-4" />
                <span>{isEditing ? "Update Item" : "Save Item"}</span>
              </button>
              {isEditing && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="bg-cream-base hover:bg-cream-deep/60 text-coco-light px-3.5 py-2.5 rounded-xl border border-cream-deep/40 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </form>
        </section>

        {/* RIGHT COLUMN: Active Menu Items Listing (Col span 2) */}
        <section className="lg:col-span-2 flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-coco-light" />
              <input
                type="text"
                placeholder="Search menu list..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-cream-deep bg-white focus:outline-none focus:ring-2 focus:ring-coco-accent text-sm"
              />
            </div>

            <div className="flex gap-2 w-full sm:w-auto">
              <button
                onClick={() => setShowBulkPriceModal(true)}
                className="flex-1 sm:flex-none bg-coco-medium hover:bg-coco-light text-cream-light font-bold text-xs px-4 py-3 rounded-2xl transition-colors border border-coco-accent/30 shadow-sm whitespace-nowrap"
              >
                Bulk Price Update
              </button>
            </div>
          </div>

          {/* Category Tabs */}
          {/* <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all shadow-sm ${
                  activeCategory === cat
                    ? "bg-coco-accent text-cream-light"
                    : "bg-white text-coco-light border border-cream-deep/50 hover:bg-cream-base/50"
                }`}
              >
                {cat}
              </button>
            ))}
          </div> */}

          {/* Items Table */}
          <div className="bg-white border border-cream-deep/40 rounded-3xl overflow-hidden shadow-md">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-cream-base/40 border-b border-cream-deep/30 font-bold text-coco-light uppercase tracking-wider">
                    <th className="py-4 px-4">Order / Drink</th>
                    <th className="py-4 px-3">Price</th>
                    <th className="py-4 px-3">Profit</th>
                    <th className="py-4 px-3">Availability</th>
                    <th className="py-4 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cream-base/50">
                  {filteredItems.length > 0 ? (
                    filteredItems.map((item) => {
                      const profit = item.price - (item.costPrice || 0);
                      return (
                        <tr key={item.id || item._id} className="hover:bg-cream-light/40 transition-colors">
                          <td className="py-3.5 px-4 font-bold text-coco-dark">
                            <div className="flex items-center gap-3">
                              <span className="text-[10px] bg-cream-base px-2 py-0.5 rounded text-coco-accent font-black">
                                {item.displayOrder || 0}
                              </span>
                              {item.imageUrl ? (
                                <img
                                  src={item.imageUrl}
                                  alt={item.name}
                                  className="w-10 h-10 object-cover rounded-xl border border-cream-deep/60 shadow-sm shrink-0"
                                />
                              ) : (
                                <div className="w-10 h-10 bg-coco-dark/10 rounded-xl flex items-center justify-center text-coco-dark font-black text-xs shrink-0 border border-cream-deep/40">
                                  🍹
                                </div>
                              )}
                              <div>
                                <span className="font-extrabold text-sm">{item.name}</span>
                                {item.gujaratiName && (
                                  <span className="block text-[10px] text-coco-accent font-bold mt-0.5">
                                    {item.gujaratiName}
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-3">
                            {item.price200ml && item.price250ml ? (
                              <div className="flex flex-col gap-0.5 whitespace-nowrap">
                                <span className="text-[11px] font-bold text-amber-900">200ml: ₹{item.price200ml}</span>
                                <span className="text-xs font-black text-coco-dark">250ml: ₹{item.price250ml}</span>
                              </div>
                            ) : (
                              <span className="font-extrabold text-sm text-coco-dark">₹{item.price}</span>
                            )}
                          </td>
                          <td className="py-3.5 px-3">
                            {item.price200ml && item.price250ml ? (
                              <div className="flex flex-col gap-0.5 whitespace-nowrap">
                                <span className="text-[11px] font-bold text-green-700">200ml: +₹{item.price200ml - (item.costPrice200ml || 0)}</span>
                                <span className="text-xs font-bold text-green-700">250ml: +₹{item.price250ml - (item.costPrice250ml || 0)}</span>
                              </div>
                            ) : (
                              <>
                                <span className="font-bold text-green-700">₹{profit}</span>
                                <span className="block text-[9px] text-coco-light">Cost: ₹{item.costPrice || 0}</span>
                              </>
                            )}
                          </td>
                          <td className="py-3.5 px-3">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase ${
                                item.availability
                                  ? "bg-green-100 text-green-700"
                                  : "bg-red-100 text-red-600"
                              }`}
                            >
                              {item.availability ? "In Stock" : "Out"}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleEdit(item)}
                                className="bg-cream-base hover:bg-cream-deep/60 p-2 rounded-lg text-coco-medium hover:text-coco-accent transition-colors"
                                title="Edit"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDuplicate(item)}
                                className="bg-cream-base hover:bg-cream-deep/60 p-2 rounded-lg text-coco-medium hover:text-coco-accent transition-colors"
                                title="Duplicate"
                              >
                                <Copy className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDelete(item.id || item._id)}
                                className="bg-red-50 hover:bg-red-100 p-2 rounded-lg text-red-600 transition-colors"
                                title="Archive"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="5" className="py-12 text-center text-coco-light font-bold">
                        No menu items found. Add one on the left!
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </main>

      {/* BULK PRICE UPDATE MODAL */}
      {showBulkPriceModal && (
        <div className="fixed inset-0 bg-coco-dark/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-cream-light border border-cream-deep/60 rounded-3xl p-6 max-w-sm w-full shadow-2xl flex flex-col gap-4">
            <div>
              <h3 className="font-extrabold text-lg text-coco-dark">Bulk Price Update</h3>
              <p className="text-xs text-coco-light">
                Modify prices of all menu items simultaneously
              </p>
            </div>

            <div className="flex flex-col gap-3 text-sm">
              <div>
                <label className="text-xs font-bold text-coco-light block mb-1">Update Type</label>
                <div className="grid grid-cols-2 gap-2 bg-cream-base/50 p-1 rounded-xl">
                  <button
                    onClick={() => setBulkUpdateType("Flat")}
                    className={`py-2 rounded-lg text-xs font-bold transition-all ${
                      bulkUpdateType === "Flat"
                        ? "bg-white text-coco-dark shadow-sm"
                        : "text-coco-light"
                    }`}
                  >
                    Flat Rate (₹)
                  </button>
                  <button
                    onClick={() => setBulkUpdateType("Percent")}
                    className={`py-2 rounded-lg text-xs font-bold transition-all ${
                      bulkUpdateType === "Percent"
                        ? "bg-white text-coco-dark shadow-sm"
                        : "text-coco-light"
                    }`}
                  >
                    Percentage (%)
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-coco-light block mb-1">
                  Adjustment Amount (Use negative for discount)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-coco-light text-xs">
                    {bulkUpdateType === "Percent" ? "%" : "₹"}
                  </span>
                  <input
                    type="number"
                    placeholder="e.g. 5 or -10"
                    value={bulkUpdateAmount || ""}
                    onChange={(e) => setBulkUpdateAmount(e.target.value)}
                    className="w-full pl-7 pr-3 py-2.5 rounded-xl border border-cream-deep focus:outline-none focus:ring-2 focus:ring-coco-accent"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-2.5 mt-2">
              <button
                onClick={handleBulkPriceUpdate}
                className="flex-1 bg-coco-accent hover:bg-coco-light text-cream-light py-2.5 rounded-xl font-bold text-xs shadow-md transition-colors"
              >
                Apply Changes
              </button>
              <button
                onClick={() => {
                  setShowBulkPriceModal(false);
                  setBulkUpdateAmount(0);
                }}
                className="flex-1 bg-cream-base hover:bg-cream-deep/60 text-coco-light py-2.5 rounded-xl font-bold text-xs border border-cream-deep/30 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </AdminGuard>
  );
}
