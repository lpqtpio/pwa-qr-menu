import { useState, useEffect, useCallback } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useCart } from "../hooks/useCart.ts";
import { Category, Dish } from "../types/menu.types.ts";
import { getCategories, getDishesByCategory  } from "../services/api.ts";
import styles from "./../../src/styles/Menu.module.css";


export default function Menu() {
  const { addToCart, table, cart } = useCart();
  const navigate = useNavigate();
 

  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [dishes, setDishes ] = useState<Dish[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  const [dishesCache, setDishesCache] = useState<Record<string, Dish[]>>({});

  //==========================>
 const fetchDishes = useCallback(async (categoryId: string) => {
  if (dishesCache[categoryId]) {
    console.log(`📦 Using cached dishes for category ${categoryId}`);
    setDishes(dishesCache[categoryId]);
    return;
  }

  try {
    console.log(`🌐 Fetching dishes for category ${categoryId} from API...`);
    const data = await getDishesByCategory(categoryId);

    setDishes(data.dishes);

    setDishesCache(prev => ({
      ...prev,
      [categoryId]: data.dishes
    }));
  } catch (err) {
    console.error("Failed to load dishes:", err);
  }
}, [dishesCache]); // ✅ keep dependency
//======================>
  // Check table and fetch categories
  useEffect(() => {
   

    if (!table) {
      navigate("/");
      return;
    }
     console.log("🔥 Table found, fetching categories");
    fetchCategories();
  }, [table, navigate]); 

  // Fetch dishes when category changes
  useEffect(() => {
    if (selectedCategory) {
      fetchDishes(selectedCategory);
    }
  }, [selectedCategory, fetchDishes]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      console.log("🔍 Fetching categories from API...");
    

      const data = await getCategories();
      console.log("✅ Categories received:", data);

      setCategories(data);
      if (data.length > 0) {
        setSelectedCategory(data[0].id); 
      }
      setError(null);
    } catch (err: unknown) {
      console.error("❌ Failed to load menu:", err);
      
      if (err instanceof Error) {
        console.error("Error name:", err.name);
        console.error("Error message:", err.message);
        console.error("Error stack:", err.stack);
      }
      setError("Failed to load menu");
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryClick = (categoryId: string) => {
    setSelectedCategory(categoryId);
  };

  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Cargando menú...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <p className={styles.error}>{error}</p>
        <button onClick={() => window.location.reload()} className={styles.retryButton}>
          Intentar de nuevo
        </button>
      </div>
    );
  }

  return (
    <div className={styles.container}>

      {/* Category Tabs */}
      <div className={styles.categoryTabs}>
        <h1 className={styles.categoriesTitle}>CATEGORÍAS</h1>
        {categories.map((category) => (
          <button
            key={category.id}
            className={`${styles.categoryTab} ${
              selectedCategory === category.id ? styles.activeTab : ""
            }`}
            onClick={() => handleCategoryClick(category.id)}
          >
            <span className={styles.categoryIcon}>{category.icon}</span>
            <span className={styles.categoryName}>{category.name}</span>
          </button>
        ))}
      </div>

      {/* Dishes Grid */}
      
      <div className={styles.dishesGrid}>
          <h2 className={styles.menuTitle}>
              MENÚ
          </h2>
       
        {dishes.map((dish) => (
          <div key={dish.id} className={styles.dishCard}>
            <div className={styles.dishImageContainer}>
              {dish.image ? (
                <img 
                  src={dish.image} 
                  alt={dish.name}
                  className={styles.dishImage}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/images/placeholder.jpg';
                  }}
                />
              ) : (
                <div className={styles.dishPlaceholder}>
                  <span>🍽️</span>
                </div>
              )}
              {dish.popular && (
                <span className={styles.popularBadge}>Popular</span>
              )}
            </div>
            
            <div className={styles.dishInfo}>
            <div className={styles.nameAndPrice}>
              <h3 className={styles.dishName}>{dish.name}</h3>
              <span className={styles.dishPrice}>${dish.price.toFixed(2)}</span>
            </div>
              <p className={styles.dishDescription}>{dish.description}</p>
              
              <div className={styles.dishFooter}>
                <button 
                  className={styles.addButton}
                  onClick={() => addToCart({
                    id: dish.id,
                    name: dish.name,
                    price: dish.price,
                    description: dish.description,
                    imageUrl: dish.image
                  })}
                >
                  Odenar Ahora
                </button>
              </div>

              {/* Dietary Icons */}
              <div className={styles.dietaryIcons}>
                {dish.vegetarian && <span className={styles.dietaryIcon} title="Vegetariano">🥬</span>}
                {dish.vegan && <span className={styles.dietaryIcon} title="Vegano">🌱</span>}
                {dish.glutenFree && <span className={styles.dietaryIcon} title="Sin Gluten">🌾</span>}
                {dish.spicy && <span className={styles.dietaryIcon} title="Picante">🌶️</span>}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Cart Button */}
      <div className={styles.linkButton}>
           <Link 
                to="/" 
                className={`${styles.navIconLink} ${
                isActive("/") ? styles.activeNavIcon : ""
                }`}
                title="Inicio"
                >
                <span className={styles.iconHome}>🏠</span>
                <span className={styles.navIconLabelHome}>Inicio</span>
          </Link>

        <button 
                className={styles.cartButton}
                onClick={() => navigate("/cart")}
        >
               🛒 Ver Carrito ({cartItemCount})
        </button>

      </div>
    </div>
  );
}