# Feature Prompt: Item-Level Order Mode – At Cart / Parcel

Implement an **Item-Level Order Mode** feature in the Prasad Cold Coco Smart Food Cart Ordering System.

## Objective

Order mode must be managed **individually for every item inside an order**, not at the overall order level.

A single customer order can contain multiple items where each item has a different order mode.

Supported order modes:

* `AT_CART`
* `PARCEL`

Do NOT apply one common order mode to the entire order.

---

## Example Scenario 1

Customer says:

> 1 Coco At Cart
> 1 Coco Parcel

The order should be stored as:

```text
Order #105

1 × Plain Coco
   Mode: AT_CART

1 × Plain Coco
   Mode: PARCEL
```

---

## Example Scenario 2

Customer says:

> 1 Plain Coco At Cart
> 1 Oreo Coco Parcel

The order should be:

```text
Order #106

1 × Plain Coco
   Mode: AT_CART

1 × Oreo Coco
   Mode: PARCEL
```

---

# Cashier Order Creation

When the cashier adds an item to the cart, every order item must have its own `orderMode`.

Example:

```text
Plain Coco
Qty: 1

Order Mode:
[ At Cart ] [ Parcel ]
```

The cashier must select the order mode for each item.

Default mode can be:

```text
AT_CART
```

but the cashier must be able to change it before confirming the order.

---

# Multiple Quantities

Order mode must also work correctly with quantity.

For example:

```text
Plain Coco × 3
```

The cashier should be able to handle:

```text
2 × At Cart
1 × Parcel
```

Do NOT assume that the complete quantity always has the same order mode.

The order item structure should support splitting quantities by mode when necessary.

Example:

```text
Plain Coco
├── Qty: 2 → AT_CART
└── Qty: 1 → PARCEL
```

If the UI becomes complicated, internally split them into separate order items:

```text
Plain Coco × 2 → AT_CART
Plain Coco × 1 → PARCEL
```

This is preferred because it makes kitchen display, reporting, and order history much easier.

---

# Recommended Data Structure

Each order item should contain:

```javascript
{
  productId: "...",
  productName: "Plain Coco",
  quantity: 1,
  price: 70,
  orderMode: "AT_CART"
}
```

Allowed values:

```javascript
orderMode: "AT_CART" | "PARCEL"
```

Never store `orderMode` only at the order-level.

---

# Cashier UI

The cashier order cart should clearly show:

```text
Plain Coco
₹70

Qty: 1

[ AT CART ] [ PARCEL ]
```

Selected mode must have a strong visual indication.

For example:

```text
[ ✓ AT CART ] [ PARCEL ]
```

or

```text
AT CART ●
PARCEL ○
```

The UI must be extremely fast because this is a food cart environment.

The cashier should be able to change the mode with **one tap**.

---

# Order Summary

Before generating the bill, show the complete item-level order mode.

Example:

```text
ORDER #105

Rahul

Plain Coco
Qty: 1
Mode: At Cart
₹70

Oreo Coco
Qty: 1
Mode: Parcel
₹90

----------------
TOTAL: ₹160

Payment:
[ CASH ] [ UPI ]

[ GENERATE BILL ]
```

---

# Kitchen Display Requirement

The kitchen/cart display MUST show the order mode clearly for every item.

Do not show only one order mode at the top of the order.

For example:

```text
┌──────────────────────────────┐
│ ORDER #105                   │
│ Rahul                        │
├──────────────────────────────┤
│ 1 × Plain Coco               │
│    🟢 AT CART                │
│                              │
│ 1 × Oreo Coco                │
│    🟠 PARCEL                 │
└──────────────────────────────┘
```

The kitchen staff should immediately understand:

* Which item is for consumption at the cart
* Which item needs to be packed

---

# Kitchen Display Visual Design

Use clearly distinguishable badges.

Example:

```text
AT CART
```

and

```text
PARCEL
```

Recommended visual treatment:

* `AT CART` → green-style badge
* `PARCEL` → orange-style badge

Do not rely only on color.

Always display the actual text:

```text
AT CART
PARCEL
```

This ensures readability and accessibility.

---

# Kitchen Preparation Logic

