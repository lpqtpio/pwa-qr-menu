import { CartProvider } from "./context/CartContext.tsx";
import Dashboard from "./pages/Dashboard.tsx";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Menu from "./pages/Menu.tsx";
import Cart from "./pages/Cart.tsx";
import Admin from "./pages/Admin.tsx";
import TableEntry from "./pages/TableEntry.tsx";
import CategoryPage from "./pages/CategoryPage";
import "./App.css";

function App() {
   
  return (
    <CartProvider>
      <BrowserRouter>
     
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/menu" element={<Menu />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/table/:tableId" element={<TableEntry />} />
          <Route path="/category/:categoryId" element={<CategoryPage />} />
          <Route path="/categories" element={<Menu />} />
           <Route path="*" element={<div>404 - No route match for: {window.location.pathname}</div>} />
        </Routes>
     
    </BrowserRouter>
    </CartProvider>
  );
}

export default App;