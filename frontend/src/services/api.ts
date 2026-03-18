import { Menu, Category, Dish, CategoryDishesResponse } from "../types/menu.types.ts";

// Check if we're on a mobile device accessing from network
const isLocalhost = window.location.hostname === 'localhost' || 
                    window.location.hostname === '127.0.0.1' ||
                    window.location.hostname === '::1';


//const API_BASE_URL = "http://192.168.18.29:5000";
const API_BASE_URL = import.meta.env.VITE_API_URL || "";

 console.log('🔥 Mode:', import.meta.env.MODE);
 console.log('🔥 PROD:', import.meta.env.PROD);
 console.log('API Base URL:', API_BASE_URL);
 console.log('VITE_API_URL:', import.meta.env.VITE_API_URL);
 console.log('Hostname:', window.location.hostname);
 console.log('🔥 Port:', window.location.port);
 console.log('🔥 isLocalhost:', isLocalhost);

async function fetchAPI<T>(
  endpoint: string,
  options?: RequestInit
  ): Promise<T> {
  const finalEndpoint = endpoint.startsWith('/api') ? endpoint : `/api${endpoint}`;
  
  const url = API_BASE_URL
  ? `${API_BASE_URL}${finalEndpoint}`
  : finalEndpoint;

  console.log('🔍 Fetching URL:', url);
  
  try {
    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
      },
      ...options,
      });
    
    console.log(`📡 Response status:`, response.status);
    
   
    const responseText = await response.text();
    console.log(`📦 Response text:`, responseText.substring(0, 100) + '...');
   
    let data;
    try {
      data = JSON.parse(responseText);
    } catch {
      console.error("❌ Failed to parse JSON, got HTML instead" );
      throw new Error(`API returned HTML instead of JSON - check if backend is running at ${url}`);
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