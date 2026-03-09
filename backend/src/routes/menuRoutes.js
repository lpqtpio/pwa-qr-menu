import { Router } from "express";
import {
  getMenu,
  getCategories,
  getDishesByCategory,
  getDishById,
  searchDishes,
  getPopularDishes,
  getDietaryOptions,
  updateMenu,
  addCategory,
  addDish
} from "../controllers/menuController.js";
import { protect } from "../middleware/auth.js";     //admin

const router = Router();

// Public routes
router.get("/", getMenu);
router.get("/categories", getCategories);
router.get("/categories/:categoryId/dishes", getDishesByCategory);
router.get("/dishes/:dishId", getDishById);
router.get("/search", searchDishes);
router.get("/popular", getPopularDishes);
router.get("/dietary/:option", getDietaryOptions);

// Admin routes (protected)
router.put("/", protect, updateMenu);
router.post("/categories", protect, addCategory);
router.post("/dishes", protect, addDish);

export default router;