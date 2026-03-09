import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useCart } from "../hooks/useCart.ts";

export default function TableEntry() {
  const { tableId } = useParams();
  const navigate = useNavigate();
  const { setTable } = useCart();

  useEffect(() => {
    if (tableId) {
      setTable(tableId);
      navigate("/menu");
    }else {
      navigate("/");
    }
  }, [tableId, setTable, navigate]);

  return (
     <p>Loading menu for table {tableId || "..."}</p>
  );
}