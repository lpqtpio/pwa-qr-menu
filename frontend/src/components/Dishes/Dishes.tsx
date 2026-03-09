import { useState } from "react";
import { Dish, FilterOptions } from "../../types/menu.types";
import { useCart } from "../../hooks/useCart";
import styles from "../../../src/styles/Dishes.module.css";

interface DishesProps {
  dishes: Dish[];
  categoryName?: string;
  showFilters?: boolean;
}

export default function Dishes({ dishes, categoryName, showFilters = true }: DishesProps) {
  const { addToCart } = useCart();
  const [filters, setFilters] = useState<FilterOptions>({});
  const [selectedDish, setSelectedDish] = useState<Dish | null>(null);
  const [showModal, setShowModal] = useState(false);

  const filterOptions: (keyof FilterOptions)[] = [
    "vegetarian",
    "vegan",
    "glutenFree",
    "spicy",
    "popular",
  ];

  const toggleFilter = (filter: keyof FilterOptions) => {
    setFilters(prev => ({
      ...prev,
      [filter]: !prev[filter]
    }));
  };

  const filteredDishes = dishes.filter(dish => {
    if (filters.vegetarian && !dish.vegetarian) return false;
    if (filters.vegan && !dish.vegan) return false;
    if (filters.glutenFree && !dish.glutenFree) return false;
    if (filters.spicy && !dish.spicy) return false;
    if (filters.popular && !dish.popular) return false;
    if (filters.maxPrice && dish.price > filters.maxPrice) return false;
    return true;
  });

  const handleDishClick = (dish: Dish) => {
    setSelectedDish(dish);
    setShowModal(true);
  };

  const handleAddToCart = (dish: Dish) => {
    addToCart({
      id: dish.id,
      name: dish.name,
      price: dish.price,
      description: dish.description,
      imageUrl: dish.image
    });
    setShowModal(false);
  };

  const getDietaryIcons = (dish: Dish) => {
    const icons = [];
    if (dish.vegetarian) icons.push({ icon: "🥬", label: "Vegetarian" });
    if (dish.vegan) icons.push({ icon: "🌱", label: "Vegan" });
    if (dish.glutenFree) icons.push({ icon: "🌾", label: "Gluten Free" });
    if (dish.spicy) icons.push({ icon: "🌶️", label: "Spicy" });
    if (dish.popular) icons.push({ icon: "⭐", label: "Popular" });
    return icons;
  };

  return (
    <div className={styles.dishesContainer}>
      {categoryName && (
        <h2 className={styles.categoryTitle}>{categoryName}</h2>
      )}

      {showFilters && dishes.length > 0 && (
        <div className={styles.filtersBar}>
          <span className={styles.filtersLabel}>Filters:</span>
          <div className={styles.filterButtons}>
            {filterOptions.map(filter => (
              <button
                key={filter}
                className={`${styles.filterButton} ${filters[filter] ? styles.active : ""}`}
                onClick={() => toggleFilter(filter)}
              >
                {filter === "vegetarian" && "🥬 Veg"}
                {filter === "vegan" && "🌱 Vegan"}
                {filter === "glutenFree" && "🌾 GF"}
                {filter === "spicy" && "🌶️ Spicy"}
                {filter === "popular" && "⭐ Popular"}
              </button>
            ))}
          </div>
        </div>
      )}

      {filteredDishes.length === 0 ? (
        <div className={styles.noResults}>
          <p>No dishes match your filters</p>
          <button 
            className={styles.clearFilters}
            onClick={() => setFilters({})}
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className={styles.dishesGrid}>
          {filteredDishes.map((dish) => {
            const dietaryIcons = getDietaryIcons(dish);
            
            return (
              <div
                key={dish.id}
                className={styles.dishCard}
                onClick={() => handleDishClick(dish)}
              >
                <div className={styles.dishImageContainer}>
                  {dish.image ? (
                    <img
                      src={dish.image}
                      alt={dish.name}
                      className={styles.dishImage}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/images/placeholder.jpg";
                      }}
                    />
                  ) : (
                    <div className={styles.dishPlaceholder}>
                      <span className={styles.dishPlaceholderIcon}>🍽️</span>
                    </div>
                  )}
                  {dish.popular && (
                    <span className={styles.popularBadge}>Popular</span>
                  )}
                </div>
                
                <div className={styles.dishInfo}>
                  <div className={styles.dishHeader}>
                    <h3 className={styles.dishName}>{dish.name}</h3>
                    <span className={styles.dishPrice}>${dish.price.toFixed(2)}</span>
                  </div>
                  
                  <p className={styles.dishDescription}>{dish.description}</p>
                  
                  {dietaryIcons.length > 0 && (
                    <div className={styles.dietaryIcons}>
                      {dietaryIcons.map((item, index) => (
                        <span
                          key={index}
                          className={styles.dietaryIcon}
                          title={item.label}
                        >
                          {item.icon}
                        </span>
                      ))}
                    </div>
                  )}
                  
                  <button 
                    className={styles.addButton}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddToCart(dish);
                    }}
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Dish Details Modal */}
      {showModal && selectedDish && (
        <div className={styles.modalOverlay} onClick={() => setShowModal(false)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <button 
              className={styles.modalClose}
              onClick={() => setShowModal(false)}
            >
              ×
            </button>
            
            <div className={styles.modalImageContainer}>
              {selectedDish.image ? (
                <img
                  src={selectedDish.image}
                  alt={selectedDish.name}
                  className={styles.modalImage}
                />
              ) : (
                <div className={styles.modalPlaceholder}>
                  <span>🍽️</span>
                </div>
              )}
            </div>
            
            <div className={styles.modalBody}>
              <h2 className={styles.modalTitle}>{selectedDish.name}</h2>
              <p className={styles.modalDescription}>{selectedDish.description}</p>
              
              <div className={styles.modalDetails}>
                <div className={styles.modalPrice}>
                  <span className={styles.modalPriceLabel}>Price:</span>
                  <span className={styles.modalPriceValue}>
                    ${selectedDish.price.toFixed(2)}
                  </span>
                </div>
                
                {selectedDish.ingredients && selectedDish.ingredients.length > 0 && (
                  <div className={styles.modalIngredients}>
                    <h3>Ingredients:</h3>
                    <div className={styles.ingredientsList}>
                      {selectedDish.ingredients.map((ingredient, index) => (
                        <span key={index} className={styles.ingredientTag}>
                          {ingredient}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className={styles.modalDietary}>
                  {selectedDish.vegetarian && (
                    <span className={styles.dietaryTag}>🥬 Vegetarian</span>
                  )}
                  {selectedDish.vegan && (
                    <span className={styles.dietaryTag}>🌱 Vegan</span>
                  )}
                  {selectedDish.glutenFree && (
                    <span className={styles.dietaryTag}>🌾 Gluten Free</span>
                  )}
                  {selectedDish.spicy && (
                    <span className={styles.dietaryTag}>🌶️ Spicy</span>
                  )}
                </div>
              </div>
              
              <button
                className={styles.modalAddButton}
                onClick={() => handleAddToCart(selectedDish)}
              >
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}