import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Category } from "../../types/menu.types";
import { getCategories } from "../../services/api";
import styles from "./Categories.module.css";

interface CategoriesProps {
  onSelectCategory?: (categoryId: string) => void;
  selectedCategory?: string | null;
}

export default function Categories({ onSelectCategory, selectedCategory }: CategoriesProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const data = await getCategories();
      setCategories(data);
      setError(null);
    } catch (err) {
      setError("Failed to load categories");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryClick = (categoryId: string) => {
    if (onSelectCategory) {
      onSelectCategory(categoryId);
    } else {
      navigate(`/category/${categoryId}`);
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading categories...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <p className={styles.error}>{error}</p>
        <button onClick={fetchCategories} className={styles.retryButton}>
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className={styles.categoriesContainer}>
      <h2 className={styles.title}>Our Menu Categories</h2>
      <div className={styles.categoriesGrid}>
        {categories.map((category) => (
          <div
            key={category.id}
            className={`${styles.categoryCard} ${
              selectedCategory === category.id ? styles.selected : ""
            }`}
            onClick={() => handleCategoryClick(category.id)}
          >
            <div className={styles.imageContainer}>
              {category.image ? (
                <img
                  src={category.image}
                  alt={category.name}
                  className={styles.categoryImage}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/images/placeholder.jpg";
                  }}
                />
              ) : (
                <div className={styles.placeholderImage}>
                  <span className={styles.placeholderIcon}>{category.icon}</span>
                </div>
              )}
              <div className={styles.categoryIcon}>{category.icon}</div>
            </div>
            <div className={styles.categoryInfo}>
              <h3 className={styles.categoryName}>{category.name}</h3>
              <p className={styles.categoryDescription}>{category.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}