import { connectToDatabase } from "../../backend/src/config/db.js";
import Menu from "../../backend/src/models/Menu.js";
import { protect } from "../lib/auth.js";

export default async function handler(req, res) {
  // Enable CORS - MUST be first
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  // Handle preflight OPTIONS request
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: "Category ID is required" });
  }

  try {
    await connectToDatabase();

    // Apply auth middleware for PUT and DELETE
    if (req.method === "PUT" || req.method === "DELETE") {
      return protect(req, res, async () => {
        switch (req.method) {
          case "PUT":
            return await updateCategory(req, res, id);
          case "DELETE":
            return await deleteCategory(req, res, id);
        }
      });
    }

    // Public GET route
    if (req.method === "GET") {
      return await getCategoryById(req, res, id);
    }

    // Method not allowed
    return res
      .status(405)
      .json({ error: `Method ${req.method} Not Allowed` });
  } catch (error) {
    console.error("API Error:", error);
    return res.status(500).json({ error: error.message });
  }
}

async function getCategoryById(req, res, id) {
  try {
    const menu = await Menu.findOne().lean();

    if (!menu) {
      return res.status(404).json({ error: "Menu not found" });
    }

    const category = menu.categories.find((c) => c.id === id);

    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }

    // Get dishes in this category
    const categoryDishes = menu.dishes.filter((d) => d.category === id);

    return res.status(200).json({
      ...category,
      dishes: categoryDishes.map((d) => ({
        id: d.id,
        name: d.name,
        price: d.price,
        image: d.image,
        description: d.description,
        available: d.available,
        popular: d.popular,
      })),
      stats: {
        totalDishes: categoryDishes.length,
        availableDishes: categoryDishes.filter((d) => d.available).length,
        popularDishes: categoryDishes.filter((d) => d.popular).length,
      },
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

async function updateCategory(req, res, id) {
  try {
    const updates = req.body;
    const menu = await Menu.findOne();

    if (!menu) {
      return res.status(404).json({ error: "Menu not found" });
    }

    const categoryIndex = menu.categories.findIndex((c) => c.id === id);

    if (categoryIndex === -1) {
      return res.status(404).json({ error: "Category not found" });
    }

    // Update category
    menu.categories[categoryIndex] = {
      ...menu.categories[categoryIndex],
      ...updates,
      id, // Preserve ID
    };

    menu.lastUpdated = Date.now();
    await menu.save();

    return res.status(200).json({
      message: "Category updated successfully",
      category: menu.categories[categoryIndex],
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

async function deleteCategory(req, res, id) {
  try {
    const menu = await Menu.findOne();

    if (!menu) {
      return res.status(404).json({ error: "Menu not found" });
    }

    // Check if category has dishes
    const dishesInCategory = menu.dishes.filter((d) => d.category === id);
    if (dishesInCategory.length > 0) {
      return res.status(400).json({
        error: "Cannot delete category with existing dishes",
        dishesCount: dishesInCategory.length,
        dishes: dishesInCategory.map((d) => ({ id: d.id, name: d.name })),
      });
    }

    const categoryIndex = menu.categories.findIndex((c) => c.id === id);

    if (categoryIndex === -1) {
      return res.status(404).json({ error: "Category not found" });
    }

    // Remove category
    menu.categories.splice(categoryIndex, 1);
    menu.lastUpdated = Date.now();

    await menu.save();

    return res.status(200).json({
      message: "Category deleted successfully",
      deletedCategoryId: id,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}