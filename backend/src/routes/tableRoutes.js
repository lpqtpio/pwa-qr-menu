import { Router } from "express";
import Table from "../../../api/models/Table.js";
import { protect } from "../middleware/auth.js";

const router = Router();

let tables = []; 

router.get("/", protect, async (req, res) => {
  try{
  const tables = await Table.find().sort({ number: 1 });
  res.json(tables);
   } catch (error) {
    res.status(500).json({ message: "Error fetching tables" })
   };
});

router.post("/", protect, async (req, res) => {
  const { number } = req.body;
  
  if (!number) {
    return res.status(400).json({ message: "Table number required" });
  }

  try {
    const newTable = await Table.create({ number });
    res.status(201).json(newTable);
  } catch (error) {
    res.status(400).json({ message: "Table already exists" });
  }
});

export default router;