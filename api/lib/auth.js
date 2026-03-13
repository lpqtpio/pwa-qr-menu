import jwt from "jsonwebtoken";
import { JWT_SECRET } from "./config.js";

export const protect = (req, res, next) => {
  const auth = req.headers.authorization;

  if (!auth) return res.status(401).json({ message: "Unauthorized No token provided" });

  const token = auth.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token " });
  }
};
