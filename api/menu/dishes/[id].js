// api/menu/dishes/[id].js
import { connectToDatabase } from '../../lib/db.js';
import mongoose from 'mongoose';

const dishSchema = new mongoose.Schema({}, { collection: 'dishes', strict: false });
const Dish = mongoose.models.Dish || mongoose.model('Dish', dishSchema);

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { id } = req.query;
    
    await connectToDatabase();
    
    const dish = await Dish.findById(id).lean();
    
    if (!dish) {
      return res.status(404).json({ error: 'Dish not found' });
    }
    
    res.status(200).json(dish);
    
  } catch (error) {
    console.error('Error fetching dish:', error);
    res.status(500).json({ error: 'Failed to fetch dish' });
  }
}