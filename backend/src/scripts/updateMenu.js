
import Menu from "../../../api/models/Menu.js";
import { connectToDatabase } from "../../../api/lib/db.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


async function updateMenu() {
  try {
    await connectToDatabase();
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
    console.log("READY STATE:", Menu.db.readyState);
    await Menu.deleteMany({});
    
    // Insert new menu data
    console.log("📤 Inserting new menu data...");
    const menu = await Menu.create(menuData);

    console.log("✅ Menu updated successfully!");
    console.log(`📊 Categories: ${menu.categories.length}`);
    console.log(`📊 Dishes: ${menu.dishes.length}`);

   
  } catch (error) {
    console.error("❌ Error updating menu:", error);
   
  }
}
updateMenu();

//This page is just to update the MongoDB.!