The kitchen staff should see item-level instructions.

Example:

```text
ORDER #108

2 × Plain Coco
   AT CART

1 × Oreo Coco
   PARCEL

1 × KitKat Coco
   PARCEL
```

The kitchen should understand that:

* Plain Coco should be served at the cart.
* Oreo Coco must be prepared for takeaway.
* KitKat Coco must be prepared for takeaway.

---

# Order Status

Order status should remain at the **order level**:

```text
NEW
↓
PREPARING
↓
READY
↓
COMPLETED
```

Order mode is different from order status.

Do NOT create:

```text
At Cart Order
Parcel Order
```

as separate order statuses.

Instead:

```text
Order Status:
PREPARING

Item 1:
AT CART

Item 2:
PARCEL
```

---

# Bill Requirement

The bill should also show order mode for each item when useful.

Example:

```text
PRASAD COLD COCO

Order #105
Customer: Rahul

--------------------------------
Item              Qty    Mode
--------------------------------
Plain Coco         1     At Cart
Oreo Coco          1     Parcel
--------------------------------

Total: ₹160
Payment: UPI
```

The mode should not affect the item's price unless a separate pricing rule is introduced in the future.

---

# Reporting Requirement

Reports must be able to analyse item-level order modes.

For example:

### Today's Order Mode Report

```text
At Cart:
82 items

Parcel:
46 items
```

### Item-wise Mode Report

```text
Plain Coco

At Cart: 42
Parcel: 25

Oreo Coco

At Cart: 18
Parcel: 14
```

This will help understand how many customers consume at the cart versus take away.

---

# Important Edge Cases

The implementation must correctly handle:

### Case 1

```text
Plain Coco × 1 → At Cart
Plain Coco × 1 → Parcel
```

### Case 2

```text
Plain Coco × 2 → At Cart
Oreo Coco × 1 → Parcel
KitKat Coco × 1 → At Cart
```

### Case 3

```text
Plain Coco × 3

2 → At Cart
1 → Parcel
```

### Case 4

Customer changes their mind before payment:

```text
Parcel → At Cart
```

Cashier must be able to change the mode before confirming the order.

### Case 5

Order is already created but not completed.

Admin/cashier should be able to edit item-level order mode according to permissions.

All changes should be recorded in the audit log.

---

# Database Requirement

Use an enum/validation for order mode:

```javascript
orderMode: {
  type: String,
  enum: ["AT_CART", "PARCEL"],
  required: true,
  default: "AT_CART"
}
```

Do not allow arbitrary values.

---

# Important Architecture Rule

The system must treat:

```text
Order
```

and

```text
Order Item
```

as separate concepts.

### Order-level data

```text
Order Number
Customer Name
Payment Status
Payment Method
Order Status
Created At
Cashier
Total
```

### Item-level data

```text
Product
Quantity
Price
Order Mode
Item Notes
```

`orderMode` MUST belong to the **order item**, not the parent order.

---

# Final Acceptance Criteria

The feature is considered complete only when all of the following work:

* Cashier can select `At Cart` or `Parcel` independently for each item.
* One order can contain both At Cart and Parcel items.
* Same product can appear in the same order with different modes.
* Quantity can be split between At Cart and Parcel.
* Kitchen display shows mode beside every relevant item.
* Bill can show item-level order mode.
* Order mode can be edited before completion.
* Reports can filter/count At Cart vs Parcel.
* Order status remains independent from order mode.
* Database stores mode at the item level.
* Existing orders without an order mode should safely default to `AT_CART` during migration.
* UI should require minimal taps and be optimized for fast cashier operation.

## Example Final Result

```text
ORDER #125
Customer: Mahesh

┌──────────────────────────────┐
│ 1 × Plain Coco               │
│    AT CART                   │
├──────────────────────────────┤
│ 1 × Oreo Coco                │
│    PARCEL                    │
├──────────────────────────────┤
│ 1 × KitKat Coco              │
│    PARCEL                    │
└──────────────────────────────┘

TOTAL: ₹250

Payment: UPI
Status: PREPARING
```

The core rule is:

> **Order Mode belongs to each Order Item, not to the entire Order.**
