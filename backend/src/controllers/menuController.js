import Menu from "../models/Menu.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// @desc    Get all menu data (categories and dishes)
// @route   GET /api/menu
// @access  Public
export const getMenu = async (req, res) => {
  try {
    let menu = await Menu.findOne();
    
    // If no menu exists in DB, load from JSON file
    if (!menu) {
      const menuDataPath = path.join(__dirname, "../data/menuData.json");
      const menuData = JSON.parse(fs.readFileSync(menuDataPath, "utf8"));
      
      menu = await Menu.create(menuData);
      console.log("✅ Menu data loaded from JSON file");
    }
    
    res.json({
      success: true,
      data: menu
    });
  } catch (error) {
    console.error("Error fetching menu:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching menu data",
      error: error.message
    });
  }
};

// @desc    Get all categories
// @route   GET /api/menu/categories
// @access  Public
export const getCategories = async (req, res) => {
  try {
    const menu = await Menu.findOne();
    
    if (!menu) {
      return res.status(404).json({
        success: false,
        message: "Menu not found"
      });
    }
    
    // Filter active categories and sort by order
    const activeCategories = menu.categories
      .filter(cat => cat.active)
      .sort((a, b) => a.order - b.order);
    
    res.json({
      success: true,
      data: activeCategories
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching categories",
      error: error.message
    });
  }
};

// @desc    Get dishes by category
// @route   GET /api/menu/categories/:categoryId/dishes
// @access  Public
export const getDishesByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    
    const menu = await Menu.findOne();
    
    if (!menu) {
      return res.status(404).json({
        success: false,
        message: "Menu not found"
      });
    }
    
    // Check if category exists and is active
    const category = menu.categories.find(
      cat => cat.id === categoryId && cat.active
    );
    
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found"
      });
    }
    
    // Get dishes for this category
    const dishes = menu.dishes.filter(
      dish => dish.category === categoryId && dish.available
    );
    
    res.json({
      success: true,
      data: {
        category,
        dishes
      }
    });
  } catch (error) {
    console.error("Error fetching dishes:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching dishes",
      error: error.message
    });
  }
};

// @desc    Get single dish by ID
// @route   GET /api/menu/dishes/:dishId
// @access  Public
export const getDishById = async (req, res) => {
  try {
    const { dishId } = req.params;
    
    const menu = await Menu.findOne();
    
    if (!menu) {
      return res.status(404).json({
        success: false,
        message: "Menu not found"
      });
    }
    
    const dish = menu.dishes.find(d => d.id === dishId);
    
    if (!dish) {
      return res.status(404).json({
        success: false,
        message: "Dish not found"
      });
    }
    
    res.json({
      success: true,
      data: dish
    });
  } catch (error) {
    console.error("Error fetching dish:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching dish",
      error: error.message
    });
  }
};

// @desc    Search dishes
// @route   GET /api/menu/search?q=query
// @access  Public
export const searchDishes = async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q) {
      return res.status(400).json({
        success: false,
        message: "Search query is required"
      });
    }
    
    const menu = await Menu.findOne();
    
    if (!menu) {
      return res.status(404).json({
        success: false,
        message: "Menu not found"
      });
    }
    
    const searchRegex = new RegExp(q, "i");
    const results = menu.dishes.filter(dish => 
      (dish.available && 
        (searchRegex.test(dish.name) || 
         searchRegex.test(dish.description) ||
         dish.ingredients.some(ing => searchRegex.test(ing))))
    );
    
    res.json({
      success: true,
      data: results
    });
  } catch (error) {
    console.error("Error searching dishes:", error);
    res.status(500).json({
      success: false,
      message: "Error searching dishes",
      error: error.message
    });
  }
};

// @desc    Get popular dishes
// @route   GET /api/menu/popular
// @access  Public
export const getPopularDishes = async (req, res) => {
  try {
    const menu = await Menu.findOne();
    
    if (!menu) {
      return res.status(404).json({
        success: false,
        message: "Menu not found"
      });
    }
    
    const popularDishes = menu.dishes.filter(
      dish => dish.available && dish.popular
    );
    
    res.json({
      success: true,
      data: popularDishes
    });
  } catch (error) {
    console.error("Error fetching popular dishes:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching popular dishes",
      error: error.message
    });
  }
};

// @desc    Get dietary options (vegetarian, vegan, gluten-free)
// @route   GET /api/menu/dietary/:option
// @access  Public
export const getDietaryOptions = async (req, res) => {
  try {
    const { option } = req.params;
    
    const validOptions = ["vegetarian", "vegan", "glutenFree"];
    
    if (!validOptions.includes(option)) {
      return res.status(400).json({
        success: false,
        message: "Invalid dietary option. Use: vegetarian, vegan, or glutenFree"
      });
    }
    
    const menu = await Menu.findOne();
    
    if (!menu) {
      return res.status(404).json({
        success: false,
        message: "Menu not found"
      });
    }
    
    const filteredDishes = menu.dishes.filter(
      dish => dish.available && dish[option] === true
    );
    
    res.json({
      success: true,
      data: filteredDishes
    });
  } catch (error) {
    console.error("Error fetching dietary options:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching dietary options",
      error: error.message
    });
  }
};

// Admin routes (protected)

// @desc    Update entire menu
// @route   PUT /api/menu
// @access  Private/Admin
export const updateMenu = async (req, res) => {
  try {
    let menu = await Menu.findOne();
    
    if (!menu) {
      menu = await Menu.create(req.body);
    } else {
      menu = await Menu.findOneAndUpdate(
        {},
        { ...req.body, lastUpdated: Date.now() },
        { new: true, runValidators: true }
      );
    }
    
    res.json({
      success: true,
      data: menu
    });
  } catch (error) {
    console.error("Error updating menu:", error);
    res.status(500).json({
      success: false,
      message: "Error updating menu",
      error: error.message
    });
  }
};

// @desc    Add new category
// @route   POST /api/menu/categories
// @access  Private/Admin
export const addCategory = async (req, res) => {
  try {
    const menu = await Menu.findOne();
    
    if (!menu) {
      return res.status(404).json({
        success: false,
        message: "Menu not found"
      });
    }
    
    // Check if category with same id exists
    const existingCategory = menu.categories.find(
      cat => cat.id === req.body.id
    );
    
    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: "Category with this ID already exists"
      });
    }
    
    menu.categories.push(req.body);
    menu.lastUpdated = Date.now();
    await menu.save();
    
    res.status(201).json({
      success: true,
      data: menu.categories[menu.categories.length - 1]
    });
  } catch (error) {
    console.error("Error adding category:", error);
    res.status(500).json({
      success: false,
      message: "Error adding category",
      error: error.message
    });
  }
};

// @desc    Add new dish
// @route   POST /api/menu/dishes
// @access  Private/Admin
export const addDish = async (req, res) => {
  try {
    const menu = await Menu.findOne();
    
    if (!menu) {
      return res.status(404).json({
        success: false,
        message: "Menu not found"
      });
    }
    
    // Check if dish with same id exists
    const existingDish = menu.dishes.find(
      dish => dish.id === req.body.id
    );
    
    if (existingDish) {
      return res.status(400).json({
        success: false,
        message: "Dish with this ID already exists"
      });
    }
    
    menu.dishes.push(req.body);
    menu.lastUpdated = Date.now();
    await menu.save();
    
    res.status(201).json({
      success: true,
      data: menu.dishes[menu.dishes.length - 1]
    });
  } catch (error) {
    console.error("Error adding dish:", error);
    res.status(500).json({
      success: false,
      message: "Error adding dish",
      error: error.message
    });
  }
};