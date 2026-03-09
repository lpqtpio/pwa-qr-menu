import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { useCart } from "../../hooks/useCart";
import styles from "../../../src/styles/Layout.module.css";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const { cart, table } = useCart();
  
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  
  const isActive = (path: string) => location.pathname === path;

  return (
    <div className={styles.layout}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.navIcons}>
            <Link 
              to="/" 
              className={`${styles.navIconLink} ${isActive("/") ? styles.activeNavIcon : ""}`}
              title="Home"
            >
              <span className={styles.iconHome}>🏠</span>
              <span className={styles.navIconLabelHome}>Inicio</span>
            </Link>
            
            <Link 
              to="/menu" 
              className={`${styles.navIconLink} ${isActive("/menu") ? styles.activeNavIcon : ""}`}
              title="Menu"
            >
              <span className={styles.iconMenu}>📋</span>
              <span className={styles.navIconLabelMenu}>Menú</span>
            </Link>

              {table && (
              <div className={styles.tableInfo}>
                  <span className={styles.tableIcon}>🍽️</span> 
                <span className={styles.mesaText}>Mesa {table}</span>
              </div>
            )}
           
             <Link to="/cart" className={styles.cartIcon} title="Cart">
              🛒
              {cartItemCount > 0 && (
                <span className={styles.cartBadge}>{cartItemCount}</span>
              )}
            </Link>
          </div>
        </div>




      </header>

      <main className={styles.main}>
        {children}
      </main>
    </div>
  );
}