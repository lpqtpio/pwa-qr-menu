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
      <div className={styles.firstBlock}>
           <img 
             className={styles.imageBackground} 
             src={backgroundImage}
             alt="img Italian Restaurant"
                 
          />
          <h1>Restaurant Rissoto 
            <br />
              <span className={styles.bienvenido}>
              ¡Bienvenid@...!
              </span>
          </h1>
      </div>
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
           VER EL MENÚ
          </button>
      </div>
    </div>
   
  );
}