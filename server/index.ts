import express, { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const MONGO_URI = "mongodb+srv://aashugupta5151:<tRYG1lIbmZ0h5efE>@agribid.fs0y5.mongodb.net/?retryWrites=true&w=majority&appName=Agribid";

// Enable Mongoose debugging to log queries
mongoose.set("debug", true);

// MongoDB connection
const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ MongoDB Connected Successfully");
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error);
    process.exit(1);
  }
};
connectDB();

// Middleware to log API requests
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }
      log(logLine);
    }
  });

  next();
});

// Start the server
(async () => {
  try {
    const server = await registerRoutes(app);

    // Global error handler
    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";
      res.status(status).json({ message });
      console.error("❌ Error:", err);
    });

    // Setup Vite in development
    if (app.get("env") === "development") {
      await setupVite(app, server);
    } else {
      serveStatic(app);
    }

    const port = 5000; // No env file, use hardcoded port
    const listener = server.listen(port, () => {
      log(`🚀 Server running on port ${port}`);
    });

    // Graceful shutdown handling
    process.on("SIGINT", async () => {
      console.log("🛑 Graceful shutdown...");
      await mongoose.connection.close();
      console.log("✅ MongoDB connection closed properly.");
      listener.close(() => {
        process.exit(0);
      });
    });
  } catch (error) {
    console.error("❌ Server startup error:", error);
    process.exit(1);
  }
})();