import { useNavigate } from "react-router-dom";
import { useCart } from "../hooks/useCart";
import { useState } from "react";
import styles from "./../../src/styles/Dashboard.module.css";
import backgroundImage from "../assets/images/italian1.jpg";

export default function Dashboard() {
   const navigate = useNavigate();
   const { setTable } = useCart();
   const [tableInput, setTableInput] = useState("");

   const handleViewMenu = () => {
    if (tableInput) {
      console.log("Setting table:", tableInput);
      setTable(tableInput);
      navigate("/menu");
    } else {
      alert("Por favor escriba el número de Mesa");
    }
  };

  return (
    <div className={styles.container}>
      <img 
          className={styles.imageBackground} 
          src={backgroundImage}
          alt="img Italian Restaurant"
                 
        />
      <h1>Restaurant Rissoto Bién Venido..!</h1>
      <div className={styles.inputWrapper}>
        <h3>Escriba el número de Mesa:</h3>
          <input
            type="number"
            value={tableInput}
            onChange={(e) => setTableInput(e.target.value)}
            placeholder="Número de mesa aquí..."
            className={ styles.input }
          />
          <button 
            onClick={handleViewMenu}
            className={styles.button}
          >
            Menú
          </button>
      </div>
    </div>
   
  );
}