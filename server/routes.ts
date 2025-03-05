import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { insertProductSchema, insertContractSchema, insertMessageSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

  // Users
  app.get("/api/users", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ error: "Unauthorized" });
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (err) {
      next(err);
    }
  });

  // Products
  app.get("/api/products", async (req, res, next) => {
    try {
      const products = await storage.getAllProducts();
      res.json(products);
    } catch (err) {
      next(err);
    }
  });

  app.post("/api/products", async (req, res, next) => {
    try {
      console.log("Received request to create product");

      if (!req.isAuthenticated()) {
        console.log("User not authenticated");
        return res.status(401).json({ error: "Please login first" });
      }

      if (!req.user) {
        console.log("req.user is undefined");
        return res.status(401).json({ error: "User information is missing" });
      }

      console.log("User:", req.user);

      if (typeof req.user.role !== "string" || req.user.role !== "farmer") {
        console.log("User is not a farmer");
        return res.status(403).json({ error: "Only farmers can create products" });
      }

      if (typeof req.user.id !== "string") {
        console.log("User ID is missing or invalid");
        return res.status(400).json({ error: "User ID is required" });
      }

      console.log("Request body:", req.body);

      const data = insertProductSchema.safeParse(req.body);
      if (!data.success) {
        console.log("Validation failed:", data.error.format());
        return res.status(400).json({ error: "Invalid product data", details: data.error.format() });
      }

      console.log("Creating product with validated data:", data.data);

      const product = await storage.createProduct({
        ...data.data,
        farmerId: req.user.id,
        status: "available",
      });

      console.log("Product created successfully:", product);
      res.status(201).json(product);
    } catch (err) {
      console.error("Error creating product:", err);
      next(err);
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}