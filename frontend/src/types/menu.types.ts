// Category Type
export interface Category {
  id: string;
  name: string;
  description: string;
  icon: string;
  image: string;
  order: number;
  active: boolean;
}

// Dish Type
export interface Dish {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  available: boolean;
  ingredients: string[];
  spicy: boolean;
  vegetarian: boolean;
  vegan: boolean;
  glutenFree: boolean;
  popular: boolean;
}

// Complete Menu Type
export interface Menu {
  restaurantName: string;
  currency: string;
  categories: Category[];
  dishes: Dish[];
  lastUpdated: string;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface CategoryDishesResponse {
  category: Category;
  dishes: Dish[];
}

// Cart Item Type (extends your existing MenuItem)
export interface CartItem {
  item: Dish;
  quantity: number;
}

// Filter Options
export interface FilterOptions {
  vegetarian?: boolean;
  vegan?: boolean;
  glutenFree?: boolean;
  spicy?: boolean;
  popular?: boolean;
  maxPrice?: number;
}