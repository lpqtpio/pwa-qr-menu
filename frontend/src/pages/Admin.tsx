import { useState, useEffect } from "react";
import { QRCodeCanvas } from "qrcode.react";

interface Table {
  _id: string;
  number: number;
  createdAt?: string;
  updatedAt?: string;
}

const Admin = () => {
   const [tables, setTables] = useState<Table[]>([]);
   const [tableNumber, setTableNumber] = useState(""); // Changed from newTable
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState("");

  const BASE_URL = window.location.origin;

  
  useEffect(() => {
    fetchTables();
  }, []);

   const fetchTables = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/tables");
      if (!res.ok) throw new Error("Failed to fetch tables");
      const data = await res.json();
      setTables(data);
    } catch (err) {
      setError("Error loading tables");
      console.error(err);
    }
  };

  const createTable = async () => {
    if (!tableNumber) {
      setError("Please enter a table number");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("http://localhost:5000/api/tables", {
        method: "POST",
        headers: { "Content-Type": "application/json"},
        body: JSON.stringify({ number: parseInt(tableNumber) }), 
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to create table");
      }

      const data = await res.json();
      setTables(prev => [...prev, data]);
      setTableNumber(""); 
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Error creating table";
      setError(errorMessage);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getTableUrl = (tableNumber: number) => {
    return `${BASE_URL}/table/${tableNumber}`;
  };

  return (
    <div style={{ padding: 20, maxWidth: 800, margin: "0 auto" }}>
      <h1>Admin Panel - QR Code Generator</h1>

      <div style={{ marginBottom: 30, padding: 20, border: "1px solid #ddd", borderRadius: 8 }}>
        <h3>Create New Table</h3>
        
        <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
          <input
            value={tableNumber}
            onChange={e => setTableNumber(e.target.value)}
            placeholder="Enter table number (e.g., 1, 2, 3...)"
            type="number"
            min="1"
            style={{ 
              padding: 8, 
              flex: 1,
              borderRadius: 4,
              border: "1px solid #ccc"
            }}
          />
          <button 
            onClick={createTable}
            disabled={loading}
            style={{
              padding: "8px 16px",
              backgroundColor: "#4CAF50",
              color: "white",
              border: "none",
              borderRadius: 4,
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.6 : 1
            }}
          >
            {loading ? "Creating..." : "Create Table"}
          </button>
        </div>
        
        {error && (
          <p style={{ color: "red", margin: "5px 0" }}>{error}</p>
        )}
      </div>

      <hr style={{ margin: "30px 0" }} />

      <h3>Generated QR Codes ({tables.length})</h3>

      {tables.length === 0 ? (
        <p style={{ color: "#666", fontStyle: "italic" }}>
          No tables yet. Create your first table above!
        </p>
      ) : (
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
          gap: 20 
        }}>
          {tables.map((table) => {
            const tableUrl = getTableUrl(table.number);
            
            return (
              <div 
                key={table._id} 
                style={{ 
                  border: "1px solid #ddd", 
                  borderRadius: 8,
                  padding: 20,
                  textAlign: "center"
                }}
              >
                <h4 style={{ marginTop: 0 }}>Table {table.number}</h4>
                
                <div style={{ 
                  background: "#f9f9f9", 
                  padding: 20,
                  borderRadius: 4,
                  marginBottom: 10
                }}>
                  <QRCodeCanvas
                    value={tableUrl}
                    size={180}
                    level="H" 
                    includeMargin={true}
                  />
                </div>
                
                <p style={{ 
                  fontSize: 12, 
                  wordBreak: "break-all",
                  background: "#eee",
                  padding: 8,
                  borderRadius: 4
                }}>
                  {tableUrl}
                </p>
                
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(tableUrl);
                    alert("URL copied to clipboard!");
                  }}
                  style={{
                    padding: "5px 10px",
                    backgroundColor: "#2196F3",
                    color: "white",
                    border: "none",
                    borderRadius: 4,
                    cursor: "pointer",
                    fontSize: 12
                  }}
                >
                  Copy URL
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
export default Admin;