"use server";

import {
  getMenuItems,
  saveMenuItem,
  deleteMenuItem,
  getOrders,
  saveOrder,
  updateOrderStatus,
  getCustomers,
  saveCustomer,
  getSettings,
  saveSettings,
  clearSalesData,
} from "@/lib/db";

// Helper to serialize Mongoose objects safely to plain JS objects
const clean = (obj) => {
  if (!obj) return null;
  return JSON.parse(JSON.stringify(obj));
};

export async function fetchMenuItemsAction() {
  try {
    const items = await getMenuItems();
    return clean(items);
  } catch (error) {
    console.error("fetchMenuItemsAction error:", error);
    return [];
  }
}

export async function saveMenuItemAction(itemData) {
  try {
    const item = await saveMenuItem(itemData);
    return clean(item);
  } catch (error) {
    console.error("saveMenuItemAction error:", error);
    return { error: error.message };
  }
}

export async function deleteMenuItemAction(id) {
  try {
    const success = await deleteMenuItem(id);
    return clean(success);
  } catch (error) {
    console.error("deleteMenuItemAction error:", error);
    return { error: error.message };
  }
}

export async function fetchOrdersAction() {
  try {
    const orders = await getOrders();
    return clean(orders);
  } catch (error) {
    console.error("fetchOrdersAction error:", error);
    return [];
  }
}

export async function saveOrderAction(orderData) {
  try {
    const order = await saveOrder(orderData);
    return clean(order);
  } catch (error) {
    console.error("saveOrderAction error:", error);
    return { error: error.message };
  }
}

export async function updateOrderStatusAction(id, status) {
  try {
    const success = await updateOrderStatus(id, status);
    return clean(success);
  } catch (error) {
    console.error("updateOrderStatusAction error:", error);
    return { error: error.message };
  }
}

export async function clearSalesDataAction() {
  try {
    const success = await clearSalesData();
    return clean(success);
  } catch (error) {
    console.error("clearSalesDataAction error:", error);
    return { error: error.message };
  }
}

export async function fetchCustomersAction() {
  try {
    const customers = await getCustomers();
    return clean(customers);
  } catch (error) {
    console.error("fetchCustomersAction error:", error);
    return [];
  }
}

export async function saveCustomerAction(customerData) {
  try {
    const customer = await saveCustomer(customerData);
    return clean(customer);
  } catch (error) {
    console.error("saveCustomerAction error:", error);
    return { error: error.message };
  }
}

export async function fetchSettingsAction() {
  try {
    const settings = await getSettings();
    return clean(settings);
  } catch (error) {
    console.error("fetchSettingsAction error:", error);
    return null;
  }
}

export async function saveSettingsAction(settingsData) {
  try {
    const settings = await saveSettings(settingsData);
    return clean(settings);
  } catch (error) {
    console.error("saveSettingsAction error:", error);
    return { error: error.message };
  }
}

export async function verifyAdminPasswordAction(inputPassword) {
  try {
    const settings = await getSettings();
    const dbPassword = settings?.adminPassword || "Secure@098";
    if (inputPassword === dbPassword) {
      return { success: true };
    } else {
      return { success: false, error: "Invalid Admin Password!" };
    }
  } catch (error) {
    console.error("verifyAdminPasswordAction error:", error);
    return { success: false, error: "Database authentication error" };
  }
}

export async function resetToDefaultAction() {
  try {
    const fs = require("fs");
    const path = require("path");
    const mockFilePath = path.join(process.cwd(), "db_mock_store.json");
    if (fs.existsSync(mockFilePath)) {
      fs.unlinkSync(mockFilePath);
    }
    return { success: true };
  } catch (error) {
    console.error("resetToDefaultAction error:", error);
    return { error: error.message };
  }
}
