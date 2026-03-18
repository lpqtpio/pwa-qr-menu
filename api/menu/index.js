import { connectToDatabase } from '../lib/db.js';
import Menu from '../../api/models/Menu.js';

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    await connectToDatabase();

    switch (req.method) {
      case 'GET':
        return await getMenu(req, res);
      case 'POST':
        return await addDish(req, res);
      case 'PUT':
        return await updateMenu(req, res);
      default:
        return res.status(405).json({ 
          error: `Method ${req.method} Not Allowed`,
          allowedMethods: ['GET', 'POST', 'PUT', 'OPTIONS']
        });
    }
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}

// GET /api/menu - Get all menu data with optional filters
async function getMenu(req, res) {
  try {
    const { category, available, vegetarian, vegan, spicy, popular } = req.query;
    
    const menu = await Menu.findOne().lean();
    
    if (!menu) {
      return res.status(404).json({ error: 'Menu not found' });
    }

    let filteredDishes = [...menu.dishes];

    // Apply filters if provided
    if (category && category !== 'all') {
      filteredDishes = filteredDishes.filter(d => d.category === category);
    }
    
    if (available === 'true') {
      filteredDishes = filteredDishes.filter(d => d.available === true);
    }
    
    if (vegetarian === 'true') {
      filteredDishes = filteredDishes.filter(d => d.vegetarian === true);
    }
    
    if (vegan === 'true') {
      filteredDishes = filteredDishes.filter(d => d.vegan === true);
    }
    
    if (spicy === 'true') {
      filteredDishes = filteredDishes.filter(d => d.spicy === true);
    }
    
    if (popular === 'true') {
      filteredDishes = filteredDishes.filter(d => d.popular === true);
    }

    // Get unique categories with counts
    const categoriesWithCounts = menu.categories.map(cat => ({
      ...cat,
      dishCount: menu.dishes.filter(d => d.category === cat.id && d.available).length,
      filteredCount: filteredDishes.filter(d => d.category === cat.id).length
    }));

    // Return enhanced response
    return res.status(200).json({
      restaurantName: menu.restaurantName,
      currency: menu.currency,
      lastUpdated: menu.lastUpdated,
      categories: categoriesWithCounts,
      dishes: filteredDishes,
      totalDishes: filteredDishes.length,
      filters: {
        applied: {
          category: category || 'all',
          available: available || 'false',
          vegetarian: vegetarian || 'false',
          vegan: vegan || 'false',
          spicy: spicy || 'false',
          popular: popular || 'false'
        },
        available: {
          categories: menu.categories.map(c => c.id),
          maxPrice: Math.max(...menu.dishes.map(d => d.price)),
          minPrice: Math.min(...menu.dishes.map(d => d.price))
        }
      }
    });
    
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

// POST /api/menu - Add a new dish
async function addDish(req, res) {
  try {
    const newDish = req.body;
    
    // Validate required fields
    const requiredFields = ['id', 'name', 'description', 'price', 'category'];
    const missingFields = requiredFields.filter(field => !newDish[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        missingFields
      });
    }

    // Validate price is a number
    if (typeof newDish.price !== 'number' || newDish.price <= 0) {
      return res.status(400).json({ 
        error: 'Price must be a positive number' 
      });
    }

    let menu = await Menu.findOne();
    
    if (!menu) {
      // Create new menu with the dish
      menu = new Menu({
        restaurantName: 'Delicious Bites',
        currency: '$',
        categories: [],
        dishes: [newDish]
      });
    } else {
      // Check if dish with same ID exists
      const existingDish = menu.dishes.find(d => d.id === newDish.id);
      if (existingDish) {
        return res.status(409).json({ 
          error: 'Dish with this ID already exists',
          existingDish 
        });
      }
      
      // Check if category exists
      const categoryExists = menu.categories.some(c => c.id === newDish.category);
      if (!categoryExists) {
        return res.status(400).json({ 
          error: 'Category does not exist',
          availableCategories: menu.categories.map(c => c.id)
        });
      }
      
      menu.dishes.push(newDish);
    }
    
    // Set default values for optional fields
    newDish.available = newDish.available ?? true;
    newDish.ingredients = newDish.ingredients || [];
    newDish.spicy = newDish.spicy ?? false;
    newDish.vegetarian = newDish.vegetarian ?? false;
    newDish.vegan = newDish.vegan ?? false;
    newDish.glutenFree = newDish.glutenFree ?? false;
    newDish.popular = newDish.popular ?? false;
    
    menu.lastUpdated = Date.now();
    await menu.save();
    
    return res.status(201).json({
      message: 'Dish added successfully',
      dish: newDish
    });
    
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

// PUT /api/menu - Update entire menu (admin only)
async function updateMenu(req, res) {
  try {
    const updates = req.body;
    
    let menu = await Menu.findOne();
    
    if (!menu) {
      menu = new Menu(updates);
    } else {
      // Update allowed fields
      if (updates.restaurantName) menu.restaurantName = updates.restaurantName;
      if (updates.currency) menu.currency = updates.currency;
      if (updates.categories) menu.categories = updates.categories;
      if (updates.dishes) menu.dishes = updates.dishes;
      
      menu.lastUpdated = Date.now();
    }
    
    await menu.save();
    
    return res.status(200).json({
      message: 'Menu updated successfully',
      menu: {
        restaurantName: menu.restaurantName,
        currency: menu.currency,
        categories: menu.categories.length,
        dishes: menu.dishes.length,
        lastUpdated: menu.lastUpdated
      }
    });
    
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}