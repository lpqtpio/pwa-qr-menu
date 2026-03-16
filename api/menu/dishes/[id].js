import { connectToDatabase } from '../../lib/db.js';
import Menu from '../../../backend/src/models/Menu.js';

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { id } = req.query; // Gets the dish ID from URL

  // Validate ID parameter
  if (!id) {
    return res.status(400).json({ error: 'Dish ID is required' });
  }

  try {
    await connectToDatabase();

    switch (req.method) {
      case 'GET':
        return await getDishById(req, res, id);
      case 'PUT':
        return await updateDish(req, res, id);
      case 'DELETE':
        return await deleteDish(req, res, id);
      default:
        return res.status(405).json({ 
          error: `Method ${req.method} Not Allowed`,
          allowedMethods: ['GET', 'PUT', 'DELETE', 'OPTIONS']
        });
    }
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: error.message });
  }
}

// GET /api/menu/:id - Get a single dish by ID
async function getDishById(req, res, id) {
  try {
    const menu = await Menu.findOne().lean();
    
    if (!menu) {
      return res.status(404).json({ error: 'Menu not found' });
    }
    
    const dish = menu.dishes.find(d => d.id === id);
    
    if (!dish) {
      return res.status(404).json({ 
        error: 'Dish not found',
        requestedId: id
      });
    }
    
    // Add category details to response
    const category = menu.categories.find(c => c.id === dish.category);
    
    return res.status(200).json({
      ...dish,
      categoryDetails: category ? {
        name: category.name,
        icon: category.icon,
        description: category.description
      } : null
    });
    
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

// PUT /api/menu/:id - Update a specific dish
async function updateDish(req, res, id) {
  try {
    const updates = req.body;
    const menu = await Menu.findOne();
    
    if (!menu) {
      return res.status(404).json({ error: 'Menu not found' });
    }
    
    const dishIndex = menu.dishes.findIndex(d => d.id === id);
    
    if (dishIndex === -1) {
      return res.status(404).json({ 
        error: 'Dish not found',
        requestedId: id
      });
    }
    
    // If category is being updated, verify it exists
    if (updates.category) {
      const categoryExists = menu.categories.some(c => c.id === updates.category);
      if (!categoryExists) {
        return res.status(400).json({ 
          error: 'Category does not exist',
          availableCategories: menu.categories.map(c => c.id)
        });
      }
    }
    
    // Update dish while preserving id and essential fields
    const updatedDish = {
      ...menu.dishes[dishIndex],
      ...updates,
      id: id // Ensure ID doesn't change
    };
    
    // Validate price if updated
    if (updates.price !== undefined && (typeof updates.price !== 'number' || updates.price <= 0)) {
      return res.status(400).json({ error: 'Price must be a positive number' });
    }
    
    menu.dishes[dishIndex] = updatedDish;
    menu.lastUpdated = Date.now();
    
    await menu.save();
    
    return res.status(200).json({
      message: 'Dish updated successfully',
      dish: updatedDish
    });
    
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

// DELETE /api/menu/:id - Delete a specific dish
async function deleteDish(req, res, id) {
  try {
    const menu = await Menu.findOne();
    
    if (!menu) {
      return res.status(404).json({ error: 'Menu not found' });
    }
    
    const dishIndex = menu.dishes.findIndex(d => d.id === id);
    
    if (dishIndex === -1) {
      return res.status(404).json({ 
        error: 'Dish not found',
        requestedId: id
      });
    }
    
    // Remove the dish
    const deletedDish = menu.dishes[dishIndex];
    menu.dishes.splice(dishIndex, 1);
    menu.lastUpdated = Date.now();
    
    await menu.save();
    
    return res.status(200).json({ 
      message: 'Dish deleted successfully',
      deletedDish: {
        id: deletedDish.id,
        name: deletedDish.name
      }
    });
    
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}