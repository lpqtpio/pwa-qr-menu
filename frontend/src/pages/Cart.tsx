import { useCart } from "../hooks/useCart";
import styles from "./../../src/styles/Cart.module.css";

export default function Cart() {
  const { cart, subtotal, tax, total, clearCart, setTable, table} = useCart();

  const sendWhatsApp = () => {
    const message = cart
      .map((i) => `${i.item.name} x${i.quantity}`)
      .join("\n");

    const finalMessage = `
    Table: ${table ?? "Not specified"}
    Order:
    ${message}

    Subtotal: $${subtotal.toFixed(2)}
    Tax: $${tax.toFixed(2)}
    Total: $${total.toFixed(2)}
    `;

    const phone = "593996752710";
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(
      finalMessage
    )}`;

    window.open(url, "_blank");
    clearCart();
    setTable(null);

    alert("Su orden ha sido confirmada por WhatsApp. Gracias por su compra..!");
  };
  
     const goToMenu = () => {
    window.location.href = "/menu";
  };

  return (
      <div className={styles.container}>
      <h2>Su Carta</h2>

      {cart.length === 0 ? (
        <div className={styles.emptyCart}>
          <p>Su carrito está vacío</p>
          <button onClick={goToMenu}>
            Ver Menú
          </button>
        </div>
      ) : (
        <>
          {cart.map((i) => (
            <div key={i.item.id} className={styles.cartItem}>
              <span>{i.item.name} x{i.quantity}</span>
              <span>${(i.item.price * i.quantity).toFixed(2)}</span>
            </div>
          ))}

          <hr />

          <div className={styles.summary}>
            <p>Subtotal: <span>${subtotal.toFixed(2)}</span></p>
            <p>Tax (15%): <span>${tax.toFixed(2)}</span></p>
            <h3>Total: <span>${total.toFixed(2)}</span></h3>
          </div>

          <button 
            onClick={sendWhatsApp}
            className={styles.whatsappButton}
          >
            Confirmar por WhatsApp
          </button>
        </>
      )}
    </div>
  );
}