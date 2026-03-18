import { connectToDatabase } from '../../../lib/db.js';
import Menu from '../../../models/Menu.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
//=========
    res.setHeader('Content-Type', 'application/json');

     // Log the request for debugging
  console.log('🔵 Dishes API called:', {
    method: req.method,
    url: req.url,
    query: req.query,
    time: new Date().toISOString()
  });
//===========
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'Category ID is required' });
  }

  try {
    await connectToDatabase();

    if (req.method === 'GET') {
      const menu = await Menu.findOne().lean();

      if (!menu) {
        return res.status(404).json({ error: 'Menu not found' });
      }

      const category = menu.categories.find(c => c.id === id);

      if (!category) {
        return res.status(404).json({ error: 'Category not found' });
      }

      const dishes = menu.dishes.filter(d => d.category === id);

      return res.status(200).json({
        category,
        dishes
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });

  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: error.message });
  }
}