"use client";

import { useEffect, useState } from "react";

import AdminGuard from "@/components/AdminGuard";
import { fetchSettingsAction, saveSettingsAction, resetToDefaultAction } from "@/app/actions";
import { useCartStore } from "@/store/useCartStore";
import {
  Settings,
  Building,
  QrCode,
  FileText,
  Volume2,
  Database,
  Check,
  RefreshCcw,
  Sliders,
} from "lucide-react";

export default function SettingsPanel() {
  const { settings, setSettings } = useCartStore();
  const [loading, setLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Form states
  const [businessName, setBusinessName] = useState("");
  const [tagline, setTagline] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [gstNumber, setGstNumber] = useState("");
  
  const [upiId, setUpiId] = useState("");
  
  const [receiptHeader, setReceiptHeader] = useState("");
  const [receiptFooter, setReceiptFooter] = useState("");
  const [googleReviewUrl, setGoogleReviewUrl] = useState("");
  
  const [enableSound, setEnableSound] = useState(true);
  const [printerWidth, setPrinterWidth] = useState("58mm");
  const [adminPassword, setAdminPassword] = useState("Secure@098");

  useEffect(() => {
    async function loadSettings() {
      const dbSettings = await fetchSettingsAction();
      if (dbSettings) {
        setSettings(dbSettings);
        setBusinessName(dbSettings.businessName || "");
        setTagline(dbSettings.tagline || "");
        setAddress(dbSettings.address || "");
        setPhone(dbSettings.phone || "");
        setGstNumber(dbSettings.gstNumber || "");
        setUpiId(dbSettings.upiId || "");
        setReceiptHeader(dbSettings.receiptHeader || "");
        setReceiptFooter(dbSettings.receiptFooter || "");
        setGoogleReviewUrl(dbSettings.googleReviewUrl || "");
        setEnableSound(dbSettings.enableSound !== false);
        setPrinterWidth(dbSettings.printerWidth || "58mm");
        setAdminPassword(dbSettings.adminPassword || "Secure@098");
      }
    }
    loadSettings();
  }, [setSettings]);

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSaveSuccess(false);

    const updated = {
      businessName,
      tagline,
      address,
      phone,
      gstNumber,
      upiId,
      receiptHeader,
      receiptFooter,
      googleReviewUrl,
      enableSound,
      printerWidth,
      adminPassword,
    };

    const saved = await saveSettingsAction(updated);
    setLoading(false);
    if (saved && !saved.error) {
      setSettings(saved);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } else {
      alert("Error saving settings: " + (saved?.error || "Unknown error"));
    }
  };

  const handleResetData = async () => {
    if (
      !confirm(
        "WARNING: This will wipe out all custom orders, custom customers, and menu edits, resetting the app to default seed values. Proceed?"
      )
    ) {
      return;
    }
    
    setLoading(true);
    const res = await resetToDefaultAction();
    setLoading(false);
    if (res && res.success) {
      alert("Database reset successfully! Reloading page...");
      window.location.reload();
    } else {
      alert("Error resetting database: " + res.error);
    }
  };

  return (
    <AdminGuard>
      <div className="flex flex-col min-h-screen bg-cream-light font-sans text-coco-dark">
        

      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-black text-coco-dark flex items-center gap-2">
            <Settings className="w-6 h-6 text-coco-accent" />
            System Settings
          </h1>
          <p className="text-xs text-coco-light">
            Configure default UPI address, store layouts, receipt print widths, and database backups
          </p>
        </div>

        <form onSubmit={handleSave} className="space-y-6 text-sm">
          {/* SECTION 1: BUSINESS SETTINGS */}
          <div className="bg-white border border-cream-deep/40 rounded-3xl p-5 shadow-sm space-y-4">
            <h2 className="font-extrabold text-sm text-coco-medium flex items-center gap-2 border-b border-cream-base pb-3">
              <Building className="w-4 h-4 text-coco-accent" />
              Business Info
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-coco-light block mb-1">Business Name</label>
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-cream-deep focus:outline-none focus:ring-1 focus:ring-coco-accent bg-cream-light/30"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-coco-light block mb-1">Tagline</label>
                <input
                  type="text"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-cream-deep focus:outline-none focus:ring-1 focus:ring-coco-accent bg-cream-light/30"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-coco-light block mb-1">Phone Number</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-cream-deep focus:outline-none focus:ring-1 focus:ring-coco-accent bg-cream-light/30"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-coco-light block mb-1">GST Number (Optional)</label>
                <input
                  type="text"
                  value={gstNumber}
                  onChange={(e) => setGstNumber(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-cream-deep focus:outline-none focus:ring-1 focus:ring-coco-accent bg-cream-light/30"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-bold text-coco-light block mb-1">Store Address</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-cream-deep focus:outline-none focus:ring-1 focus:ring-coco-accent bg-cream-light/30"
                />
              </div>
            </div>
          </div>

          {/* SECTION 2: UPI PAYMENT GATEWAY */}
          <div className="bg-white border border-cream-deep/40 rounded-3xl p-5 shadow-sm space-y-4">
            <h2 className="font-extrabold text-sm text-coco-medium flex items-center gap-2 border-b border-cream-base pb-3">
              <QrCode className="w-4 h-4 text-coco-accent" />
              UPI Settings
            </h2>

            <div>
              <label className="text-xs font-bold text-coco-light block mb-1">Merchant UPI ID</label>
              <input
                type="text"
                placeholder="e.g. yourname@okaxis"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                className="w-full max-w-md px-3 py-2 rounded-xl border border-cream-deep focus:outline-none focus:ring-1 focus:ring-coco-accent bg-cream-light/30 font-bold"
                required
              />
              <p className="text-[10px] text-coco-light mt-1">
                This UPI ID is used to dynamically construct UPI QR codes with exact order values on POS checkout.
              </p>
            </div>
          </div>

          {/* SECTION 3: RECEIPT PRINT LAYOUT */}
          <div className="bg-white border border-cream-deep/40 rounded-3xl p-5 shadow-sm space-y-4">
            <h2 className="font-extrabold text-sm text-coco-medium flex items-center gap-2 border-b border-cream-base pb-3">
              <FileText className="w-4 h-4 text-coco-accent" />
              Receipt customization
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-coco-light block mb-1">Receipt Header Text</label>
                <input
                  type="text"
                  value={receiptHeader}
                  onChange={(e) => setReceiptHeader(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-cream-deep focus:outline-none focus:ring-1 focus:ring-coco-accent bg-cream-light/30"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-coco-light block mb-1">Receipt Footer Text</label>
                <input
                  type="text"
                  value={receiptFooter}
                  onChange={(e) => setReceiptFooter(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-cream-deep focus:outline-none focus:ring-1 focus:ring-coco-accent bg-cream-light/30"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-bold text-coco-light block mb-1">Google Review Link</label>
                <input
                  type="url"
                  placeholder="https://g.page/r/..."
                  value={googleReviewUrl}
                  onChange={(e) => setGoogleReviewUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-cream-deep focus:outline-none focus:ring-1 focus:ring-coco-accent bg-cream-light/30"
                />
              </div>
            </div>
          </div>

          {/* SECTION 4: HARDWARE AND SOUND */}
          <div className="bg-white border border-cream-deep/40 rounded-3xl p-5 shadow-sm space-y-4">
            <h2 className="font-extrabold text-sm text-coco-medium flex items-center gap-2 border-b border-cream-base pb-3">
              <Sliders className="w-4 h-4 text-coco-accent" />
              Hardware & Device Settings
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-coco-light block mb-1">Printer Receipt Width</label>
                <select
                  value={printerWidth}
                  onChange={(e) => setPrinterWidth(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-cream-deep focus:outline-none focus:ring-1 focus:ring-coco-accent bg-white"
                >
                  <option value="58mm">58mm Thermal Receipt Printer (Default)</option>
                  <option value="80mm">80mm Thermal Receipt Printer</option>
                </select>
              </div>

              <div className="flex items-center gap-2.5 sm:mt-6">
                <input
                  type="checkbox"
                  id="sound-opt"
                  checked={enableSound}
                  onChange={(e) => setEnableSound(e.target.checked)}
                  className="w-4 h-4 text-coco-accent border-cream-deep focus:ring-coco-accent rounded"
                />
                <label htmlFor="sound-opt" className="text-xs font-bold text-coco-light cursor-pointer flex items-center gap-1">
                  <Volume2 className="w-4 h-4 text-coco-accent" />
                  Enable Kitchen Sound Alerts
                </label>
              </div>
            </div>
          </div>

          {/* SECTION 5: ADMIN SECURITY & AUTHENTICATION */}
          <div className="bg-white border border-cream-deep/40 rounded-3xl p-5 shadow-sm space-y-4">
            <h2 className="font-extrabold text-sm text-coco-medium flex items-center gap-2 border-b border-cream-base pb-3">
              <Sliders className="w-4 h-4 text-coco-accent" />
              Admin Security Password (Database Verified)
            </h2>

            <div>
              <label className="text-xs font-bold text-coco-light block mb-1">Admin Security Password</label>
              <input
                type="text"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                className="w-full max-w-md px-3.5 py-2.5 rounded-xl border border-cream-deep focus:outline-none focus:ring-1 focus:ring-coco-accent font-mono font-bold text-sm bg-white"
                placeholder="Enter new Admin Password"
              />
              <p className="text-[11px] text-coco-light/70 mt-1">This password is authenticated on the server against your database when logging in.</p>
            </div>
          </div>

          {/* SAVE BUTTON BANNER */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              {saveSuccess && (
                <div className="text-green-600 font-bold text-xs flex items-center gap-1 animate-pulse">
                  <Check className="w-4 h-4" />
                  Settings saved successfully!
                </div>
              )}
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="bg-coco-accent hover:bg-coco-light text-white px-8 py-3 rounded-2xl font-black shadow-md transition-all active:scale-[0.99] text-xs"
            >
              {loading ? "Saving..." : "Save Settings"}
            </button>
          </div>
        </form>

        {/* SECTION 5: SYSTEM MAINTENANCE */}
        <section className="bg-red-50/50 border border-red-200/50 rounded-3xl p-5 shadow-sm space-y-4">
          <h2 className="font-extrabold text-sm text-red-800 flex items-center gap-2 border-b border-red-200/40 pb-3">
            <Database className="w-4 h-4 text-red-600" />
            System Maintenance
          </h2>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div>
              <h3 className="font-extrabold text-red-950">Reset local store databases</h3>
              <p className="text-red-700/80">Wipe menu changes, active cart queue, and mock database store files</p>
            </div>
            <button
              onClick={handleResetData}
              disabled={loading}
              className="bg-red-600 hover:bg-red-700 text-white font-extrabold px-5 py-2.5 rounded-xl shadow-sm transition-colors border border-red-700 flex items-center gap-1.5 self-start sm:self-center"
            >
              <RefreshCcw className="w-3.5 h-3.5" />
              <span>Reset & Seed Data</span>
            </button>
          </div>
        </section>
      </main>
      </div>
    </AdminGuard>
  );
}
