import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import {
  defaultMenuItems,
  defaultCustomers,
  defaultOrders,
  defaultSettings,
} from "./mockData";

const MOCK_FILE_PATH = path.join(process.cwd(), "db_mock_store.json");

// Define Mongoose Schemas if using MongoDB
const MenuSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    gujaratiName: { type: String, default: "" },
    description: { type: String, default: "" },
    price: { type: Number, required: true },
    costPrice: { type: Number, required: true },
    price200ml: { type: Number, default: 0 },
    costPrice200ml: { type: Number, default: 0 },
    price250ml: { type: Number, default: 0 },
    costPrice250ml: { type: Number, default: 0 },
    category: { type: String, required: true },
    preparationTime: { type: Number, default: 2 },
    availability: { type: Boolean, default: true },
    displayOrder: { type: Number, default: 0 },
    tags: [{ type: String }],
    imageUrl: { type: String, default: "" },
    archived: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const OrderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, required: true, unique: true },
    customerName: { type: String, required: true },
    customerPhone: { type: String, default: "" },
    items: [
      {
        name: { type: String, required: true },
        size: { type: String, default: "250 ml" },
        price: { type: Number, required: true },
        costPrice: { type: Number, default: 0 },
        quantity: { type: Number, required: true },
        subtotal: { type: Number, required: true },
        parcelQty: { type: Number, default: 0 },
        atCartQty: { type: Number, default: 0 },
        orderMode: { type: String, enum: ["AT_CART", "PARCEL"], default: "AT_CART" },
      },
    ],
    subtotal: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    total: { type: Number, required: true },
    paymentMethod: { type: String, enum: ["Cash", "UPI"], required: true },
    paymentStatus: { type: String, enum: ["Pending", "Paid"], required: true },
    cashReceived: { type: Number, default: 0 },
    changeAmount: { type: Number, default: 0 },
    upiReference: { type: String, default: "" },
    status: {
      type: String,
      enum: ["New", "Preparing", "Ready", "Completed", "Cancelled"],
      default: "New",
    },
    type: { type: String, default: "Parcel" },
    notes: { type: String, default: "" },
  },
  { timestamps: true }
);

const CustomerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true, unique: true },
    visits: { type: Number, default: 0 },
    orders: { type: Number, default: 0 },
    totalSpend: { type: Number, default: 0 },
    favoriteItem: { type: String, default: "" },
    lastVisit: { type: Date, default: Date.now },
    notes: { type: String, default: "" },
  },
  { timestamps: true }
);

const SettingsSchema = new mongoose.Schema(
  {
    businessName: { type: String, default: "Prasad Cold Coco" },
    tagline: { type: String, default: "Mix, Sip, Smile" },
    address: { type: String, default: "" },
    phone: { type: String, default: "" },
    gstNumber: { type: String, default: "" },
    upiId: { type: String, default: "" },
    receiptHeader: { type: String, default: "" },
    receiptFooter: { type: String, default: "" },
    googleReviewUrl: { type: String, default: "" },
    enableSound: { type: Boolean, default: true },
    printerWidth: { type: String, default: "58mm" },
    adminPassword: { type: String, default: "Secure@098" },
  },
  { timestamps: true }
);

let MenuItem, OrderItem, CustomerItem, SettingsItem;

try {
  MenuItem = mongoose.models.MenuItem || mongoose.model("MenuItem", MenuSchema);
  OrderItem = mongoose.models.OrderItem || mongoose.model("OrderItem", OrderSchema);
  CustomerItem = mongoose.models.CustomerItem || mongoose.model("CustomerItem", CustomerSchema);
  SettingsItem = mongoose.models.SettingsItem || mongoose.model("SettingsItem", SettingsSchema);
} catch (e) {
  // Ignored in non-MongoDB environment
}

let cachedConnection = null;

async function dbConnect() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    return null; // Mock mode
  }
  if (cachedConnection) {
    return cachedConnection;
  }
  try {
    const conn = await mongoose.connect(uri);
    cachedConnection = conn;
    return conn;
  } catch (error) {
    console.error("MongoDB connection error:", error);
    return null; // Fallback to mock mode on connection error
  }
}

// Read Mock Database file
function readMockDb() {
  if (!fs.existsSync(MOCK_FILE_PATH)) {
    const initialData = {
      menu: defaultMenuItems.map((item, idx) => ({ ...item, id: `m-${idx + 1}` })),
      orders: defaultOrders.map((item, idx) => ({ ...item, id: `o-${idx + 1}` })),
      customers: defaultCustomers.map((item, idx) => ({ ...item, id: `c-${idx + 1}` })),
      settings: defaultSettings,
    };
    fs.writeFileSync(MOCK_FILE_PATH, JSON.stringify(initialData, null, 2));
    return initialData;
  }
  try {
    return JSON.parse(fs.readFileSync(MOCK_FILE_PATH, "utf-8"));
  } catch (error) {
    console.error("Error reading mock database:", error);
    return { menu: [], orders: [], customers: [], settings: defaultSettings };
  }
}

