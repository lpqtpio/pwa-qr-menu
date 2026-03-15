import { Menu, Category, Dish, CategoryDishesResponse } from "../types/menu.types";

const API_BASE_URL =  import.meta.env.PROD
  ? (import.meta.env.VITE_API_URL || 'https://your-production-url.com') + 'api' 
  : `http://${window.location.hostname}:5000/api`;

console.log('API Base URL:', API_BASE_URL);

async function fetchAPI<T>(
  endpoint: string,
  options?: RequestInit
  ): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
      },
      ...options,
      });
    
    console.log(`📡 Response status:`, response.status);
    
   
    const responseText = await response.text();
    console.log(`📦 Response text:`, responseText);
   
    let data;
    try {
      data = JSON.parse(responseText);
    } catch {
      console.error("❌ Failed to parse JSON:", responseText);
      throw new Error(`Invalid JSON response: ${responseText.substring(0, 100)}`);
    }

    if (!response.ok) {
      throw new Error(data.message || `API call failed: ${response.status}`);
    }
    
    return data.data || data;
  } catch (error) {
    console.error(`❌ Fetch error for ${url}:`, error);
    throw error;
  }
}

// Menu endpoints
export async function getMenu(): Promise<Menu> {
  return fetchAPI<Menu>("/menu");
}

export async function getCategories(): Promise<Category[]> {
  return fetchAPI<Category[]>("/menu/categories");
}

export async function getDishesByCategory(categoryId: string): Promise<CategoryDishesResponse> {
  return fetchAPI<CategoryDishesResponse>(`/menu/categories/${categoryId}/dishes`);
}

export async function getDishById(dishId: string): Promise<Dish> {
  return fetchAPI<Dish>(`/menu/dishes/${dishId}`);
}

export async function searchDishes(query: string): Promise<Dish[]> {
  return fetchAPI<Dish[]>(`/menu/search?q=${encodeURIComponent(query)}`);
}

export async function getPopularDishes(): Promise<Dish[]> {
  return fetchAPI<Dish[]>("/menu/popular");
}

export async function getDietaryOptions(option: "vegetarian" | "vegan" | "glutenFree"): Promise<Dish[]> {
  return fetchAPI<Dish[]>(`/menu/dietary/${option}`);
}

// Admin endpoints (protected)
export async function updateMenu(menuData: Partial<Menu>): Promise<Menu> {
  const token = localStorage.getItem("token");
  return fetchAPI<Menu>("/menu", {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(menuData),
  });
}

export async function addCategory(categoryData: Omit<Category, "id"> & { id?: string }): Promise<Category> {
  const token = localStorage.getItem("token");
  return fetchAPI<Category>("/menu/categories", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(categoryData),
  });
}

export async function addDish(dishData: Omit<Dish, "id"> & { id?: string }): Promise<Dish> {
  const token = localStorage.getItem("token");
  return fetchAPI<Dish>("/menu/dishes", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(dishData),
  });
}