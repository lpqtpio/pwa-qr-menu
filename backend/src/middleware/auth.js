import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../../../api/lib/config.js";

export const protect = (req, res, next) => {
  const auth = req.headers.authorization;

  if (!auth) return res.status(401).json({ message: "Unauthorized" });

  const token = auth.split(" ")[1];

  try {
    jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }
};