// Write Mock Database file
function writeMockDb(data) {
  try {
    fs.writeFileSync(MOCK_FILE_PATH, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error("Error writing mock database:", error);
    return false;
  }
}

// --- Menu Functions ---
export async function getMenuItems() {
  const conn = await dbConnect();
  if (conn) {
    return await MenuItem.find({ archived: { $ne: true } }).sort({ displayOrder: 1 });
  } else {
    const db = readMockDb();
    return db.menu.filter((item) => !item.archived);
  }
}

export async function saveMenuItem(itemData) {
  const conn = await dbConnect();
  if (conn) {
    if (itemData.id && mongoose.isValidObjectId(itemData.id)) {
      return await MenuItem.findByIdAndUpdate(itemData.id, itemData, { new: true });
    } else {
      const newItem = new MenuItem(itemData);
      return await newItem.save();
    }
  } else {
    const db = readMockDb();
    if (itemData.id) {
      db.menu = db.menu.map((item) =>
        item.id === itemData.id ? { ...item, ...itemData } : item
      );
    } else {
      const newItem = {
        ...itemData,
        id: `m-${Date.now()}`,
        createdAt: new Date().toISOString(),
      };
      db.menu.push(newItem);
    }
    writeMockDb(db);
    return itemData;
  }
}

export async function deleteMenuItem(id) {
  const conn = await dbConnect();
  if (conn) {
    return await MenuItem.findByIdAndUpdate(id, { archived: true }, { new: true });
  } else {
    const db = readMockDb();
    db.menu = db.menu.map((item) =>
      item.id === id ? { ...item, archived: true } : item
    );
    writeMockDb(db);
    return true;
  }
}

// --- Order Functions ---
export async function getOrders() {
  const conn = await dbConnect();
  if (conn) {
    return await OrderItem.find().sort({ createdAt: -1 });
  } else {
    const db = readMockDb();
    // Sort by date descending
    return [...db.orders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }
}

export async function saveOrder(orderData) {
  const conn = await dbConnect();
  if (conn) {
    const newOrder = new OrderItem(orderData);
    return await newOrder.save();
  } else {
    const db = readMockDb();
    const newOrder = {
      ...orderData,
      id: `o-${Date.now()}`,
      createdAt: orderData.createdAt || new Date().toISOString(),
    };
    db.orders.push(newOrder);

    // Update Customer statistics automatically
    if (orderData.customerPhone) {
      let cust = db.customers.find((c) => c.phone === orderData.customerPhone);
      if (!cust) {
        cust = {
          id: `c-${Date.now()}`,
          name: orderData.customerName,
          phone: orderData.customerPhone,
          visits: 0,
          orders: 0,
          totalSpend: 0,
          favoriteItem: "",
          notes: "",
        };
        db.customers.push(cust);
      }
      cust.visits += 1;
      cust.orders += 1;
      cust.totalSpend += orderData.total;
      cust.lastVisit = new Date().toISOString();
      // Estimate favorite item based on items ordered
      if (orderData.items && orderData.items.length > 0) {
        cust.favoriteItem = orderData.items[0].name;
      }
    }

    writeMockDb(db);
    return newOrder;
  }
}

export async function updateOrderStatus(id, status) {
  const conn = await dbConnect();
  if (conn) {
    return await OrderItem.findByIdAndUpdate(id, { status }, { new: true });
  } else {
    const db = readMockDb();
    db.orders = db.orders.map((order) =>
      order.id === id || order.orderNumber === id ? { ...order, status } : order
    );
    writeMockDb(db);
    return true;
  }
}

export async function clearSalesData() {
  const conn = await dbConnect();
  if (conn) {
    await OrderItem.deleteMany({});
    await CustomerItem.updateMany({}, { $set: { visits: 0, orders: 0, totalSpend: 0, lastVisit: "" } });
    return true;
  } else {
    const db = readMockDb();
    db.orders = [];
    if (db.customers) {
      db.customers = db.customers.map((c) => ({
        ...c,
        visits: 0,
        orders: 0,
        totalSpend: 0,
        favoriteItem: "",
        lastVisit: "",
      }));
    }
    writeMockDb(db);
    return true;
  }
}

// --- Customer Functions ---
export async function getCustomers() {
  const conn = await dbConnect();
  if (conn) {
    return await CustomerItem.find().sort({ lastVisit: -1 });
  } else {
    const db = readMockDb();
    return db.customers;
  }
}

export async function saveCustomer(customerData) {
  const conn = await dbConnect();
  if (conn) {
    if (customerData.id && mongoose.isValidObjectId(customerData.id)) {
      return await CustomerItem.findByIdAndUpdate(customerData.id, customerData, { new: true });
    } else {
      const newCust = new CustomerItem(customerData);
      return await newCust.save();
    }
  } else {
    const db = readMockDb();
    if (customerData.id) {
      db.customers = db.customers.map((c) =>
        c.id === customerData.id ? { ...c, ...customerData } : c
      );
    } else {
      const newCust = {
        ...customerData,
        id: `c-${Date.now()}`,
        createdAt: new Date().toISOString(),
      };
      db.customers.push(newCust);
    }
    writeMockDb(db);
    return customerData;
  }
}

// --- Settings Functions ---
export async function getSettings() {
  const conn = await dbConnect();
  if (conn) {
    const settings = await SettingsItem.findOne();
    if (settings) return settings;
    const defaultSet = new SettingsItem(defaultSettings);
    return await defaultSet.save();
  } else {
    const db = readMockDb();
    return db.settings;
  }
}

export async function saveSettings(settingsData) {
  const conn = await dbConnect();
  if (conn) {
    const settings = await SettingsItem.findOne();
    if (settings) {
      return await SettingsItem.findByIdAndUpdate(settings._id, settingsData, { new: true });
    } else {
      const newSet = new SettingsItem(settingsData);
      return await newSet.save();
    }
  } else {
    const db = readMockDb();
    db.settings = { ...db.settings, ...settingsData };
    writeMockDb(db);
    return db.settings;
  }
}
