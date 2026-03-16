import { connectToDatabase } from "../../lib/db.js";
import { protect } from "../../lib/auth.js";
import Menu from "../../../backend/src/models/Menu.js";

export default async function handler(req, res) {
 
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS",
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,authorization");

  // Handle preflight OPTIONS request
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    await connectToDatabase();

    switch (req.method) {
      case "GET":
        return await getCategories(req, res);
      case "POST":
        // Add protect middleware if needed
        return await addCategory(req, res);
      default:
        return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }
  } catch (error) {
    console.error("API Error:", error);
    return res.status(500).json({ error: error.message });
  }
}

async function getCategories(req, res) {
  try {
    const menu = await Menu.findOne().lean();

    if (!menu) {
      return res.status(200).json({ data: [] });
    }

    let categories = menu.categories || [];

    // Enhance categories with dish information
    const enhancedCategories = categories.map((category) => {
      const categoryDishes = menu.dishes.filter(
        (dish) => dish.category === category.id,
      );

      return {
        id: category.id,
        name: category.name,
        icon: category.icon,
        active: category.active,
        order: category.order,
        stats: {
          totalDishes: categoryDishes.length,
          availableDishes: categoryDishes.filter((d) => d.available).length,
          popularDishes: categoryDishes.filter((d) => d.popular).length,
        },
      };
    });

    // Sort by order field
    enhancedCategories.sort((a, b) => (a.order || 0) - (b.order || 0));

    return res.status(200).json({
      data: enhancedCategories,
      total: enhancedCategories.length,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
//===================
// POST /api/categories - Add a new category
async function addCategory(req, res) {
  try {
    const newCategory = req.body;

    // Validate required fields
    const requiredFields = ["id", "name"];
    const missingFields = requiredFields.filter((field) => !newCategory[field]);

    if (missingFields.length > 0) {
      return res.status(400).json({
        error: "Missing required fields",
        missingFields,
        required: requiredFields,
      });
    }

    // Validate ID format (no spaces, lowercase)
    if (!/^[a-z0-9-]+$/.test(newCategory.id)) {
      return res.status(400).json({
        error:
          "Category ID must contain only lowercase letters, numbers, and hyphens",
      });
    }

    let menu = await Menu.findOne();

    if (!menu) {
      // Create new menu with the category
      menu = new Menu({
        restaurantName: "Delicious Bites",
        currency: "$",
        categories: [
          {
            ...newCategory,
            active: newCategory.active ?? true,
            order: newCategory.order || 0,
          },
        ],
        dishes: [],
      });
    } else {
      // Check if category exists
      const existing = menu.categories.find((c) => c.id === newCategory.id);
      if (existing) {
        return res.status(409).json({
          error: "Category with this ID already exists",
          existingCategory: existing,
        });
      }

      // Set default order to last if not provided
      if (!newCategory.order) {
        const maxOrder = Math.max(
          ...menu.categories.map((c) => c.order || 0),
          0,
        );
        newCategory.order = maxOrder + 1;
      }

      // Set defaults
      newCategory.active = newCategory.active ?? true;
      newCategory.icon = newCategory.icon || "🍽️";

      menu.categories.push(newCategory);
    }

    menu.lastUpdated = Date.now();
    await menu.save();

    return res.status(201).json({
      message: "Category added successfully",
      category: newCategory,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

// PUT /api/categories - Update multiple categories (reorder, bulk update)
async function updateCategories(req, res) {
  try {
    const { categories } = req.body;

    if (!categories || !Array.isArray(categories)) {
      return res.status(400).json({
        error: "Request body must include categories array",
      });
    }

    const menu = await Menu.findOne();

    if (!menu) {
      return res.status(404).json({ error: "Menu not found" });
    }

    // Update categories
    const updatedCategories = categories.map((updatedCat) => {
      const existingCat = menu.categories.find((c) => c.id === updatedCat.id);
      if (existingCat) {
        return { ...existingCat, ...updatedCat };
      }
      return updatedCat;
    });

    menu.categories = updatedCategories;
    menu.lastUpdated = Date.now();

    await menu.save();

    return res.status(200).json({
      message: "Categories updated successfully",
      categories: menu.categories.map((c) => ({
        id: c.id,
        name: c.name,
        order: c.order,
        active: c.active,
      })),
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
