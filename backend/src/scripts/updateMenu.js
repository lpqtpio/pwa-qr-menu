import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import Menu from "../models/Menu.js";
import { MONGODB_URI } from "../../../shared/env.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function updateMenu() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    // Load data from JSON file
    const menuDataPath = path.join(__dirname, "../data/menuData.json");
    console.log("📖 Loading menu from:", menuDataPath);

    const menuData = JSON.parse(fs.readFileSync(menuDataPath, "utf8"));
    console.log("📦 Data loaded:", {
      categories: menuData.categories.length,
      dishes: menuData.dishes.length,
    });

    // Delete existing menu data (FORCE UPDATE)
    console.log("🗑️  Deleting existing menu...");
    await Menu.deleteMany({});

    // Insert new menu data
    console.log("📤 Inserting new menu data...");
    const menu = await Menu.create(menuData);

    console.log("✅ Menu updated successfully!");
    console.log(`📊 Categories: ${menu.categories.length}`);
    console.log(`📊 Dishes: ${menu.dishes.length}`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error updating menu:", error);
    process.exit(1);
  }
}

updateMenu();

//This page is just to update the MongoDB.!
