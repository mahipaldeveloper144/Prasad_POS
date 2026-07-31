import "./globals.css";
import Sidebar from "@/components/Sidebar";
export const metadata = {
  title: "Prasad Cold Coco - Smart Food Cart POS",
  description: "High performance smart ordering and billing system for Prasad Cold Coco",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <body className="min-h-full flex flex-col md:flex-row bg-[#fdfaf7]" suppressHydrationWarning>
        <Sidebar />
        <main className="flex-1 pb-24 md:pb-0" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 6rem)' }}>{children}</main>
      </body>
    </html>
  );
}
