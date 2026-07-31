# Master Prompt – Smart Food Cart Ordering System (Prasad Cold Coco)

## Project Overview

Build a modern, fast, responsive Progressive Web App (PWA) for **Prasad Cold Coco** food cart.

This is **NOT** a restaurant POS.

It is a **Smart Food Cart Management System** specially designed for a single food cart.

### Primary Goals

- Faster ordering
- Live Kitchen Display
- Fast billing
- Daily analytics
- Inventory tracking
- Customer database
- Expandable architecture for future customer ordering

---

## Technology Stack

### Frontend

- Next.js 16 (App Router)
- JavaScript
- Tailwind CSS
- Shadcn UI
- Framer Motion
- React Hook Form
- TanStack Query

### Backend

- Next.js Server Actions
- MongoDB
- Mongoose

### Authentication

- Better Auth / NextAuth

### State Management

- Zustand

### Charts

- Recharts

### Printing

- Browser Print API
- Thermal Printer Support (58mm & 80mm)

### PWA

- Offline Support
- Installable App
- Push Notifications (Future)

---

## User Roles

### Admin

- Full system access
- Manage menu
- Manage settings
- View analytics
- View reports
- Edit/Delete orders
- Manage inventory
- Manage cashier accounts
- Manage UPI
- Export reports

### Cashier

- Create orders
- Generate bills
- Receive payments
- Update order status
- Print bills

Restrictions:

- Cannot edit settings
- Cannot delete reports
- Cannot access admin-only pages

### Customer

#### Phase 1

Coming Soon

#### Phase 2

- Scan QR
- Place order
- Live order tracking
- Digital payment
- Order history

---

## Application Modules

### 1. Dashboard

#### KPI Cards

- Today's Sales
- Today's Orders
- Cash Payment
- UPI Payment
- Average Order Value
- Pending Orders
- Completed Orders
- Cancelled Orders
- Popular Item
- Revenue
- Profit
- Expense (Future)
- Net Income

#### Charts

- Sales Trend
- Orders Trend
- Revenue Trend
- Hourly Sales
- Payment Method Split
- Top Selling Items
- Order Status
- Weekly Comparison
- Monthly Comparison
- Yearly Comparison

#### Analytics

- Most Ordered Item
- Peak Hour
- Average Bill Amount
- Repeat Customers
- Order Completion Time
- Best Selling Category

---

### 2. Order Management

Kanban Board Columns:

- New Orders
- Preparing
- Ready
- Completed
- Cancelled

Each Order Card:

- Order Number
- Customer Name
- Order Time
- Items
- Quantity
- Payment Status
- Payment Method
- Notes
- Timer
- Status Color

Features:

- Drag & Drop
- One-click status updates
- Real-time synchronization

---

### Kitchen Display

- Large TV Mode
- Auto Refresh
- Fullscreen
- Dark Theme
- Large Fonts
- Status Colors
- Sound Notification
- New Order Blink Animation
- Hide Payment Information

---

### Cashier Screen

- Search Item
- Category Filter
- Quick Quantity Selection
- Notes
- Customer Name (Required)
- Mobile Number (Optional)
- Take Away
- Standing Order
- Discount
- Coupon (Future)
- Order Summary
- Subtotal
- GST (Optional)
- Final Total

Payment Methods:

- Cash
- UPI

UPI Flow:

- Generate Dynamic QR
- Show Amount
- Customer Pays
- Mark Paid

Cash Flow:

- Mark Paid Instantly

After Payment:

- Print Bill
- Send Order to Kitchen

---

### Bill Design

Include:

- Business Logo
- Prasad Cold Coco
- Mix, Sip, Smile
- Address
- Phone Number
- GST (Optional)
- Bill Number
- Date & Time
- Customer Name
- Item Details
- Quantity
- Rate
- Amount
- Discount
- GST
- Grand Total
- Payment Method
- UPI Reference
- Google Review QR
- Thank You Message

---

### 3. Menu Management

Categories:

- Cold Coco
- Premium
- Seasonal
- Special
- Future

Item Fields:

- Name
- Gujarati Name
- Description
- Image
- Price
- Cost Price
- Category
- Preparation Time
- Availability
- Display Order
- Popular/New/Recommended Tags

Operations:

- Add
- Edit
- Delete
- Duplicate
- Archive
- Bulk Import/Export
- Bulk Price Update

---

### 4. Customer Management

- Name
- Phone
- Visits
- Orders
- Total Spend
- Favorite Item
- Last Visit
- Loyalty Points (Future)
- Notes
- Search
- Export
- History

---

### 5. Reports

Filters:

- Today
- Yesterday
- Week
- Month
- Custom

Reports:

- Sales
- Orders
- Payments
- Items
- Categories
- Cash
- UPI
- Cancelled Orders
- Refunds
- Profit

Export:

- PDF
- Excel
- CSV

---

### 6. Analytics

Charts:

- Sales
- Revenue
- Orders
- Peak Time
- Heat Map
- Hourly Orders
- Weekly Sales
- Monthly Sales
- Yearly Sales
- Best Seller
- Worst Seller
- Payment Split
- Order Trends

---

### 7. Settings

Sections:

- Business Settings
- UPI Settings
- Order Settings
- Kitchen Display Settings
- Receipt Settings
- Menu Settings
- User Management
- Backup & Restore

---

### 8. Inventory (Future)

Track:

- Milk
- Cocoa
- Sugar
- Custard
- Ice
- Cups
- Straws
- Lids

Features:

- Opening Stock
- Purchases
- Consumption
- Closing Stock
- Low Stock Alerts
- Expiry
- Supplier

---

### 9. Notifications

- New Order
- Payment Success
- Cancelled Order
- Low Stock
- Internet Offline
- New Version

---

### 10. Search

Global Search for:

- Orders
- Customers
- Items
- Reports
- Settings

---

## Phase 2

- Customer QR Ordering
- Customer Login
- Live Tracking
- Loyalty Points
- Scratch Cards
- Referral
- Offers
- Coupons
- Wallet
- WhatsApp Notifications
- SMS
- Online Payments
- Table Ordering
- Delivery

---

## Smart Features

- One-click repeat order
- Favorite items
- Recently ordered items
- Auto-suggest add-ons
- Real-time sales counter
- Peak-hour insights
- Out of Stock toggle
- Shift summary
- Cash drawer tracking
- Cashier-wise reports
- Admin PIN discounts
- Order notes
- Voice announcements
- Dark/Light mode
- Keyboard shortcuts
- Offline sync
- Google Review QR
- WhatsApp bill sharing
- Digital bill history
- Audit log

---

## UI/UX

- Mobile-first
- Dedicated TV display mode
- Chocolate Brown + Cream branding
- Smooth animations
- Large touch targets
- Order creation under 15 seconds
- Real-time sync
- Fully responsive

---

## Future Scalability

- Multiple Food Carts
- Multiple Branches
- Multiple Cashiers
- Franchise Support
- Central Dashboard
- Customer Mobile App
- Inventory Across Branches
- Online Ordering
- Delivery Integration
- AI Sales Forecasting
- Integration with Prasad Cold Coco website and loyalty program
