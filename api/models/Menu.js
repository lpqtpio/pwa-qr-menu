import mongoose from "mongoose";

const dishSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  image: { type: String, default: "/images/placeholder.jpg" },
  category: { type: String, required: true },
  available: { type: Boolean, default: true },
  ingredients: [String],
  spicy: { type: Boolean, default: false },
  vegetarian: { type: Boolean, default: false },
  vegan: { type: Boolean, default: false },
  glutenFree: { type: Boolean, default: false },
  popular: { type: Boolean, default: false }
}, { timestamps: true });

const categorySchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  description: { type: String },
  icon: { type: String, default: "🍽️" },
  image: { type: String, default: "/images/category-placeholder.jpg" },
  order: { type: Number, default: 0 },
  active: { type: Boolean, default: true }
}, { timestamps: true });

const menuSchema = new mongoose.Schema({
  categories: [categorySchema],
  dishes: [dishSchema],
  lastUpdated: { type: Date, default: Date.now },
  restaurantName: { type: String, default: "Our Restaurant" },
  currency: { type: String, default: "$" }
}, { timestamps: true });

// ✅ FIX HERE
const Menu = mongoose.models.Menu || mongoose.model("Menu", menuSchema);

export default Menu;