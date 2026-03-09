import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Dish, Category } from "../types/menu.types";
import { getDishesByCategory, getCategories } from "../services/api";
import Dishes from "../components/Dishes/Dishes";
import styles from "./../../src/styles/CategoryPage.module.css";

export default function CategoryPage() {
  const { categoryId } = useParams<{ categoryId: string }>();
  const navigate = useNavigate();
  
  const [category, setCategory] = useState<Category | null>(null);
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [allCategories, setAllCategories] = useState<Category[]>([]);

 // Memoize fetch functions with useCallback
  const fetchCategoryData = useCallback(async () => {
    if (!categoryId) return;
     try {
      setLoading(true);
      const data = await getDishesByCategory(categoryId);
      setCategory(data.category);
      setDishes(data.dishes);
      setError(null);
    } catch (err) {
      setError("Failed to load category dishes");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [categoryId]); // 👈 Depends on categoryId

  const fetchAllCategories = useCallback(async () => {
    try {
      const categories = await getCategories();
      setAllCategories(categories);
    } catch (err) {
      console.error("Failed to load categories:", err);
    }
  }, []); // 👈 No dependencies, runs once

  // Effect for fetching data when categoryId changes
  useEffect(() => {
    if (categoryId) {
      fetchCategoryData();
      fetchAllCategories();
    }
  }, [categoryId, fetchCategoryData, fetchAllCategories]); // 👈 Now includes all dependencies
  const handleCategoryChange = (newCategoryId: string) => {
    navigate(`/category/${newCategoryId}`);
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading delicious dishes...</p>
      </div>
    );
  }

  if (error || !category) {
    return (
      <div className={styles.errorContainer}>
        <p className={styles.error}>{error || "Category not found"}</p>
        <button onClick={() => navigate("/menu")} className={styles.backButton}>
          Back to Menu
        </button>
      </div>
    );
  }


  return (
    <div className={styles.container}>
      {/* Category Navigation */}
      {allCategories.length > 0 && (
        <div className={styles.categoryNav}>
          <div className={styles.categoryNavContent}>
            {allCategories.map((cat) => (
              <button
                key={cat.id}
                className={`${styles.categoryNavButton} ${
                  cat.id === categoryId ? styles.active : ""
                }`}
                onClick={() => handleCategoryChange(cat.id)}
              >
                <span className={styles.categoryNavIcon}>{cat.icon}</span>
                <span className={styles.categoryNavName}>{cat.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Category Hero */}
      <div 
        className={styles.categoryHero}
        style={{
          backgroundImage: category.image ? `url(${category.image})` : "none"
        }}
      >
        <div className={styles.heroOverlay}>
          <div className={styles.heroContent}>
            <h1 className={styles.heroTitle}>{category.name}</h1>
            <p className={styles.heroDescription}>{category.description}</p>
            <span className={styles.dishCount}>{dishes.length} dishes</span>
          </div>
        </div>
      </div>

      {/* Dishes */}
      <div className={styles.dishesWrapper}>
        {dishes.length > 0 ? (
          <Dishes dishes={dishes} showFilters={true} />
        ) : (
          <div className={styles.noDishes}>
            <p>No dishes available in this category yet.</p>
            <button onClick={() => navigate("/menu")} className={styles.browseButton}>
              Browse Other Categories
            </button>
          </div>
        )}
      </div>
    </div>
  );
}