import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import Menu from "./../../src/models/Menu.js";
import { MONGODB_URI } from "../../../shared/env.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function initMenu() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    // Check if menu already exists
    const existingMenu = await Menu.findOne();
    if (existingMenu) {
      console.log("Menu already exists in database");
      await mongoose.disconnect();
      process.exit(0);
    }

    // Load data from JSON file
    const menuDataPath = path.join(__dirname, "../data/menuData.json");
    console.log("Loading menu from:", menuDataPath);

    const menuData = JSON.parse(fs.readFileSync(menuDataPath, "utf8"));

    const menu = await Menu.create(menuData);
    console.log("✅ Menu data loaded successfully!");
    console.log(`📊 Categories: ${menu.categories.length}`);
    console.log(`📊 Dishes: ${menu.dishes.length}`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error loading menu:", error);
    process.exit(1);
  }
}

initMenu();

//First time setup, for new database..!
